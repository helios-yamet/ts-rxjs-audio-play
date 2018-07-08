import "./styles.css";

import * as Rx from "rxjs/Rx";
import * as template from "!raw-loader!./template.html";
import * as $ from "jquery";

import InputController from "./inputController";
import Oscillator from "./oscillator";
import GlobalOutput from "./globalOutput";
import Visualizer from "./visualizer";

export default class Test5 implements IDisposable {

    private inputController: InputController;
    private subscriptions: Rx.Subscription[];
    private audioContext: AudioContext;

    private globalOutput: GlobalOutput;
    private oscillators: Oscillator[];

    constructor() {

        $("#content").html(template);

        this.inputController = new InputController();
        this.audioContext = new AudioContext();
        this.subscriptions = [];

        // global output
        this.globalOutput = new GlobalOutput("global-output-container", "global", "Output", this.inputController);
        var masterGain: GainNode = this.audioContext.createGain();
        masterGain.connect(this.audioContext.destination);
        this.subscriptions.push(this.globalOutput.volume.subscribe((v) => {
            masterGain.gain.setValueAtTime(v / 10, this.audioContext.currentTime);
        }));

        // visualizer
        const analyser: AnalyserNode = this.audioContext.createAnalyser();
        masterGain.connect(analyser);
        let visualizer: Visualizer = new Visualizer("global-output-container", "visualizer", analyser);

        // oscillators
        this.oscillators = [];
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
            gain.connect(masterGain);
            oscillator.start();

            this.subscriptions.push(osc.frequency.subscribe((f) => {
                oscillator.frequency.setValueAtTime(f, this.audioContext.currentTime);
            }));

            this.subscriptions.push(osc.amplitude.subscribe((a) => {
                gain.gain.setValueAtTime(a / 100 / 6, this.audioContext.currentTime);
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