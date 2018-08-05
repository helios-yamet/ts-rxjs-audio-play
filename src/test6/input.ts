import "./input.css";

import * as Rx from "rxjs/Rx";
import * as template from "!raw-loader!./input.html";
import * as $ from "jquery";
import Knob from "./knob";
import InputController from "./inputController";
import NoteHandler from "./noteHandler";

const TEMPLATE_KNOB_ID: string = "##ID##";
const TEMPLATE_LABEL: string = "##LABEL##";

export default class Input implements IDisposable {

    public id: string;
    private knob: Knob;

    private inputController: InputController;
    private sub: Rx.Subscription;

    private numberActiveNoteHandlers: number;
    private lastCreatedAt: Date;

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
            `${this.id}-knobs`, `${this.id}-val`, `Signal`,
            0, 100, 0,
            (value: number) => `${value}`,
            this.inputController.selectKnob);

        // register knob
        this.inputController.registerKnob(this.knob);

        // pass the knob through a subject
        let signal$: Rx.Subject<number> = new Rx.Subject();
        this.knob.subscribe(signal$);

        this.numberActiveNoteHandlers = 0;
        this.lastCreatedAt = new Date(0);

        this.sub = signal$.subscribe(() => {

            if (this.canStartNote()) {

                this.numberActiveNoteHandlers++;
                this.lastCreatedAt = new Date();

                NoteHandler.startNote(signal$, () => this.numberActiveNoteHandlers--);
            }
        });
    }

    canStartNote(this: Input): boolean {
        let now: Date = new Date();
        return this.numberActiveNoteHandlers < 1 &&
            now.getTime() - this.lastCreatedAt.getTime() > 1000;
    }

    dispose(): void {
        this.sub.unsubscribe();
        this.knob.dispose();
    }
}