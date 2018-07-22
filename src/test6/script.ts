import "./styles.css";

import * as template from "!raw-loader!./template.html";
import * as $ from "jquery";

import InputController from "./inputController";
import Input from "./input";

export default class Test6 implements IDisposable {

    private inputController: InputController;
    private input: Input;

    constructor() {

        $("#content").html(template);

        this.inputController = new InputController();
        this.input = new Input("main-controls-container", "input", "Input", this.inputController);
    }

    dispose(): void {

        this.inputController.dispose();
        this.input.dispose();
    }
}