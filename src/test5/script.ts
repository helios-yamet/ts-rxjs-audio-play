import "./styles.css";

import * as Rx from "rxjs/Rx";
import * as template from "!raw-loader!./template.html";
import * as $ from "jquery";

import Knob from "./knob";

export default class Test5 implements IDisposable {

    private knobs: Knob[];
    private activeKnob: Knob | undefined;

    constructor() {

        $("#content").html(template);

        this.knobs = [];
        for(let i:number = 0; i<15; i++) {
            let initValue: number = Math.round(Math.random() * 100);
            this.knobs.push(new Knob("knobs-container", `knob${i}`, `Knob ${i}`, initValue, this.selectKnob));
        }
    }

    dispose(): void {
        this.knobs.forEach(knob => {
            knob.dispose();
        });
    }

    selectKnob = (knob: Knob) => {
        if(this.activeKnob) {
            this.activeKnob.markSelection(false);
        }
        this.activeKnob = knob;
        knob.markSelection(true);
    }
}