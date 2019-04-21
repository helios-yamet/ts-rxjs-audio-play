/**
 * Couple of additional type definitions (to cover for incomplete typings
 * here and there, and more generally just to make Typescript happy).
 */

declare module '!raw-loader*' {
  const contents: string;
  export default contents;
}

declare module '!file-loader*' {
  const contents: string;
  export = contents;
}

declare module 'tone';

declare interface IDisposable {
  dispose(): void;
}

interface AudioParamMap {
  get(param: string): AudioParam;
}

declare class AudioWorkletProcessor {
  public port: MessagePort;
  public process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: { [name: string]: Float32Array }): boolean;
}

declare function registerProcessor(name: string, impl: any): void;

declare interface ProcessorParams {
  name: string;
  defaultValue: number;
  minValue?: number;
  maxValue?: number;
}

declare interface ISynthControl {
  value: number;
  min: number;
  max: number;
  display: ((v: number) => string) | undefined;
  midiMapMode: boolean;
  midiLearning: boolean;
  midiMappedTo: string | undefined;
  setValueByRatio(value: number);
}

declare interface ILfWaveform {
  tp: number;
  te: number;
  ta: number;
  tc: number;
  values: number[];
}
