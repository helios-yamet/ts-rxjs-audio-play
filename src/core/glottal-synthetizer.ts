import * as Tone from "tone";

import LfModelNode from "./lf-model-node";
import { ModulationEvent } from "./note-handler";
import SoundUnit from "./sound-unit";

export default class GlottalSynthesizer extends SoundUnit {

    private audioContext: AudioContext;
    private lfModel: LfModelNode;
    private vibrato: any;

    constructor(audioContext: AudioContext, frequency: number) {

        super();

        // build an audio graph starting from native Web Audio
        this.audioContext = audioContext;

        this.lfModel = new LfModelNode(this.audioContext);
        this.lfModel.port.onmessage = (msg) => console.log(`Message from sound processor: ${msg.data}`);
        this.lfModel.getFrequency().setValueAtTime(frequency, audioContext.currentTime);

        // continue the end of the graph on Tone.js
        Tone.setContext(this.audioContext);
        this.vibrato = new Tone.Vibrato({
            maxDelay: 0.005,
            frequency: 5,
            depth: .1,
            type: "sine",
            wet: 1
        });

        let comp: any = new Tone.Compressor(-30, 20);
        let masterVolume: any = new Tone.Volume(0);

        // link it all together
        this.vibrato.chain(comp, masterVolume);
        masterVolume.toMaster();
    }

    public noteOn(this: GlottalSynthesizer): void {
        this.lfModel.connect(this.vibrato);
    }

    public modulate(this: GlottalSynthesizer, modulation: ModulationEvent): void {
        this.lfModel.getShapeParam().setValueAtTime(this.mapRange(modulation.absolute, 0.3, 2.7), 0);
    }

    public noteOff(this: GlottalSynthesizer): void {
        this.lfModel.disconnect();
    }

    dispose(): void {
        // do some house-keeping here
    }
}