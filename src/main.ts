import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import "./index.html";

import * as $ from "jquery";
import * as template from "!raw-loader!./ui/template.html";

import GlottalInput from "./core/glottal-input";
import InputController from "./core/input-controller";
import FormantsInput from "./core/formants-input";
import FunctionPlotter from "./ui/function-plotter";
import LfModelNode, { LfFunction } from "./core/lf-model-node";

export default class Main implements IDisposable {

    private inputController: InputController;
    private input1: FormantsInput;
    private input2: GlottalInput;
    private plot: FunctionPlotter;

    constructor() {

        $("#content").html(template);

        this.inputController = new InputController();
        this.input1 = new FormantsInput("main-controls-container", "formants", this.inputController);
        this.input2 = new GlottalInput("main-controls-container", "glottal", this.inputController);

        // plot the LF-model waveform
        let lf: LfFunction = LfModelNode.waveformFunction(1);
        let labels: string[] = ["Ts", "Tp", "Te", "Tc"];
        this.plot = new FunctionPlotter("main-controls-container", "plotter",
            "LF-Model waveform", lf.f, labels, [0, lf.tp, lf.te, lf.tc]);

        // update the plot
        this.input2.shapeParam$.subscribe((v: number) => {
            lf = LfModelNode.waveformFunction(0.024 * v + 0.3);
            this.plot.updateChart(lf.f, labels, [0, lf.tp, lf.te, lf.tc]);
        });
    }

    dispose(): void {

        this.inputController.dispose();
        this.input1.dispose();
        this.input2.dispose();
    }
}

let currentTest: IDisposable = new Main();

$("#home").on("click", () => {
    currentTest.dispose();
    currentTest = new Main();
});