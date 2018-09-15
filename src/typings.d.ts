

declare module '!raw-loader!*' {
  const contents: string
  export = contents
}

declare module '!file-loader!*' {
  const contents: string
  export = contents
}

declare module 'tone';

declare interface IDisposable {
  dispose(): void;
}