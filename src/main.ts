import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import "./index.html";

import * as $ from "jquery";
import * as template from "!raw-loader!./ui/template.html";

import Input from "./core/input";
import InputController from "./core/input-controller";

export default class Main implements IDisposable {

    private inputController: InputController;
    private input: Input;

    constructor() {

        $("#content").html(template);

        this.inputController = new InputController();
        this.input = new Input("main-controls-container", "input", this.inputController);
    }

    dispose(): void {

        this.inputController.dispose();
        this.input.dispose();
    }
}

let currentTest: IDisposable = new Main();

$("#home").on("click", () => {
    currentTest.dispose();
    currentTest = new Main();
});