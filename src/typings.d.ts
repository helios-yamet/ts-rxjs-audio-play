

declare module '!raw-loader!*' {
  const contents: string
  export = contents
}

interface IDisposable {
  dispose(): void;
}