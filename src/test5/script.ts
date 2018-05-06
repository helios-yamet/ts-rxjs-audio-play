import "./styles.css";

import * as Rx from "rxjs/Rx";
import * as template from "!raw-loader!./template.html";
import * as $ from "jquery";

import Knob from "./knob";

export default class Test5 implements IDisposable {

    private knobs: Knob[];

    constructor() {

        $("#content").html(template);

        this.knobs = [];
        for(let i:number = 0; i<30; i++) {
            let initValue: number = Math.round(Math.random() * 100);
            this.knobs.push(new Knob("knobs-container", `knob${i}`, initValue));
        }
    }

    dispose(): void {
        this.knobs.forEach(knob => {
            knob.dispose();
        });
    }
}