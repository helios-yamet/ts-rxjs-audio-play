import * as Tone from "tone";

import LfModelNode from "./lf-model-node";
import { ModulationEvent } from "./note-handler";
import SoundUnit from "./sound-unit";
import FormantDefinitions, { Vowel } from "./formants";

interface IFormantFilter {
    filter: any;
    volume: any;
    output: any;
}

export default class GlottalSynthesizer extends SoundUnit {

    private audioContext: AudioContext;
    private lfModel: LfModelNode;
    private formantFilters: IFormantFilter[];
    private vibrato: any;

    private tmpSwitch: any;

    constructor(audioContext: AudioContext, frequency: number, vowel: Vowel) {

        super();

        console.log("Creating a glottal synth");

        // build an audio graph starting from native Web Audio
        this.audioContext = audioContext;

        this.lfModel = new LfModelNode(this.audioContext);
        this.lfModel.port.onmessage = (msg) => console.log(`Message from sound processor: ${msg.data}`);
        this.lfModel.getFrequency().setValueAtTime(frequency, audioContext.currentTime);

        // continue the end of the graph on Tone.js
        Tone.setContext(this.audioContext);
        this.tmpSwitch = new Tone.Volume(0);
        this.vibrato = new Tone.Vibrato({
            maxDelay: 0.005,
            frequency: 5,
            depth: .1,
            type: "sine",
            wet: 1
        });

        let i: number = 0;
        this.formantFilters = [];
        FormantDefinitions.formantsFor(vowel).forEach((f: number[]) => {

            // create formant filter
            let freq: number = f[0];
            let amp: number = f[1];
            let width: number = f[2];

            let filter: any = new Tone.Filter({
                type: "bandpass",
                frequency: freq,
                rolloff: -12,
                Q: freq / width
            });

            let volume: any = new Tone.Volume(amp);

            // wire it all together
            let output: any;
            if (i === 0) {
                this.tmpSwitch.connect(filter);
                filter.connect(volume);
                output = volume;
            } else {
                let add: any = new Tone.Add();
                this.formantFilters[i - 1].output.connect(add, 0, 0);
                volume.connect(add, 0, 1);
                output = add;
            }
            i++;

            // register filter component (so it can be updated)
            this.formantFilters.push({
                filter: filter,
                volume: volume,
                output: output
            });
        });

        let comp: any = new Tone.Compressor(-30, 20);
        let masterVolume: any = new Tone.Volume(10);

        console.log(`Vibrato has ${this.vibrato.numberOfInputs} inputs and ${this.vibrato.numberOfOutputs} outputs`);

        // link it all together
        this.formantFilters[this.formantFilters.length - 1].output.chain(this.vibrato, comp, masterVolume);
        masterVolume.toMaster();
    }

    public noteOn(this: GlottalSynthesizer): void {
        this.lfModel.connect(this.tmpSwitch);
    }

    public modulate(this: GlottalSynthesizer, modulation: ModulationEvent): void {
        this.lfModel.getShapeParam().setValueAtTime(this.mapRange(modulation.absolute, 0.3, 2.7), 0);
    }

    public noteOff(this: GlottalSynthesizer): void {
        this.lfModel.disconnect();
    }

    public setFrequency(this: GlottalSynthesizer, frequency: number): void {
        this.lfModel.getFrequency().setValueAtTime(frequency, this.audioContext.currentTime);
    }

    public setShapeParam(this: GlottalSynthesizer, rd: number): any {
        this.lfModel.getShapeParam().setValueAtTime(this.mapRange(rd, 0.3, 2.7), 0);
    }

    public setVibratoAmount(this: GlottalSynthesizer, amount: number): void {
        this.vibrato.wet.setValueAtTime(this.mapRange(amount, 0, 1), 0);
    }

    public setVibratoFrequency(this: GlottalSynthesizer, amount: number): void {
        this.vibrato.frequency.setValueAtTime(this.mapRange(amount, 1, 10), 0);
    }

    public setVibratoDepth(this: GlottalSynthesizer, amount: number): void {
        this.vibrato.depth.setValueAtTime(this.mapRange(amount, 0, 1), 0);
    }

    public setVowel(this: GlottalSynthesizer, vowel: Vowel): any {

        const rampTime: number = 0.5;
        let i: number = 0;
        FormantDefinitions.formantsFor(vowel).forEach((f) => {
            let freq: number = f[0];
            let amp: number = f[1];
            let width: number = f[2];
            let filter: IFormantFilter = this.formantFilters[i++];
            filter.filter.frequency.exponentialRampTo(freq, rampTime);
            filter.filter.Q.exponentialRampTo(freq / width, rampTime);
            filter.volume.volume.exponentialRampTo(amp, rampTime);
        });
    }

    dispose(): void {
        // do some house-keeping here
    }
}