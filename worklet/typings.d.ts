
declare class AudioWorkletProcessor {
    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: { [name: string]: Float32Array }): boolean;
  }
  
  declare function registerProcessor(name: string, impl: any): void;

