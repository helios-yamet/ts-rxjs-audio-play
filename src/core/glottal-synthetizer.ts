import * as Tone from "tone";

import LfModelNode from "./lf-model-node";
import { ModulationEvent } from "./note-handler";
import SoundUnit from "./sound-unit";

export default class GlottalSynthesizer extends SoundUnit {

    private audioContext: AudioContext;
    private lfModel: LfModelNode;
    private oscillatorNode: OscillatorNode;

    constructor(audioContext: AudioContext) {

        super();

        // build an audio graph starting from native Web Audio
        this.audioContext = audioContext;

        this.oscillatorNode = this.audioContext.createOscillator();
        this.oscillatorNode.frequency.setValueAtTime(0, this.audioContext.currentTime);
        this.lfModel = new LfModelNode(this.audioContext);
        this.lfModel.port.onmessage = (msg) => console.log(`Message from sound processor: ${msg.data}`);

        // continue the end of the graph on Tone.js
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
        this.oscillatorNode.connect(this.lfModel);
        this.lfModel.connect(vibrato);
        vibrato.chain(comp, masterVolume);
        masterVolume.toMaster();
    }

    public noteOn(this: GlottalSynthesizer): void {
        this.oscillatorNode.start();
    }

    public modulate(this: GlottalSynthesizer, modulation: ModulationEvent): void {

        this.oscillatorNode.frequency.setValueAtTime(
            this.mapRange(modulation.absolute, 100, 880),
            this.audioContext.currentTime);

        this.lfModel.getNoiseLevelParam().setValueAtTime(
            this.mapRange(modulation.absolute, 0, 1),
            this.audioContext.currentTime);
    }

    public noteOff(this: GlottalSynthesizer): void {
        console.log("Glottal note off");
        this.oscillatorNode.stop();
        this.lfModel.disconnect();
    }

    dispose(): void {
        // do some house-keeping here
    }
}