import "./input.css";

import * as Rx from "rxjs/Rx";
import * as template from "!raw-loader!./input.html";
import * as $ from "jquery";
import Knob from "./knob";
import InputController from "./inputController";
import Note from "./note";

const TEMPLATE_KNOB_ID: string = "##ID##";
const TEMPLATE_LABEL: string = "##LABEL##";

const DEBOUNCE_MILLIS: number = 100;

export default class Input implements IDisposable {

    public id: string;

    private currentNote: Note | null;
    private knob: Knob;

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
            `${this.id}-knobs`, `${this.id}-val`, `Signal`,
            0, 100, 0,
            (value:number) => `${value}`,
            this.inputController.selectKnob);

        // register knob
        this.inputController.registerKnob(this.knob);

        this.currentNote = null;
        this.playNotes();
    }

    /**
     * Detect changes on the knob and produce notes (modulated).
     */
    private playNotes(this: Input): void {

        let debounceBreak$: Rx.Observable<number> = this.knob
            .debounceTime(DEBOUNCE_MILLIS)
            .filter(x => this.currentNote !== null)
            .do(() => {
                this.currentNote!.noteOff();
                this.currentNote = null;
                stream$.subscribe();
            });

        let stream$: Rx.Observable<void> = this.knob
            .skip(1)
            .map((knobValue: number) => {
                if(this.currentNote === null) {
                    this.currentNote = new Note();
                    this.currentNote.noteOn();
                }
                this.currentNote.modulate(knobValue);
            })
            .takeUntil(debounceBreak$);

        stream$.subscribe();
    }

    dispose(): void {
        this.knob.dispose();
    }
}