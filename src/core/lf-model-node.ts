import MainAudio from "./main-audio";

export default class LfModelNode extends AudioWorkletNode {

    constructor(mainAudio: MainAudio, waveformRequestHandler: (newWaveform: ILfWaveform) => void) {
        super(mainAudio.audioContext, "lf-model-processor");
        this.port.onmessage = (msg) => waveformRequestHandler(msg.data);
    }

    public requestWaveform(nbSamples: number): void {
        this.port.postMessage(nbSamples);
    }

    public getFrequency = (): AudioParam => this.parameters.get("frequency");
    public getShapeParam = (): AudioParam => this.parameters.get("shapeParam");
    public getAspiration = (): AudioParam => this.parameters.get("aspiration");
}
