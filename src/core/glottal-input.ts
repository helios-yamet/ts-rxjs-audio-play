import * as lfModule from "!file-loader?name=[name].js!ts-loader!./lf-model-processor.ts";
import * as Rx from "rxjs/Rx";

import GlottalSynthetizer from "./glottal-synthetizer";
import InputController from "./input-controller";
import NoteHandler from "./note-handler";
import Formants, { Vowel, IFormantDefinition } from "./formants";
import MainAudio from "./main-audio";
import LfModelNode from "./lf-model-node";

export default class GlottalInput implements IDisposable {

    public id: string;
    public shapeParam$: Rx.Subject<number>;
    private inputController: InputController;
    private subs: Rx.Subscription[];

    private noteActive: boolean;
    private soundUnit: GlottalSynthetizer | undefined;

    constructor(
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
                (error: any) => console.error(error),
            );

        // plot the LF-model waveform
        let lf: LfFunction = LfModelNode.waveformFunction(1);

        this.subs = [];

        // input signal
        const inputSignal$: Rx.Subject<number> = new Rx.Subject();
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
        this.glottalPanel.knobs[0].subscribe(this.shapeParam$);
        this.subs.push(this.shapeParam$.subscribe((value: number) => {
            if (this.soundUnit) {
                this.soundUnit.setShapeParam(value);
            }
        }));

        // update the plot
        this.shapeParam$.subscribe((v: number) => {
            lf = LfModelNode.waveformFunction(0.024 * v + 0.3);
            this.plot.updateChart(lf.f, labels, [0, lf.tp, lf.te, lf.tc]);
        });

        // aspiration amount
        const aspiration$: Rx.Subject<number> = new Rx.Subject();
        this.glottalPanel.knobs[1].subscribe(aspiration$);
        this.subs.push(aspiration$.subscribe((value: number) => {
            if (this.soundUnit) {
                this.soundUnit.setAspiration(value);
            }
        }));

        // frequency
        const frequency$: Rx.Subject<number> = new Rx.Subject();
        this.glottalPanel.knobs[2].subscribe(frequency$);
        this.subs.push(frequency$.subscribe((value: number) => {
            if (this.soundUnit) {
                this.soundUnit.setFrequency(value);
            }
        }));

        // vowel
        const vowel$: Rx.Subject<number> = new Rx.Subject();
        this.glottalPanel.knobs[3].subscribe(vowel$);
        this.subs.push(vowel$.subscribe((value: number) => {
            if (this.soundUnit) {
                this.soundUnit.setVowel(Formants.all[Math.floor(value)].vowel, .4);
            }
        }));

        // vibrato amount
        const vibratoAmount$: Rx.Subject<number> = new Rx.Subject();
        this.vibratoPanel.knobs[0].subscribe(vibratoAmount$);
        this.subs.push(vibratoAmount$.subscribe((value: number) => {
            if (this.soundUnit) {
                this.soundUnit.setVibratoAmount(value);
            }
        }));

        // vibrato frequency
        const vibratoFreq$: Rx.Subject<number> = new Rx.Subject();
        this.vibratoPanel.knobs[1].subscribe(vibratoFreq$);
        this.subs.push(vibratoFreq$.subscribe((value: number) => {
            if (this.soundUnit) {
                this.soundUnit.setVibratoFrequency(value);
            }
        }));

        // vibrato depth
        const vibratoDepth$: Rx.Subject<number> = new Rx.Subject();
        this.vibratoPanel.knobs[2].subscribe(vibratoDepth$);
        this.subs.push(vibratoDepth$.subscribe((value: number) => {
            if (this.soundUnit) {
                this.soundUnit.setVibratoDepth(value);
            }
        }));

        // envelope attack
        const envelopeAttack$: Rx.Subject<number> = new Rx.Subject();
        this.envelopePanel.knobs[0].subscribe(envelopeAttack$);
        this.subs.push(envelopeAttack$.subscribe((value: number) => {
            if (this.soundUnit) {
                this.soundUnit.setEnvelopeAttack(value);
            }
        }));

        // envelope decay
        const envelopeDecay$: Rx.Subject<number> = new Rx.Subject();
        this.envelopePanel.knobs[1].subscribe(envelopeDecay$);
        this.subs.push(envelopeDecay$.subscribe((value: number) => {
            if (this.soundUnit) {
                this.soundUnit.setEnvelopeDecay(value);
            }
        }));

        // envelope sustain
        const envelopeSustain$: Rx.Subject<number> = new Rx.Subject();
        this.envelopePanel.knobs[2].subscribe(envelopeSustain$);
        this.subs.push(envelopeSustain$.subscribe((value: number) => {
            if (this.soundUnit) {
                this.soundUnit.setEnvelopeSustain(value);
            }
        }));

        // envelope release
        const envelopeRelease$: Rx.Subject<number> = new Rx.Subject();
        this.envelopePanel.knobs[3].subscribe(envelopeRelease$);
        this.subs.push(envelopeRelease$.subscribe((value: number) => {
            if (this.soundUnit) {
                this.soundUnit.setEnvelopeRelease(value);
            }
        }));
    }

    public dispose(): void {
        this.subs.forEach((s) => s.unsubscribe());
        this.inputPanel.dispose();
        this.glottalPanel.dispose();
        this.vibratoPanel.dispose();
        this.envelopePanel.dispose();
        this.soundUnit!.dispose();
    }
}
