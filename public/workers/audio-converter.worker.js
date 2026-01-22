// Load lamejs from bundled file
// Try multiple paths since worker location can vary
let lamejsLoaded = false;
const pathsToTry = [
    '/workers/lame.min.js', // Absolute path from root
    './lame.min.js', // Relative to worker
];
// If self.location is available, also try with origin
if (typeof self !== 'undefined' && 'location' in self && self.location) {
    try {
        const origin = self.location
            .origin;
        pathsToTry.unshift(`${origin}/workers/lame.min.js`);
    }
    catch {
        // Ignore if location not available
    }
}
for (const path of pathsToTry) {
    try {
        importScripts(path);
        lamejsLoaded = true;
        break;
    }
    catch {
        // Try next path
        continue;
    }
}
if (!lamejsLoaded) {
    throw new Error(`Failed to load lamejs from any of these paths: ${pathsToTry.join(', ')}`);
}
const messageHandler = async (event) => {
    try {
        // Validate event.data exists first
        if (!event || !event.data) {
            throw new Error('Worker received message with no data');
        }
        // Reduced logging for better performance
        const { samples, sampleRate, bitrate, duration } = event.data;
        // Validate input data
        if (!samples) {
            throw new Error('Invalid samples data: samples is undefined or null');
        }
        if (!Array.isArray(samples)) {
            throw new Error(`Invalid samples data: samples is not an array (type: ${typeof samples})`);
        }
        if (samples.length === 0) {
            throw new Error('Invalid samples data: samples array is empty');
        }
        if (!samples[0]) {
            throw new Error('Invalid samples data: first channel (samples[0]) is undefined or null');
        }
        if (!samples[0].length) {
            throw new Error('Invalid samples data: first channel has no length');
        }
        if (!sampleRate || sampleRate <= 0) {
            throw new Error(`Invalid sample rate: ${sampleRate}`);
        }
        self.postMessage({ type: 'progress', phase: 'extracting', percentage: 2 });
        // Convert array samples back to Float32Array, then to Int16Array for MP3 encoding
        // Samples come as regular arrays from postMessage
        const float32Samples = samples.map((channel) => channel instanceof Float32Array ? channel : new Float32Array(channel));
        const channels = float32Samples.length;
        // Processing samples - logging removed for performance
        // Convert to Int16Array - one array per channel
        // lamejs expects separate channel arrays (not interleaved) for stereo
        // Optimized conversion using TypedArray operations for better performance
        const int16Samples = float32Samples.map((channel) => {
            const int16 = new Int16Array(channel.length);
            const length = channel.length;
            // Optimized conversion: avoid branching in hot loop
            // Use bitwise operations and direct multiplication for speed
            for (let i = 0; i < length; i++) {
                const sample = channel[i];
                // Fast path: most samples are in range [-1, 1]
                // Use Math.max/min for clamping, then direct conversion
                const clamped = sample <= -1 ? -1 : sample >= 1 ? 1 : sample;
                int16[i] = clamped * (clamped < 0 ? 0x8000 : 0x7fff);
            }
            return int16;
        });
        // Conversion complete - logging removed for performance
        self.postMessage({ type: 'progress', phase: 'encoding', percentage: 3 });
        // Encode to MP3 using lamejs
        // For stereo: lamejs.encodeBuffer(left, right) expects separate channel arrays
        // For mono: lamejs.encodeBuffer(samples) expects a single array
        const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, bitrate);
        // Validate encoder was created
        if (!mp3encoder) {
            throw new Error('Failed to create MP3 encoder');
        }
        if (typeof mp3encoder.encodeBuffer !== 'function') {
            throw new Error('MP3 encoder missing encodeBuffer method');
        }
        const sampleBlockSize = 1152;
        const mp3Data = [];
        // Validate samples
        if (int16Samples.length === 0 || int16Samples[0].length === 0) {
            throw new Error('No audio samples to encode');
        }
        // Process in chunks - lamejs expects sampleBlockSize samples per channel
        const leftChannel = int16Samples[0];
        const rightChannel = channels > 1 ? int16Samples[1] : undefined;
        const totalChunks = Math.ceil(leftChannel.length / sampleBlockSize);
        // Optimize progress updates - only update every N chunks or every 1% progress
        const PROGRESS_UPDATE_INTERVAL = Math.max(1, Math.floor(totalChunks / 100));
        let lastProgressUpdate = 0;
        // Pre-allocate padding arrays if needed (reuse for last chunk)
        let paddedLeft = null;
        let paddedRight = null;
        for (let i = 0; i < leftChannel.length; i += sampleBlockSize) {
            const remaining = leftChannel.length - i;
            const currentChunkSize = Math.min(sampleBlockSize, remaining);
            const chunkIndex = Math.floor(i / sampleBlockSize) + 1;
            // Update progress less frequently for better performance
            if (chunkIndex % PROGRESS_UPDATE_INTERVAL === 0 ||
                chunkIndex === totalChunks) {
                const progress = Math.floor(((leftChannel.length - remaining) / leftChannel.length) * 100);
                // Only send if progress actually changed
                if (progress !== lastProgressUpdate) {
                    self.postMessage({
                        type: 'progress',
                        phase: 'encoding',
                        percentage: progress,
                    });
                    lastProgressUpdate = progress;
                }
            }
            // Get chunks for each channel using subarray (no copy)
            const leftChunk = leftChannel.subarray(i, i + currentChunkSize);
            const rightChunk = rightChannel
                ? rightChannel.subarray(i, i + currentChunkSize)
                : undefined;
            // Pad last chunk if needed (lamejs might need exact size)
            let leftToEncode;
            let rightToEncode;
            if (currentChunkSize < sampleBlockSize) {
                // Last chunk - reuse padded arrays if available, otherwise create
                if (!paddedLeft) {
                    paddedLeft = new Int16Array(sampleBlockSize);
                }
                paddedLeft.set(leftChunk, 0);
                // Zero out remaining if reusing
                if (paddedLeft.length > currentChunkSize) {
                    paddedLeft.fill(0, currentChunkSize);
                }
                leftToEncode = paddedLeft;
                if (rightChunk) {
                    if (!paddedRight) {
                        paddedRight = new Int16Array(sampleBlockSize);
                    }
                    paddedRight.set(rightChunk, 0);
                    if (paddedRight.length > currentChunkSize) {
                        paddedRight.fill(0, currentChunkSize);
                    }
                    rightToEncode = paddedRight;
                }
            }
            else {
                // Full chunk - use directly (no copy)
                leftToEncode = leftChunk;
                rightToEncode = rightChunk;
            }
            try {
                // Call encodeBuffer with separate channels for stereo
                const mp3buf = channels === 1
                    ? mp3encoder.encodeBuffer(leftToEncode)
                    : mp3encoder.encodeBuffer(leftToEncode, rightToEncode);
                if (mp3buf && mp3buf.length > 0) {
                    mp3Data.push(mp3buf);
                }
            }
            catch (encodeError) {
                console.error(`Error encoding chunk ${chunkIndex} at index ${i}:`, encodeError);
                throw encodeError;
            }
        }
        // Flush remaining data
        const mp3buf = mp3encoder.flush();
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
        // Combine all MP3 chunks - optimized for large arrays
        const totalLength = mp3Data.reduce((sum, arr) => sum + arr.length, 0);
        const mp3Buffer = new Uint8Array(totalLength);
        let offset = 0;
        // Use set() with offset for efficient copying
        for (const chunk of mp3Data) {
            mp3Buffer.set(chunk, offset);
            offset += chunk.length;
        }
        const blob = new Blob([mp3Buffer], { type: 'audio/mpeg' });
        // Validate blob was created successfully
        if (!blob || blob.size === 0) {
            throw new Error('Failed to create MP3 blob or blob is empty');
        }
        // Encoding complete - logging removed for performance
        self.postMessage({
            type: 'complete',
            size: blob.size,
            blob,
            bitrate,
            duration: duration || 0,
        });
    }
    catch (error) {
        console.error('Worker error caught:', error);
        const errorMessage = error instanceof Error
            ? error.message
            : typeof error === 'string'
                ? error
                : String(error);
        console.error('Sending error message to main thread:', {
            type: 'error',
            error: errorMessage,
        });
        self.postMessage({
            type: 'error',
            error: errorMessage,
        });
    }
};
self.addEventListener('message', messageHandler);
// Cleanup support: remove listener if worker is terminated
self.addEventListener('beforeunload', () => {
    self.removeEventListener('message', messageHandler);
});
export {};
