import "./styles.css";

import * as Rx from "rxjs/Rx";
import * as template from "!raw-loader!./template.html";
import * as $ from "jquery";

import InputController from "./inputController";
import Oscillator from "./oscillator";

export default class Test5 implements IDisposable {

    private inputController: InputController;
    private oscillators: Oscillator[];
    private subscriptions: Rx.Subscription[];

    private audioContext: AudioContext;

    constructor() {

        $("#content").html(template);

        this.inputController = new InputController();
        this.audioContext = new AudioContext();

        this.oscillators = [];
        this.subscriptions = [];
        for(let i:number = 0; i<6; i++) {

            let osc: Oscillator = new Oscillator(
                "oscillators-container", `osc${i}`, `OSC ${i+1}`,
                this.inputController);

            this.oscillators.push(osc);

            let oscillator: OscillatorNode = this.audioContext.createOscillator();
            oscillator.frequency.setValueAtTime(osc.frequency.getValue(), this.audioContext.currentTime);

            let gain: GainNode = this.audioContext.createGain();
            gain.gain.setValueAtTime(osc.amplitude.getValue(), this.audioContext.currentTime);

            oscillator.connect(gain);
            gain.connect(this.audioContext.destination);
            oscillator.start();

            this.subscriptions.push(osc.frequency.subscribe((f) => {
                oscillator.frequency.setValueAtTime(f, this.audioContext.currentTime);
            }));

            this.subscriptions.push(osc.amplitude.subscribe((a) => {
                gain.gain.setValueAtTime(a / 400, this.audioContext.currentTime);
            }));
        }
    }

    dispose(): void {

        this.inputController.dispose();
        this.oscillators.forEach(o => {
            o.dispose();
        });
        this.subscriptions.forEach(s => {
            s.unsubscribe();
        });
    }
}