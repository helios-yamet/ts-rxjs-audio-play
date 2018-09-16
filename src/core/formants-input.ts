import * as Rx from "rxjs/Rx";

import InputController from "./input-controller";
import Panel from "../ui/panel";
import NoteHandler from "./note-handler";
import * as Fs from "./formants-synthetizer";

export default class FormantsInput implements IDisposable {

    public id: string;
    private panel: Panel;

    private inputController: InputController;
    private subs: Rx.Subscription[];
    private noteActive: boolean;

    constructor(
        containerId: string,
        id: string,
        inputController: InputController) {

        this.id = id;
        this.inputController = inputController;

        // create input UI
        this.panel = new Panel(
            containerId, `${this.id}-input`, `Formants Synthesis`,
            [{
                id: "aaaa",
                name: "Aaaaaaaaaa",
                minValue: 0,
                maxValue: 100,
                initValue: 0
            },
            {
                id: "oooo",
                name: "Oooooooo",
                minValue: 0,
                maxValue: 100,
                initValue: 0
            }],
            this.inputController);

        this.noteActive = false;
        this.subs = [];

        // map first knob to a AAAaaaa sound
        let signal1$: Rx.Subject<number> = new Rx.Subject();
        this.panel.knobs[0].subscribe(signal1$);
        this.subs.push(signal1$.subscribe(() => {
            if (!this.noteActive) {
                this.noteActive = true;
                NoteHandler.startNote(new Fs.FormantSynthetizer(Fs.Vowel.Aaaa), signal1$, () => this.noteActive = false);
            }
        }));

        // map second knob to a OOOOoooo sound
        let signal2$: Rx.Subject<number> = new Rx.Subject();
        this.panel.knobs[1].subscribe(signal2$);
        this.subs.push(signal2$.subscribe(() => {
            if (!this.noteActive) {
                this.noteActive = true;
                NoteHandler.startNote(new Fs.FormantSynthetizer(Fs.Vowel.Oooo), signal2$, () => this.noteActive = false);
            }
        }));
    }

    dispose(): void {
        this.subs.forEach(sub => sub.unsubscribe());
        this.panel.dispose();
    }
}