import "./input.css";

import * as Rx from "rxjs/Rx";
import * as template from "!raw-loader!./input.html";
import * as $ from "jquery";
import Knob from "./knob";
import InputController from "./inputController";

const TEMPLATE_KNOB_ID: string = "##ID##";
const TEMPLATE_LABEL: string = "##LABEL##";

export default class Input implements IDisposable {

    public id: string;

    public knob: Knob;

    private inputController: InputController;

    constructor(
        containerId: string,
        id: string,
        label: string,
        inputController: InputController) {

        this.id = id;
        this.inputController = inputController;

        // render input container
        let renderedTemplate: string = template
            .replace(new RegExp(TEMPLATE_KNOB_ID, "g"), id)
            .replace(new RegExp(TEMPLATE_LABEL), label);
        $(`#${containerId}`).append(renderedTemplate);

        // create knob
        this.knob = new Knob(
            `${this.id}-knobs`, `${this.id}-freq`, `Signal`,
            0, 100, 0,
            (value:number) => `${value}`,
            this.inputController.selectKnob);

        // register knobs
        this.inputController.registerKnob(this.knob);
    }

    dispose(): void {
        this.knob.dispose();
    }
}