import * as Tone from "tone";

import LfModelNode from "./lf-model-node";
import { ModulationEvent } from "./note-handler";
import SoundUnit from "./sound-unit";

export enum Vowel {
    Aaaa,
    Oooo
}

export default class GlottalSynthesizer extends SoundUnit {

    private audioContext: AudioContext;
    private lfModel: LfModelNode;
    private tmpSwitch: any;

    constructor(audioContext: AudioContext, frequency: number, vowel: Vowel) {

        super();

        // build an audio graph starting from native Web Audio
        this.audioContext = audioContext;

        this.lfModel = new LfModelNode(this.audioContext);
        this.lfModel.port.onmessage = (msg) => console.log(`Message from sound processor: ${msg.data}`);
        this.lfModel.getFrequency().setValueAtTime(frequency, audioContext.currentTime);

        // continue the end of the graph on Tone.js
        Tone.setContext(this.audioContext);
        this.tmpSwitch = new Tone.Volume(0);
        let vibrato: any = new Tone.Vibrato({
            maxDelay: 0.005,
            frequency: 5,
            depth: .1,
            type: "sine",
            wet: 1
        });

        let formants: number[][];
        switch (vowel) {
            case Vowel.Aaaa:
                formants = [
                    [600, 0, 60],
                    [1040, -7, 70],
                    [2250, -9, 110],
                    [2450, -9, 120],
                    [2750, -20, 130]];
                break;

            case Vowel.Oooo:
                formants = [
                    [400, 0, 40],
                    [750, -11, 80],
                    [2400, -21, 100],
                    [2600, -20, 120],
                    [2900, -40, 120]];
                break;

            default:
                throw "Cannot lah.";
        }

        formants.forEach((f: number[]) => {
            let formant: AudioNode = this.createFormant(this.tmpSwitch, f[0], f[1], f[2]);
            formant.connect(vibrato);
        });

        let comp: any = new Tone.Compressor(-30, 20);
        let masterVolume: any = new Tone.Volume(10);

        // link it all together
        vibrato.chain(comp, masterVolume);
        masterVolume.toMaster();
    }

    private createFormant(source: AudioNode, freq: number, amp: number, width: number): AudioNode {

        let filter: any = new Tone.Filter({
            type: "bandpass",
            frequency: freq,
            rolloff: -12,
            Q: freq / width // to be verified -> http://www.sengpielaudio.com/calculator-cutoffFrequencies.htm
        });

        let volume: any = new Tone.Volume(amp);

        source.connect(filter);
        filter.connect(volume);

        return volume;
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

    public setVibrato(this: GlottalSynthesizer, amount: number): void {
        // ... todo
    }

    public setFrequency(this: GlottalSynthesizer, frequency: number): void {
        this.lfModel.getFrequency().setValueAtTime(frequency, this.audioContext.currentTime);
    }

    dispose(): void {
        // do some house-keeping here
    }
}