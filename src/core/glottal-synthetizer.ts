import * as Tone from "tone";

import LfModelNode from "./lf-model-node";
import { ModulationEvent } from "./note-handler";
import SoundUnit from "./sound-unit";

export default class GlottalSynthesizer extends SoundUnit {

    private audioContext: AudioContext;
    private lfModel: LfModelNode;

    constructor(audioContext: AudioContext, frequency: number) {

        super();

        // build an audio graph starting from native Web Audio
        this.audioContext = audioContext;

        this.lfModel = new LfModelNode(this.audioContext);
        this.lfModel.port.onmessage = (msg) => console.log(`Message from sound processor: ${msg.data}`);

        console.log(`Setting frequency to '${frequency}'`);
        this.lfModel.getFrequency().setValueAtTime(frequency, audioContext.currentTime);

        /* // continue the end of the graph on Tone.js
        Tone.setContext(this.audioContext);
        let vibrato: any = new Tone.Vibrato({
            maxDelay: .1,
            frequency: 5,
            depth: 10,
            type: "sine",
            wet: 0.5
        });

        let comp: any = new Tone.Compressor(-30, 20);
        let masterVolume: any = new Tone.Volume(0);

        // link it all together
        vibrato.chain(comp, masterVolume);
        masterVolume.toMaster(); */
    }

    public noteOn(this: GlottalSynthesizer): void {
        this.lfModel.connect(this.audioContext.destination);
    }

    public modulate(this: GlottalSynthesizer, modulation: ModulationEvent): void {
        this.lfModel.getShapeParam().setValueAtTime(this.mapRange(modulation.absolute, 0.3, 2.7), 0);
    }

    public noteOff(this: GlottalSynthesizer): void {
        console.log("Glottal note off");
        this.lfModel.disconnect();
    }

    dispose(): void {
        // do some house-keeping here
    }
}