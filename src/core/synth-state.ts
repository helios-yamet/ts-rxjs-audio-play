import Formants from "./formants";

export class SynthControl implements ISynthControl {
    
    public group: string;
    public name: string;
    public value: number;
    public min: number;
    public max: number;
    public display: (v: number) => string;
    public midiMapMode: boolean = false;
    public midiLearning: boolean = false;
    public midiMappedTo: string | undefined;

    constructor(
        group: string,
        name: string,
        value?: number,
        min?: number,
        max?: number
    ) {
        this.group = group;
        this.name = name;
        this.value = value || 0;
        this.min = min || 0;
        this.max = max || 100;
        this.display = (v: number) => `${v} %`;
    }

    public with(display: (v: number) => string): SynthControl {
        this.display = display;
        return this;
    }

    public setValueByRatio(value: number): void {
        this.value = Math.round(value * (this.max - this.min) + this.min);
    }
}

export default class SynthState {
    public shapeParam = new SynthControl("Waveform", "Shape (Rd)", 20).with(
        (v: number) => `${(0.024 * v + 0.3).toFixed(2)}`
    );

    public frequency = new SynthControl(
        "Waveform",
        "Frequency",
        120,
        30,
        450
    ).with((v: number) => `${v} Hz`);

    public aspiration = new SynthControl("Waveform", "Aspiration");

    public vowel = new SynthControl("Waveform", "Formants", 20, 0, 24).with(
        (v: number) => Formants.all[v].name
    );

    public vibAmount = new SynthControl("Vibrato", "Amount", 50);

    public vibFrequency = new SynthControl("Vibrato", "Frequency", 50).with(
        (v: number) => `${(0.09 * v + 1).toFixed(1)} Hz`
    );

    public vibDepth = new SynthControl("Vibrato", "Depth", 10);

    public envAttack = new SynthControl("Envelope", "Attack", 20).with(
        (v: number) => `${40 * v} ms`
    );

    public envDecay = new SynthControl("Envelope", "Decay").with(
        (v: number) => `${40 * v} ms`
    );

    public envSustain = new SynthControl("Envelope", "Sustain", 100);

    public envRelease = new SynthControl("Envelope", "Release", 15).with(
        (v: number) => `${40 * v} ms`
    );

    public getAllControls(): ISynthControl[] {
        return [
            this.envAttack,
            this.envDecay,
            this.envSustain,
            this.envRelease,
            this.shapeParam,
            this.frequency,
            this.aspiration,
            this.vowel,
            this.vibAmount,
            this.frequency,
            this.vibDepth
        ];
    }
}
