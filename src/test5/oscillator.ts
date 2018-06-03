import "./oscillator.css";

import * as Rx from "rxjs/Rx";
import * as template from "!raw-loader!./oscillator.html";
import * as $ from "jquery";
import Knob from "./knob";
import InputController from "./inputController";

const TEMPLATE_KNOB_ID: string = "##ID##";
const TEMPLATE_LABEL: string = "##LABEL##";

export default class Oscillator implements IDisposable {

    public id: string;
    private label: string;

    private frequency: Knob;
    private amplitude: Knob;

    private inputController: InputController;

    constructor(
        containerId: string,
        id: string,
        label: string,
        inputController: InputController) {

        this.id = id;
        this.label = label;
        this.inputController = inputController;

        // render oscillator container
        let renderedTemplate: string = template
            .replace(new RegExp(TEMPLATE_KNOB_ID, "g"), id)
            .replace(new RegExp(TEMPLATE_LABEL), label);
        $(`#${containerId}`).append(renderedTemplate);

        // create knobs
        this.frequency = new Knob(
            `${this.id}-knobs`, `${this.id}-freq`, `Frequency`,
            20, 20000, 440,
            (value:number) => `${value} Hz`,
            this.inputController.selectKnob);

        this.amplitude = new Knob(
            `${this.id}-knobs`, `${this.id}-amp`, `Amplitude`,
            0, 100, 0,
            (value:number) => `${value}`,
            this.inputController.selectKnob);
    }

    dispose(): void {
        this.frequency.dispose();
        this.amplitude.dispose();
    }
}