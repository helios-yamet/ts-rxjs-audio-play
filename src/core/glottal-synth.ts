import lfModule from "!file-loader?name=[name].js!ts-loader?transpileOnly!./lf-model-processor.ts";
import * as Rx from "rxjs/Rx";

import * as Tone from "tone";
import Formants, { Vowel } from "./formants";
import LfModelNode from "./lf-model-node";
import MainAudio from "./main-audio";
import { ModulationEvent } from "./note-handler";
import SoundUnit from "./sound-unit";

interface IFormantFilter {
    filter: any;
    volume: any;
}

const NB_FORMANTS: number = 5;

export default class GlottalSynth extends SoundUnit {

    private mainAudio: MainAudio;

    private initFrequency: number;
    private initVowel: Vowel;
    private lfModel!: LfModelNode;
    private formantFilters!: IFormantFilter[];

    private vibrato: any;
    private envelope: any;

    constructor(mainAudio: MainAudio, frequency: number, vowel: Vowel) {

        super();

        console.log("Creating a glottal synth");

        // build an audio graph starting from native Web Audio
        this.mainAudio = mainAudio;
        this.initFrequency = frequency;
        this.initVowel = vowel;

        // load worklet in audio context
        Rx.Observable.fromPromise(mainAudio.audioContext.audioWorklet.addModule(lfModule))
            .take(1)
            .subscribe(
                () => {
                    console.log(`Worklet processor '${lfModule}' loaded`);
                    this.setupAudioGraph();
                    // this.inputController.setSoundUnit(this.soundUnit);
                },
                (error: any) => console.error(error),
            );
    }

    private setupAudioGraph(): void {

        this.lfModel = new LfModelNode(this.mainAudio);
        this.lfModel.port.onmessage = (msg) => console.log(`Message from sound processor: ${msg.data}`);
        this.lfModel.getFrequency().setValueAtTime(this.initFrequency, this.mainAudio.audioContext.currentTime);

        const aspirationNoise: AudioNode = this.createAspirationNoiseNode();
        aspirationNoise.connect(this.lfModel); // then connects to sourceSwitch

        // continue the audio graph on Tone.js (works, somehow)
        Tone.setContext(this.mainAudio.audioContext);

        this.vibrato = new Tone.Vibrato({
            maxDelay: 0.005,
            frequency: 5,
            depth: .1,
            type: "sine",
            wet: 1,
        });

        // setup formant filters
        this.formantFilters = [];
        for (let i: number = 0; i < NB_FORMANTS; i++) {

            const filter: any = new Tone.Filter({
                type: "bandpass",
                frequency: 0,
                rolloff: -12,
                Q: 0,
            });

            const volume: any = new Tone.Volume(0);
            this.lfModel.connect(filter);
            filter.chain(volume, this.vibrato);

            this.formantFilters.push({
                filter,
                volume,
            });
        }
        this.setVowel(this.initVowel);

        // link it all together
        const gainNode: any = new Tone.Gain();
        this.envelope = new Tone.Envelope({
            attack: .2,
            decay: 0,
            sustain: 1,
            release: .3,
            attackCurve: "exponential",
            releaseCurve: "linear",
        });
        this.envelope.connect(gainNode.gain);

        const comp: any = new Tone.Compressor(-30, 20);
        this.vibrato.chain(comp, gainNode);
        this.mainAudio.toMaster(gainNode);
    }

    public noteOn(this: GlottalSynth): void {
        this.envelope.triggerAttack();
    }

    // ------------>>> TODO move this out, should be part of the inputs (not synth engine)
    // simple modulation which maps to frequency (female voice, starts gluttural and goes softer)
    public modulate(this: GlottalSynth, modulation: ModulationEvent): void {

        if (modulation.firstEvent) {
            this.setVowel(Vowel.A_Soprano);
            this.setVibratoAmount(70);
            this.setVibratoFrequency(30);
            this.setVibratoDepth(20);
        }

        const G: number = 25;
        this.setShapeParam(modulation.absolute > G ? (modulation.absolute - G) / (100 - G) * 100 : 0);
        this.setFrequency(super.mapRange(modulation.absolute, 30, 450));
    }

    public noteOff(this: GlottalSynth): void {
        this.envelope.triggerRelease();
    }

    public setAspiration(this: GlottalSynth, amount: number): void {
        this.lfModel.getAspiration().setValueAtTime(amount / 100, this.mainAudio.audioContext.currentTime);
    }

    public setFrequency(this: GlottalSynth, frequency: number): void {
        this.lfModel.getFrequency().setValueAtTime(frequency, this.mainAudio.audioContext.currentTime);
    }

    public setShapeParam(this: GlottalSynth, rd: number): any {
        this.lfModel.getShapeParam().setValueAtTime(this.mapRange(rd, 0.3, 2.7), 0);
    }

    public setVibratoAmount(this: GlottalSynth, amount: number): void {
        this.vibrato.wet.setValueAtTime(this.mapRange(amount, 0, 1), 0);
    }

    public setVibratoFrequency(this: GlottalSynth, amount: number): void {
        this.vibrato.frequency.setValueAtTime(this.mapRange(amount, 1, 10), 0);
    }

    public setVibratoDepth(this: GlottalSynth, amount: number): void {
        this.vibrato.depth.setValueAtTime(this.mapRange(amount, 0, 1), 0);
    }

    public setEnvelopeAttack(this: GlottalSynth, amount: number): void {
        this.envelope.attack = this.mapRange(amount, 0.1, 2);
    }

    public setEnvelopeDecay(this: GlottalSynth, amount: number): void {
        this.envelope.decay = this.mapRange(amount, 0, 2);
    }

    public setEnvelopeSustain(this: GlottalSynth, amount: number): void {
        this.envelope.sustain = this.mapRange(amount, 0, 1);
    }

    public setEnvelopeRelease(this: GlottalSynth, amount: number): void {
        this.envelope.release = this.mapRange(amount, 0, 3);
    }

    public setVowel(this: GlottalSynth, vowel: Vowel, rampTime?: number): any {

        let i: number = 0;
        const magicFactor: number = 1.2;
        Formants.formantsFor(vowel, NB_FORMANTS).forEach((f) => {

            const freq: number = f[0];
            const amp: number = f[1]; // ignoring this, in favor of magic factor hack
            const width: number = f[2];
            const filter: IFormantFilter = this.formantFilters[i];

            if (rampTime) {
                filter.filter.frequency.exponentialRampTo(freq, rampTime);
                filter.filter.Q.exponentialRampTo(freq / width, rampTime);
                filter.volume.volume.exponentialRampTo(i * magicFactor, rampTime);
            } else {
                filter.filter.frequency.value = freq;
                filter.filter.Q.value = freq / width;
                filter.volume.volume.value = i * magicFactor;
            }
            i++;
        });
    }

    public dispose(): void {
        // do some house-keeping here
    }

    private createAspirationNoiseNode(this: GlottalSynth): AudioNode {

        const BUFFER_SIZE: number = this.mainAudio.audioContext.sampleRate * 4;
        const buffer: AudioBuffer = this.mainAudio.audioContext.createBuffer(
            1, BUFFER_SIZE, this.mainAudio.audioContext.sampleRate);

        const bufferData: Float32Array = buffer.getChannelData(0);
        for (let i: number = 0; i < BUFFER_SIZE; i++) {
            bufferData[i] = Math.random();
        }

        const whiteNoise: AudioBufferSourceNode = this.mainAudio.audioContext.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;

        const aspirationFilter: BiquadFilterNode = this.mainAudio.audioContext.createBiquadFilter();
        aspirationFilter.type = "lowpass";
        aspirationFilter.frequency.value = 1800;
        aspirationFilter.Q.value = 0;

        whiteNoise.connect(aspirationFilter);
        whiteNoise.start();

        return aspirationFilter;
    }
}
