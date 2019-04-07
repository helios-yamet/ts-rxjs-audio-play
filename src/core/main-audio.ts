import * as Tone from 'tone';

export default class MainAudio {

    public audioContext: AudioContext;
    private fft: any | undefined;

    constructor() {
        this.audioContext = new AudioContext();
    }

    public toMaster(this: MainAudio, audioNode: any): void {

        this.fft = new Tone.FFT(256);
        audioNode.connect(this.fft);
        this.fft.connect(this.audioContext.destination);
    }

    public getFrequencies(): Float32Array {
        return this.fft ? this.fft.getValue() : new Float32Array(0);
    }
}
