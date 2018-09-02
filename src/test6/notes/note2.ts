import * as Tone from "tone";
import { ModulationEvent } from "../noteHandler";

export default class Note2 implements IDisposable {

    private audioContext: AudioContext;
    private oscillatorNode: OscillatorNode;

    constructor(toggle: boolean) {

        this.audioContext = new AudioContext();
        this.oscillatorNode = this.audioContext.createOscillator();
        this.oscillatorNode.frequency.setValueAtTime(0, this.audioContext.currentTime);

        Tone.setContext(this.audioContext);

        let vibrato: any = new Tone.Vibrato({
            maxDelay: 0.1,
            frequency: 100,
            depth: .1,
            type: "sine",
            wet: 1.0
        });

        let tremolo: any = new Tone.Tremolo({
            frequency: 50,
            type: "triangle",
            depth: 1.0,
            spread: 100,
            wet: 1.0
        });

        let comp: any = new Tone.Compressor(-30, 20);
        let masterVolume: any = new Tone.Volume(10);

        this.oscillatorNode.connect(vibrato);
        vibrato.chain(tremolo, comp, masterVolume).toMaster();
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
    }

    private mapRange(this: Note2, value: number, min: number, max: number): number {
        return min + (max - min) * value / 100;
    }

    dispose(): void {
        // do some house-keeping here
    }
}