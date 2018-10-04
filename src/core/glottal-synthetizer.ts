import * as Tone from "tone";

import LfModelNode from "./lf-model-node";
import { ModulationEvent } from "./note-handler";
import SoundUnit from "./sound-unit";
import FormantDefinitions, { Vowel } from "./formants";

interface IFormantFilter {
    filter: any;
    volume: any;
}

const TMP : number = 2; // TODO change this (just tweaking / testing)

export default class GlottalSynthesizer extends SoundUnit {

    private audioContext: AudioContext;
    private lfModel: LfModelNode;
    private formantFilters: IFormantFilter[];
    private vibrato: any;

    private sourceSwitch: any;

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
        this.sourceSwitch = new Tone.Gain();
        let joinGain: any = new Tone.Gain(); // todo check this, might not be needed ...

        let i: number = 0;
        this.formantFilters = [];
        FormantDefinitions.formantsFor(vowel).forEach((f: number[]) => {

            if(i++ === TMP) {
                return;
            }

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

            let volume: any = new Tone.Volume(i*1.2); // TEST --> seems to produce better results than using the amp
            this.sourceSwitch.chain(filter, volume, joinGain);

            // register filter component (so it can be updated)
            this.formantFilters.push({
                filter: filter,
                volume: volume
            });
        });

        this.vibrato = new Tone.Vibrato({
            maxDelay: 0.005,
            frequency: 5,
            depth: .1,
            type: "sine",
            wet: 1
        });

        // link it all together
        let comp: any = new Tone.Compressor(-30, 20);
        let masterVolume: any = new Tone.Volume(0);
        joinGain.chain(this.vibrato, comp, masterVolume);
        masterVolume.toMaster();
    }

    public noteOn(this: GlottalSynthesizer): void {
        this.lfModel.connect(this.sourceSwitch);
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

        const rampTime: number = 0.1;
        let i: number = 0;
        FormantDefinitions.formantsFor(vowel).forEach((f) => {

            if(i === TMP) {
                return;
            }

            let freq: number = f[0];
            let amp: number = f[1];
            let width: number = f[2];
            let filter: IFormantFilter = this.formantFilters[i];
            filter.filter.frequency.exponentialRampTo(freq, rampTime);
            filter.filter.Q.exponentialRampTo(freq / width, rampTime);
            filter.volume.volume.exponentialRampTo(i++ * 1.2, rampTime); // todo not forget to align it here as well ...
        });
    }

    dispose(): void {
        // do some house-keeping here
    }
}