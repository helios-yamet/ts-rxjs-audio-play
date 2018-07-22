

declare module '!raw-loader!*' {
  const contents: string
  export = contents
}

declare module 'tone';

interface IDisposable {
  dispose(): void;
}