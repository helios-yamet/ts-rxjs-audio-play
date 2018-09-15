import * as Tone from "tone";

import { ModulationEvent } from "../noteHandler";

export default class Note2 implements IDisposable {

    private audioContext: AudioContext;
    private lfModel: AudioWorkletNode;
    private oscillatorNode: OscillatorNode;

    constructor(audioContext: AudioContext) {

        this.audioContext = audioContext;
        this.oscillatorNode = this.audioContext.createOscillator();
        this.oscillatorNode.frequency.setValueAtTime(0, this.audioContext.currentTime);
        this.lfModel = new AudioWorkletNode(this.audioContext, "lf-model");

        Tone.setContext(this.audioContext);

        let vibrato: any = new Tone.Vibrato({
            maxDelay: .1,
            frequency: 5,
            depth: 10,
            type: "sine",
            wet: 0.5
        });

        let comp: any = new Tone.Compressor(-30, 20);
        let masterVolume: any = new Tone.Volume(0);

        this.oscillatorNode.connect(this.lfModel);
        this.lfModel.connect(vibrato);
        vibrato.chain(comp, masterVolume);
        masterVolume.toMaster();
    }

    public noteOn(this: Note2): void {
        this.oscillatorNode.start();
    }

    public modulate(this: Note2, modulation: ModulationEvent): void {

        this.oscillatorNode.frequency.setValueAtTime(
            this.mapRange(modulation.absolute, 100, 880),
            this.audioContext.currentTime);
    }

    public noteOff(this: Note2): void {
        this.oscillatorNode.stop();
        this.lfModel.disconnect();
    }

    private mapRange(this: Note2, value: number, min: number, max: number): number {
        return min + (max - min) * value / 100;
    }

    dispose(): void {
        // do some house-keeping here
    }
}