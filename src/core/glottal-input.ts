import * as lfModule from "!file-loader?name=[name].js!ts-loader!./lf-model-processor.ts";
import * as Rx from "rxjs/Rx";

import GlottalSynthetizer from "./glottal-synthetizer";
import InputController from "./input-controller";
import NoteHandler from "./note-handler";
import Panel from "../ui/panel";
import { Vowel } from "./formants-synthetizer";

export default class GlottalInput implements IDisposable {

    public id: string;
    public shapeParam$: Rx.Subject<number>;

    private panel: Panel;
    private inputController: InputController;
    private subs: Rx.Subscription[];

    private noteActive: boolean;
    private soundUnit: GlottalSynthetizer | undefined;

    constructor(
        containerId: string,
        id: string,
        audioContext: AudioContext,
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
        let frequency$: Rx.Subject<number> = new Rx.Subject();
        this.panel.knobs[0].subscribe(frequency$);
        this.shapeParam$ = new Rx.Subject();
        this.panel.knobs[1].subscribe(this.shapeParam$);

        this.noteActive = false;

        // load worklet in audio context
        Rx.Observable.fromPromise(audioContext.audioWorklet.addModule(lfModule))
            .take(1)
            .subscribe(
                () => {
                    console.log(`Worklet processor '${lfModule}' loaded`);
                    this.soundUnit = new GlottalSynthetizer(audioContext, 120, Vowel.Aaaa);
                    this.inputController.setSoundUnit(this.soundUnit);
                },
                (error: any) => console.error(error)
            );

        this.subs = [];
        this.subs.push(this.shapeParam$.subscribe(() => {
            if (!this.noteActive) {
                this.noteActive = true;
                NoteHandler.startNote(
                    new GlottalSynthetizer(audioContext, this.panel.knobs[0].value, Math.random() < .5 ? Vowel.Aaaa : Vowel.Oooo),
                    this.shapeParam$, () => this.noteActive = false);
            }
        }));

        this.subs.push(frequency$.subscribe((value: number) => {
            if (this.soundUnit) {
                this.soundUnit.setFrequency(value);
            }
        }));
    }

    dispose(): void {
        this.subs.forEach((s) => s.unsubscribe());
        this.panel.dispose();
    }
}