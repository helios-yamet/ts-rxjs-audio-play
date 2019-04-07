import "./panel.css";
import template from "!raw-loader!./panel.html";
import * as $ from "jquery";
import InputController from "../core/input-controller";
import Knob from "./knob";

const TEMPLATE_KNOB_ID: string = "##ID##";
const TEMPLATE_LABEL: string = "##LABEL##";

interface IKnobDefinition {
    id: string;
    name: string;
    minValue: number;
    maxValue: number;
    initValue: number;
    displayValue?: (value: number) => string;
}

export default class Panel implements IDisposable {

    public id: string;
    public knobs: Knob[];
    private inputController: InputController;

    constructor(
        containerId: string,
        id: string,
        label: string,
        knobDefinitions: IKnobDefinition[],
        inputController: InputController) {

        this.id = id;

        // render panel container
        let renderedTemplate: string = template
            .replace(new RegExp(TEMPLATE_KNOB_ID, "g"), id)
            .replace(new RegExp(TEMPLATE_LABEL), label);
        $(`#${containerId}`).append(renderedTemplate);

        // create and register knobs
        this.knobs = [];
        this.inputController = inputController;
        knobDefinitions.forEach((d) => {

            let knob: Knob = new Knob(
                `${this.id}-knobs`, `${this.id}-${d.id}`, d.name,
                d.minValue, d.maxValue, d.initValue,
                d.displayValue ? d.displayValue : (value: number) => `${value}`,
                this.inputController.selectKnob);

            this.knobs.push(knob);
            this.inputController.registerKnob(knob);
        });
    }

    dispose(): void {
        this.knobs.forEach((k) => k.dispose());
    }
}