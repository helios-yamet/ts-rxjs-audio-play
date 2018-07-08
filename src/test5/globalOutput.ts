import "./globalOutput.css";

import * as Rx from "rxjs/Rx";
import * as template from "!raw-loader!./globalOutput.html";
import * as $ from "jquery";
import Knob from "./knob";
import InputController from "./inputController";

const TEMPLATE_KNOB_ID: string = "##ID##";
const TEMPLATE_LABEL: string = "##LABEL##";

export default class GlobalOutput implements IDisposable {

    public id: string;
    private label: string;

    public volume: Knob;

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
        this.volume = new Knob(
            `${this.id}-knobs`, `${this.id}-vol`, `Volume`,
            0, 100, 0,
            (value:number) => `${value}`,
            this.inputController.selectKnob);

        // register knobs
        this.inputController.registerKnob(this.volume);
    }

    dispose(): void {
        this.volume.dispose();
    }
}