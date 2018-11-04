import * as Tone from "tone";

import LfModelNode from "./lf-model-node";
import { ModulationEvent } from "./note-handler";
import SoundUnit from "./sound-unit";
import FormantDefinitions, { Vowel } from "./formants";
import MainAudio from "./mainAudio";

interface IFormantFilter {
    filter: any;
    volume: any;
}

const NB_FORMANTS: number = 5;

export default class GlottalSynthesizer extends SoundUnit {

    private mainAudio: MainAudio;
    private lfModel: LfModelNode;
    private formantFilters: IFormantFilter[];
    private vibrato: any;

    private sourceSwitch: any;

    constructor(mainAudio: MainAudio, frequency: number, vowel: Vowel) {

        super();

        console.log("Creating a glottal synth");

        // build an audio graph starting from native Web Audio
        this.mainAudio = mainAudio;

        this.lfModel = new LfModelNode(this.mainAudio);
        this.lfModel.port.onmessage = (msg) => console.log(`Message from sound processor: ${msg.data}`);
        this.lfModel.getFrequency().setValueAtTime(frequency, mainAudio.audioContext.currentTime);

        let aspirationNoise: AudioNode = this.createAspirationNoiseNode();
        aspirationNoise.connect(this.lfModel); // then connects to sourceSwitch

        // continue the audio graph on Tone.js (works, somehow)
        Tone.setContext(this.mainAudio.audioContext);
        this.sourceSwitch = new Tone.Gain();

        this.vibrato = new Tone.Vibrato({
            maxDelay: 0.005,
            frequency: 5,
            depth: .1,
            type: "sine",
            wet: 1
        });

        // setup formant filters
        this.formantFilters = [];
        for (let i: number = 0; i < NB_FORMANTS; i++) {

            let filter: any = new Tone.Filter({
                type: "bandpass",
                frequency: 0,
                rolloff: -12,
                Q: 0
            });

            let volume: any = new Tone.Volume(0);
            this.sourceSwitch.chain(filter, volume, this.vibrato);

            this.formantFilters.push({
                filter: filter,
                volume: volume
            });
        }
        this.setVowel(vowel, 0);

        // link it all together
        let comp: any = new Tone.Compressor(-30, 20);
        let masterVolume: any = new Tone.Volume(0);
        this.vibrato.chain(comp, masterVolume);
        this.mainAudio.toMaster(masterVolume);
    }

    private createAspirationNoiseNode(this: GlottalSynthesizer): AudioNode {

        const BUFFER_SIZE: number = this.mainAudio.audioContext.sampleRate * 4;
        let buffer: AudioBuffer = this.mainAudio.audioContext.createBuffer(1, BUFFER_SIZE, this.mainAudio.audioContext.sampleRate);
        let bufferData: Float32Array = buffer.getChannelData(0);
        for (let i: number = 0; i < BUFFER_SIZE; i++) {
            bufferData[i] = Math.random();
        }

        let whiteNoise: AudioBufferSourceNode = this.mainAudio.audioContext.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;

        let aspirationFilter: BiquadFilterNode = this.mainAudio.audioContext.createBiquadFilter();
        aspirationFilter.type = "lowpass";
        aspirationFilter.frequency.value = 1800;
        aspirationFilter.Q.value = 0;

        whiteNoise.connect(aspirationFilter);
        whiteNoise.start();

        return aspirationFilter;
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

    public setAspiration(this: GlottalSynthesizer, amount: number): void {
        this.lfModel.getAspiration().setValueAtTime(amount / 100, this.mainAudio.audioContext.currentTime);
    }

    public setFrequency(this: GlottalSynthesizer, frequency: number): void {
        this.lfModel.getFrequency().setValueAtTime(frequency, this.mainAudio.audioContext.currentTime);
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

    public setVowel(this: GlottalSynthesizer, vowel: Vowel, rampTime?: number): any {

        let i: number = 0;
        const magicFactor: number = 1.2;
        rampTime = rampTime ? rampTime : 0.1;
        FormantDefinitions.formantsFor(vowel, NB_FORMANTS).forEach((f) => {

            let freq: number = f[0];
            let amp: number = f[1]; // ignoring this, in favor of magic factor hack
            let width: number = f[2];
            let filter: IFormantFilter = this.formantFilters[i];
            filter.filter.frequency.exponentialRampTo(freq, rampTime);
            filter.filter.Q.exponentialRampTo(freq / width, rampTime);
            filter.volume.volume.exponentialRampTo(i*magicFactor, rampTime);
            i++;
        });
    }

    dispose(): void {
        // do some house-keeping here
    }
}