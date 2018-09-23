import * as lfModule from "!file-loader?name=[name].js!ts-loader!./lf-model-processor.ts";
import * as Rx from "rxjs/Rx";

import GlottalSynthetizer from "./glottal-synthetizer";
import InputController from "./input-controller";
import NoteHandler from "./note-handler";
import Panel from "../ui/panel";

export default class GlottalInput implements IDisposable {

    public id: string;
    private panel: Panel;

    private inputController: InputController;
    private sub: Rx.Subscription;

    private noteActive: boolean;

    constructor(
        containerId: string,
        id: string,
        inputController: InputController) {

        this.id = id;
        this.inputController = inputController;

        // create input
        this.panel = new Panel(
            containerId, `${this.id}-input`, `Glottal Flow Synthesis`,
            [{
                id: "rd",
                name: "Shape Param",
                minValue: 0,
                maxValue: 100,
                initValue: 50
            }],
            this.inputController);

        // pass the knob through a subject
        let signal$: Rx.Subject<number> = new Rx.Subject();
        this.panel.knobs[0].subscribe(signal$);

        this.noteActive = false;

        // load worklet in audio context
        let audioContext: AudioContext = new AudioContext();
        console.log(`Sample rate: ${audioContext.sampleRate}`);
        Rx.Observable.fromPromise(audioContext.audioWorklet.addModule(lfModule))
            .take(1)
            .subscribe(
                () => console.log(`Worklet processor '${lfModule}' loaded`),
                (error: any) => console.error(error)
            );

        this.sub = signal$.subscribe(() => {
            if (!this.noteActive) {
                this.noteActive = true;
                NoteHandler.startNote(new GlottalSynthetizer(audioContext), signal$, () => this.noteActive = false);
            }
        });
    }

    dispose(): void {
        this.sub.unsubscribe();
        this.panel.dispose();
    }
}