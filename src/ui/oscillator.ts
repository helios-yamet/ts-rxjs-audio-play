import "./oscillator.css";

import * as template from "!raw-loader!./oscillator.html";
import * as $ from "jquery";
import Knob from "./knob";
import InputController from "../core/input-controller";

const TEMPLATE_KNOB_ID: string = "##ID##";
const TEMPLATE_LABEL: string = "##LABEL##";

export default class Oscillator implements IDisposable {

    public id: string;
    public input: Knob;
    public amplitude: Knob;

    private inputController: InputController;

    constructor(
        containerId: string,
        id: string,
        label: string,
        inputController: InputController) {

        this.id = id;
        this.inputController = inputController;

        // render oscillator container
        let renderedTemplate: string = template
            .replace(new RegExp(TEMPLATE_KNOB_ID, "g"), id)
            .replace(new RegExp(TEMPLATE_LABEL), label);
        $(`#${containerId}`).append(renderedTemplate);

        // create knobs
        this.input = new Knob(
            `${this.id}-knobs`, `${this.id}-freq`, `input`,
            0, 100, 0,
            (value:number) => `${value}`,
            this.inputController.selectKnob);

        this.amplitude = new Knob(
            `${this.id}-knobs`, `${this.id}-amp`, `Amplitude`,
            0, 100, 0,
            (value:number) => `${value}`,
            this.inputController.selectKnob);

        // register knobs
        this.inputController.registerKnob(this.input);
        this.inputController.registerKnob(this.amplitude);
    }

    dispose(): void {
        this.input.dispose();
        this.amplitude.dispose();
    }
}