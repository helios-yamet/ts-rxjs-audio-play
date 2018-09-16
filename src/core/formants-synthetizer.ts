import * as Tone from "tone";
import { ModulationEvent } from "./note-handler";
import SoundUnit from "./sound-unit";

export enum Vowel {
    Aaaa,
    Oooo
}

/**
 * A simple sound unit able to produce sounds that remotely resemble A's and O's.
 * Using a pulse oscillator with low duty cycle and a bunch of bandpass filters to
 * shape the formants.
 */
export class FormantSynthetizer extends SoundUnit {

    private formants: any[];
    private masterVolume: any;

    constructor(vowel: Vowel) {

        super();

        this.masterVolume = new Tone.Volume(10);

        this.formants = [];
        switch (vowel) {
            case Vowel.Aaaa:
                console.log(`Playing AAAAAAAAaaaaaaaaaaa`);
                this.formants.push(this.createFormant(600, 0, 60));
                this.formants.push(this.createFormant(1040, -7, 70));
                this.formants.push(this.createFormant(2250, -9, 110));
                this.formants.push(this.createFormant(2450, -9, 120));
                this.formants.push(this.createFormant(2750, -20, 130));
                break;

            case Vowel.Oooo:
                console.log(`Playing OOOOOOOOOoooooooooo`);
                this.formants.push(this.createFormant(400, 0, 40));
                this.formants.push(this.createFormant(750, -11, 80));
                this.formants.push(this.createFormant(2400, -21, 100));
                this.formants.push(this.createFormant(2600, -20, 120));
                this.formants.push(this.createFormant(2900, -40, 120));
                break;
        }

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
            width: 0.03
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

    public noteOn(this: FormantSynthetizer): void {
        this.formants.forEach((f) => f.start());
    }

    public modulate(this: FormantSynthetizer, modulation: ModulationEvent): void {
        this.formants.forEach((f) => f.frequency.value = this.mapRange(modulation.absolute, 60, 300));
    }

    public noteOff(this: FormantSynthetizer): void {
        this.formants.forEach((f) => f.stop());
    }

    dispose(): void {
        // do some house-keeping here
    }
}