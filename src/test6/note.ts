import * as Tone from "tone";

const TREMOLO_MIN_FREQ: number = 1.0;
const TREMOLO_MAX_FREQ: number = 10.0;

export default class Note {

    private synth: any;
    private tremolo: any;

    constructor() {

        this.tremolo = new Tone.Tremolo({
            "frequency" : 10.0,
            "depth" : 1.0,
            "wet" : 1.0
        }).toMaster().start();

        this.synth = new Tone.Synth()
            .connect(this.tremolo);
    }

    public noteOn(this: Note): void {
        this.synth.triggerAttack("C4");
    }

    public modulate(this: Note, value: number): void {

        this.tremolo.frequency.value = TREMOLO_MIN_FREQ + value / 100 * (TREMOLO_MAX_FREQ - TREMOLO_MIN_FREQ);
    }

    public noteOff(this: Note): void {
        this.synth.triggerRelease();
    }
}