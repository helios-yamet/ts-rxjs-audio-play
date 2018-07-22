import "./styles.css";

import * as Rx from "rxjs/Rx";
import * as template from "!raw-loader!./template.html";
import * as $ from "jquery";

import InputController from "./inputController";
import GlobalOutput from "./globalOutput";
import Visualizer from "./visualizer";
import Input from "./input";

export default class Test6 implements IDisposable {

    private inputController: InputController;
    private subscriptions: Rx.Subscription[];
    private audioContext: AudioContext;

    private globalOutput: GlobalOutput;
    private visualizer: Visualizer;

    constructor() {

        $("#content").html(template);

        this.inputController = new InputController();
        this.audioContext = new AudioContext();
        this.subscriptions = [];

        let masterGain: GainNode = this.audioContext.createGain();

        // main input signal
        let input: Input = new Input("main-controls-container", "input", "Input", this.inputController);

        // visualizer
        const analyser: AnalyserNode = this.audioContext.createAnalyser();
        masterGain.connect(analyser);
        this.visualizer = new Visualizer("main-controls-container", "visualizer", analyser);

        // global output
        this.globalOutput = new GlobalOutput("main-controls-container", "global", "Output", this.inputController);
        masterGain.connect(this.audioContext.destination);
        this.subscriptions.push(this.globalOutput.volume.subscribe((v) => {
            masterGain.gain.setValueAtTime(v / 10, this.audioContext.currentTime);
        }));
    }

    dispose(): void {

        this.inputController.dispose();
        this.subscriptions.forEach(s => s.unsubscribe());
        this.audioContext.close();

        this.globalOutput.dispose();
        this.visualizer.dispose();
    }
}