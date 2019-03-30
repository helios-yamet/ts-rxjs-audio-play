import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import "./index.html";

import * as $ from "jquery";
import template from "!raw-loader!./ui/template.html";

import GlottalInput from "./core/glottal-input";
import InputController from "./core/input-controller";
import Visualizer from "./ui/visualizer";
import MainAudio from "./core/main-audio";

export default class Main implements IDisposable {

    private inputController: InputController;
    private input: GlottalInput;
    private visualizer: Visualizer;

    constructor() {

        $("#content").html(template);

        let mainAudio: MainAudio = new MainAudio();

        this.visualizer = new Visualizer("header", "visualizer", mainAudio);
        this.inputController = new InputController();
        this.input = new GlottalInput("main-controls-container", "glottal", mainAudio, this.inputController);
    }

    dispose(): void {

        this.inputController.dispose();
        this.input.dispose();
        this.visualizer.dispose();
    }
}

let currentTest: IDisposable = new Main();

$("#home").on("click", () => {
    currentTest.dispose();
    currentTest = new Main();
});