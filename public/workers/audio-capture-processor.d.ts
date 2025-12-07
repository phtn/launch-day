// Type declarations for AudioWorkletProcessor and registerProcessor
// These are available in the AudioWorklet global scope

declare class AudioWorkletProcessor {
  readonly port: MessagePort

  constructor(options?: AudioWorkletNodeOptions)

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters?: Record<string, Float32Array>,
  ): boolean

  static get parameterDescriptors(): AudioParamDescriptor[]
}

declare function registerProcessor(
  name: string,
  processorCtor: new (
    options?: AudioWorkletNodeOptions,
  ) => AudioWorkletProcessor,
): void

interface AudioWorkletNodeOptions {
  numberOfInputs?: number
  numberOfOutputs?: number
  channelCount?: number
  channelCountMode?: ChannelCountMode
  channelInterpretation?: ChannelInterpretation
  processorOptions?: any
}

interface AudioParamDescriptor {
  name: string
  automationRate?: AutomationRate
  minValue?: number
  maxValue?: number
  defaultValue?: number
}
