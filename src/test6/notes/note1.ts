import * as Tone from "tone";
import { ModulationEvent } from "../noteHandler";

export default class Note1 implements IDisposable {

    private formantsA: any[];
    private formantsO: any[];

    private toggle: boolean;

    private masterVolume: any;

    constructor(toggle: boolean) {

        this.toggle = toggle;

        this.masterVolume = new Tone.Volume(10);

        this.formantsA = [];
        this.formantsA.push(this.createFormant(600, 0, 60));
        this.formantsA.push(this.createFormant(1040, -7, 70));
        this.formantsA.push(this.createFormant(2250, -9, 110));
        this.formantsA.push(this.createFormant(2450, -9, 120));
        this.formantsA.push(this.createFormant(2750, -20, 130));

        this.formantsO = [];
        this.formantsO.push(this.createFormant(400, 0, 40));
        this.formantsO.push(this.createFormant(750, -11, 80));
        this.formantsO.push(this.createFormant(2400, -21, 100));
        this.formantsO.push(this.createFormant(2600, -20, 120));
        this.formantsO.push(this.createFormant(2900, -40, 120));

        let vibrato: any = new Tone.Vibrato({
            maxDelay: 0.005,
            frequency: 1,
            depth: 0.1,
            type: "sine",
            wet: 1.0
        });

        let tremolo: any = new Tone.Tremolo({
            frequency: 150,
            type: "triangle",
            depth: 1.0,
            spread: 0,
            wet: 1.0
        });

        let comp: any = new Tone.Compressor(-30, 20);

        this.masterVolume.connect(vibrato);
        vibrato.connect(tremolo);
        tremolo.connect(comp);
        comp.toMaster();
    }

    private createFormant(freq: number, amp: number, width: number): any {

        let osc: any = new Tone.PulseOscillator({
            frequency: 100,
            detune: 0,
            phase: 0,
            width: 0.05
        });

        let filter: any = new Tone.Filter({
            type: "bandpass",
            frequency: freq,
            rolloff: -12,
            Q: 15,
            gain: 15
        });

        let volume: any = new Tone.Volume(amp);

        osc.connect(filter);
        filter.connect(volume);
        volume.connect(this.masterVolume);

        return osc;
    }

    private getFormants(this: Note1): any[] {
        return this.toggle
            ? this.formantsA
            : this.formantsO;
    }

    public noteOn(this: Note1): void {
        console.log(`Playing ${this.toggle ? "AAAAAAAAaaaaaaaaaaa" : "OOOOOOOOOoooooooooo"}`);
        this.getFormants().forEach(f => f.start());
    }

    public modulate(this: Note1, modulation: ModulationEvent): void {
        this.getFormants().forEach(f => f.frequency.value = this.mapRange(modulation.absolute, 60, 300));
    }

    public noteOff(this: Note1): void {
        this.getFormants().forEach(f => f.stop());
    }

    private mapRange(this: Note1, value: number, min: number, max: number): number {
        return min + (max - min) * value / 100;
    }

    dispose(): void {
        // do some house-keeping here
    }
}