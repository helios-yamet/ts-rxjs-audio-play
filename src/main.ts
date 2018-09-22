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
        this.input1= new FormantsInput("main-controls-container", "formants", this.inputController);
        this.input2 = new GlottalInput("main-controls-container", "glottal", this.inputController);

        let lf: LfFunction = LfModelNode.waveformFunction(1);
        this.plot = new FunctionPlotter("main-controls-container", "plotter", "Plotter",
            lf.f, ["Ts", "Tp", "Te", "Tc"], [0, lf.tp, lf.te, lf.tc]);
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