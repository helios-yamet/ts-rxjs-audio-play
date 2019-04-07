const SAMPLE_RATE: number = 48000;
const QUANTUM_FRAMES: number = 128;

const INIT_FREQUENCY: number = 120;
const INIT_SHAPE_PARAM: number = 1;
const APIRATION_PARAM: number = 0;

class LfModel extends AudioWorkletProcessor {

    private frequencyValue: number = INIT_FREQUENCY;
    private shapeParamValue: number = INIT_SHAPE_PARAM;
    private currentFunction: LfFunction = LfFunction.createWaveform(INIT_SHAPE_PARAM);
    private framesPerWaveformCycle: number = Math.floor(SAMPLE_RATE / INIT_FREQUENCY);
    private frameInWaveform: number = 0;

    private active: boolean = true; // todo see how to manage this...

    constructor() {
        super();
    }

    static get parameterDescriptors(): ProcessorParams[] {
        return [{
            name: 'frequency',
            defaultValue: INIT_FREQUENCY,
        }, {
            name: 'shapeParam',
            defaultValue: INIT_SHAPE_PARAM,
            minValue: 0.3,
            maxValue: 2.7,
        }, {
            name: 'aspiration',
            defaultValue: APIRATION_PARAM,
            minValue: 0.0,
            maxValue: 1.0,
        }];
    }

    public process(
        inputs: Float32Array[][],
        outputs: Float32Array[][],
        parameters: { [name: string]: Float32Array }): boolean {

        const output: Float32Array[] = outputs[0];

        // resolve next render quantum (128 frames)
        for (let frame: number = 0; frame < QUANTUM_FRAMES; frame++) {

            if (this.frameInWaveform === 0) {

                // if params have changed since last cycle, let's adjust for the next cycle
                // (note: for some reason, only getting the param value for the first frame...)
                const newFrequency: number = parameters.frequency[0];
                if (newFrequency !== this.frequencyValue) {
                    this.frequencyValue = newFrequency;
                    this.framesPerWaveformCycle = Math.floor(SAMPLE_RATE / this.frequencyValue);
                }
                const newShapeParam: number = parameters.shapeParam[0];
                if (newShapeParam !== this.shapeParamValue) {
                    this.shapeParamValue = newShapeParam;
                    this.currentFunction = LfFunction.createWaveform(this.shapeParamValue);
                }
            }

            // calculate sample and apply it to all output channels
            const t: number = this.frameInWaveform / this.framesPerWaveformCycle;
            const sampleFlowDerivative: number = this.currentFunction.f(t);
            const sampleAspirationNoiseAmp: number = this.currentFunction.a(t);
            for (const channel of output) {
                const aspirationParam: number = parameters.aspiration[0];
                channel[frame] =
                    sampleFlowDerivative * (1 - aspirationParam * 0.5) +
                    aspirationParam * sampleAspirationNoiseAmp * inputs[0][0][frame];
            }

            // move to next frame in waveform (or loop to start)
            this.frameInWaveform = ++this.frameInWaveform < this.framesPerWaveformCycle ? this.frameInWaveform : 0;
        }

        return this.active;
    }
}

// tslint:disable-next-line: max-classes-per-file
class LfFunction {

    public static createWaveform = (rd: number): LfFunction => {

        rd = Math.max(rd, 0.3);
        rd = Math.min(rd, 2.7);

        const rap: number = (-1 + 4.8 * rd) / 100;
        const rkp: number = (22.4 + 11.8 * rd) / 100;
        const rgp: number = 1 / (4 * ((0.11 * rd / (0.5 + 1.2 * rkp)) - rap) / rkp);

        const t0: number = 1;
        const tp: number = t0 / (2 * rgp); // because rg = T0 / (2 * tp)
        const te: number = rkp * tp + tp;  // because rk = (te - tp) / tp
        const ta: number = rap / t0;
        const tc: number = t0;

        // ----------------------------------------------------
        // adapted (~ copied) from Pink Trombone by Neil Thapen
        const omega: number = Math.PI / tp;
        const epsilon: number = 1 / ta;
        const shift: number = Math.exp(-epsilon * (1 - te));
        const delta: number = 1 - shift;
        const rhsIntegral: number = ((1 / epsilon) * (shift - 1) + (1 - te) * shift) / delta;
        const totalLowerIntegral: number = -(te - tp) / 2 + rhsIntegral;
        const totalUpperIntegral: number = -totalLowerIntegral;
        const s: number = Math.sin(omega * te);
        const y: number = -Math.PI * s * totalUpperIntegral / (tp * 2);
        const z: number = Math.log(y);
        const alpha: number = z / (tp / 2 - te);
        const e0: number = -1 / (s * Math.exp(alpha * te));
        const f: (t: number) => number = (t) =>
            t < te
                ? e0 * Math.exp(alpha * t) * Math.sin(omega * t)    // the open phase
                : (-Math.exp(-epsilon * (t - te)) + shift) / delta; // the return phase
        // ----------------------------------------------------

        const minAmp: number = 0.2;

        // amplitude of aspiration noise (based on an approximation of the glottal "air flow" + constant)
        const a: (t: number) => number = (t) => t < te ? minAmp + Math.sin(t / te * Math.PI) * (1 - minAmp) : minAmp;

        return new LfFunction(tp, te, ta, tc, f, a);
    }

    public tp: number;
    public te: number;
    public ta: number;
    public tc: number;
    public f: (n: number) => number;
    public a: (t: number) => number;

    private constructor(
        tp: number, te: number, ta: number, tc: number,
        f: (t: number) => number,
        a: (t: number) => number) {

        this.tp = tp;
        this.te = te;
        this.ta = ta;
        this.tc = tc;
        this.f = f;
        this.a = a;
    }
}

registerProcessor('lf-model-processor', LfModel);
