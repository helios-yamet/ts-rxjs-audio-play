import * as lfModule from "!file-loader?name=[name].js!ts-loader!./lf-model-processor.ts";
import * as Rx from "rxjs/Rx";

import GlottalSynthetizer from "./glottal-synthetizer";
import InputController from "./input-controller";
import NoteHandler from "./note-handler";
import Panel from "../ui/panel";

export default class GlottalInput implements IDisposable {

    public id: string;
    public shapeParam$: Rx.Subject<number>;

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
                id: "freq",
                name: "Frequency",
                minValue: 30,
                maxValue: 250,
                initValue: 120
            },
            {
                id: "rd",
                name: "Shape (Rd)",
                minValue: 0,
                maxValue: 100,
                initValue: 50
            }],
            this.inputController);

        // pass the knob through a subject
        this.shapeParam$ = new Rx.Subject();
        this.panel.knobs[1].subscribe(this.shapeParam$);

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

        this.sub = this.shapeParam$.subscribe(() => {
            if (!this.noteActive) {
                this.noteActive = true;
                NoteHandler.startNote(
                    new GlottalSynthetizer(audioContext, this.panel.knobs[0].value),
                    this.shapeParam$, () => this.noteActive = false);
            }
        });
    }

    dispose(): void {
        this.sub.unsubscribe();
        this.panel.dispose();
    }
}