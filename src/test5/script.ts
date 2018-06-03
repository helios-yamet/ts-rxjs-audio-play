import "./styles.css";

import * as Rx from "rxjs/Rx";
import * as template from "!raw-loader!./template.html";
import * as $ from "jquery";

import InputController from "./inputController";
import Oscillator from "./oscillator";

export default class Test5 implements IDisposable {

    private inputController: InputController;
    private oscillators: Oscillator[];

    constructor() {

        $("#content").html(template);

        this.inputController = new InputController();
        this.oscillators = [];
        for(let i:number = 0; i<6; i++) {
            let initValue: number = Math.round(Math.random() * 100) + 100;
            this.oscillators.push(new Oscillator(
                "oscillators-container", `osc${i}`, `OSC ${i}`,
                this.inputController));
        }
    }

    dispose(): void {

        this.inputController.dispose();
        this.oscillators.forEach(o => {
            o.dispose();
        });
    }
}