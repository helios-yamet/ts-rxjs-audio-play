import * as lfModule from "!file-loader?name=[name].js!ts-loader!./lf-model-processor.ts";
import * as Rx from "rxjs/Rx";

import GlottalSynthetizer from "./glottal-synthetizer";
import InputController from "./input-controller";
import NoteHandler from "./note-handler";
import Panel from "../ui/panel";
import FormantDefinitions, { Vowel } from "./formants";
import MainAudio from "./mainAudio";

export default class GlottalInput implements IDisposable {

    public id: string;
    public shapeParam$: Rx.Subject<number>;

    private inputPanel: Panel;
    private soundPanel: Panel;
    private inputController: InputController;
    private subs: Rx.Subscription[];

    private noteActive: boolean;
    private soundUnit: GlottalSynthetizer | undefined;

    constructor(
        containerId: string,
        id: string,
        mainAudio: MainAudio,
        inputController: InputController) {

        this.id = id;
        this.inputController = inputController;

        // load worklet in audio context
        Rx.Observable.fromPromise(mainAudio.audioContext.audioWorklet.addModule(lfModule))
            .take(1)
            .subscribe(
                () => {
                    console.log(`Worklet processor '${lfModule}' loaded`);
                    this.soundUnit = new GlottalSynthetizer(mainAudio, 120, Vowel.A_Bass);
                    this.inputController.setSoundUnit(this.soundUnit);
                },
                (error: any) => console.error(error)
            );

        // create input panel
        this.inputPanel = new Panel(
            containerId, `${this.id}-input`, `Input Signal`,
            [{
                id: "in",
                name: "Signal In",
                minValue: 0,
                maxValue: 100,
                initValue: 0
            }],
            this.inputController);

        // create sound unit panel
        this.soundPanel = new Panel(
            containerId, `${this.id}-sound`, `Glottal Flow Synthesis`,
            [{
                id: "rd",
                name: "Shape (Rd)",
                minValue: 0,
                maxValue: 100,
                initValue: 50
            },{
                id: "aspi",
                name: "Apiration",
                minValue: 0,
                maxValue: 100,
                initValue: 0
            }, {
                id: "freq",
                name: "Frequency",
                minValue: 30,
                maxValue: 450,
                initValue: 120
            }, {
                id: "vowel",
                name: "Vowel",
                minValue: 0,
                maxValue: FormantDefinitions.all.length - 1,
                initValue: 20,
                displayValue: (v) => FormantDefinitions.all[Math.floor(v)].name
            }, {
                id: "vib-amt",
                name: "Vib Amnt",
                minValue: 0,
                maxValue: 100,
                initValue: 50
            }, {
                id: "vib-freq",
                name: "Vib Freq",
                minValue: 0,
                maxValue: 100,
                initValue: 50
            }, {
                id: "vib-depth",
                name: "Vib Depth",
                minValue: 0,
                maxValue: 100,
                initValue: 10
            }],
            this.inputController);

        this.subs = [];

        // input signal
        let inputSignal$: Rx.Subject<number> = new Rx.Subject();
        this.inputPanel.knobs[0].subscribe(inputSignal$);
        this.noteActive = false;
        this.subs.push(inputSignal$.subscribe(() => {
            if (!this.noteActive && this.soundUnit) {
                this.noteActive = true;
                NoteHandler.startNote(this.soundUnit, inputSignal$, () => this.noteActive = false);
            }
        }));

        // waveform shape (Rd)
        this.shapeParam$ = new Rx.Subject();
        this.soundPanel.knobs[0].subscribe(this.shapeParam$);
        this.subs.push(this.shapeParam$.subscribe((value: number) => {
            if (this.soundUnit) {
                this.soundUnit.setShapeParam(value);
            }
        }));

        // aspiration amount
        let aspiration$: Rx.Subject<number> = new Rx.Subject();
        this.soundPanel.knobs[1].subscribe(aspiration$);
        this.subs.push(aspiration$.subscribe((value: number) => {
            if (this.soundUnit) {
                this.soundUnit.setAspiration(value);
            }
        }));

        // frequency
        let frequency$: Rx.Subject<number> = new Rx.Subject();
        this.soundPanel.knobs[2].subscribe(frequency$);
        this.subs.push(frequency$.subscribe((value: number) => {
            if (this.soundUnit) {
                this.soundUnit.setFrequency(value);
            }
        }));

        // vowel
        let vowel$: Rx.Subject<number> = new Rx.Subject();
        this.soundPanel.knobs[3].subscribe(vowel$);
        this.subs.push(vowel$.subscribe((value: number) => {
            if (this.soundUnit) {
                this.soundUnit.setVowel(FormantDefinitions.all[Math.floor(value)].vowel);
            }
        }));

        // vibrato amount
        let vibratoAmount$: Rx.Subject<number> = new Rx.Subject();
        this.soundPanel.knobs[4].subscribe(vibratoAmount$);
        this.subs.push(vibratoAmount$.subscribe((value: number) => {
            if (this.soundUnit) {
                this.soundUnit.setVibratoAmount(value);
            }
        }));

        // vibrato frequency
        let vibratoFreq$: Rx.Subject<number> = new Rx.Subject();
        this.soundPanel.knobs[5].subscribe(vibratoFreq$);
        this.subs.push(vibratoFreq$.subscribe((value: number) => {
            if (this.soundUnit) {
                this.soundUnit.setVibratoFrequency(value);
            }
        }));

        // vibrato depth
        let vibratoDepth$: Rx.Subject<number> = new Rx.Subject();
        this.soundPanel.knobs[6].subscribe(vibratoDepth$);
        this.subs.push(vibratoDepth$.subscribe((value: number) => {
            if (this.soundUnit) {
                this.soundUnit.setVibratoDepth(value);
            }
        }));
    }

    dispose(): void {
        this.subs.forEach((s) => s.unsubscribe());
        this.inputPanel.dispose();
        this.soundPanel.dispose();
        this.soundUnit!.dispose();
    }
}