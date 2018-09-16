import * as lfModule from "!file-loader?name=[name].js!ts-loader!./lf-model-processor.ts";
import * as Rx from "rxjs/Rx";

import InputController from "./input-controller";
import Oscillator from "../ui/oscillator";
import NoteHandler from "./note-handler";

export default class Input implements IDisposable {

    public id: string;
    private oscillator: Oscillator;

    private inputController: InputController;
    private sub: Rx.Subscription;

    private numberActiveNoteHandlers: number;
    private lastCreatedAt: Date;

    constructor(
        containerId: string,
        id: string,
        inputController: InputController) {

        this.id = id;
        this.inputController = inputController;

        // create input
        this.oscillator = new Oscillator(
            containerId, `${this.id}-input`, `Input ${this.id}`,
            this.inputController);

        // register input
        this.inputController.registerKnob(this.oscillator.input);

        // pass the knob through a subject
        let signal$: Rx.Subject<number> = new Rx.Subject();
        this.oscillator.input.subscribe(signal$);

        this.numberActiveNoteHandlers = 0;
        this.lastCreatedAt = new Date(0);

        // load worklet in audio context
        let audioContext: AudioContext = new AudioContext();
        Rx.Observable.fromPromise(audioContext.audioWorklet.addModule(lfModule))
            .take(1)
            .subscribe(
                () => console.log(`Worklet processor '${lfModule}' loaded`),
                (error: any) => console.error(error)
            );

        this.sub = signal$.subscribe(() => {

            if (this.canStartNote()) {

                this.numberActiveNoteHandlers++;
                this.lastCreatedAt = new Date();

                NoteHandler.startNote(audioContext, signal$, () => this.numberActiveNoteHandlers--);
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
        this.oscillator.dispose();
    }
}