"use strict";
// AudioWorklet processor for capturing audio from video
// @ts-check
/// <reference path="./audio-capture-processor.d.ts" />
class AudioCaptureProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.channels = [];
        this.channelCount = 0;
        this.sampleRate = 0;
        this.initialized = false;
        this.port.onmessage = this.handleMessage.bind(this);
    }
    /**
     * @param {MessageEvent<{type: string}>} event
     */
    handleMessage(event) {
        if (event.data.type === 'getAudioData') {
            // Convert Float32Arrays to regular arrays for transfer
            const serializedChannels = this.channels.map(
            /** @param {Float32Array[]} channelChunks */
            (channelChunks) => channelChunks.map(
            /** @param {Float32Array} chunk */
            (chunk) => Array.from(chunk)));
            // Send accumulated audio data back to main thread
            this.port.postMessage({
                type: 'finalAudioData',
                channels: serializedChannels,
                channelCount: this.channelCount,
                sampleRate: this.sampleRate,
            });
        }
    }
    process(inputs, outputs) {
        const input = inputs[0];
        if (input.length > 0 && input[0].length > 0) {
            if (!this.initialized) {
                this.channelCount = input.length;
                this.sampleRate = input.sampleRate;
                for (let ch = 0; ch < this.channelCount; ch++) {
                    this.channels.push([]);
                }
                this.initialized = true;
                // Notify main thread that we've initialized
                this.port.postMessage({
                    type: 'initialized',
                    channelCount: this.channelCount,
                    sampleRate: this.sampleRate,
                });
            }
            // Capture audio data from each channel
            for (let ch = 0; ch < this.channelCount; ch++) {
                const inputChannel = input[ch];
                if (inputChannel) {
                    // Copy the Float32Array data
                    const dataCopy = new Float32Array(inputChannel.length);
                    dataCopy.set(inputChannel);
                    this.channels[ch].push(dataCopy);
                }
            }
            // Pass through to output (required for audio to play)
            const output = outputs[0];
            for (let ch = 0; ch < output.length && ch < input.length; ch++) {
                if (input[ch] && output[ch]) {
                    output[ch].set(input[ch]);
                }
            }
        }
        return true; // Keep processor alive
    }
    static get parameterDescriptors() {
        return [];
    }
}
registerProcessor('audio-capture-processor', AudioCaptureProcessor);
