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
            name: "frequency",
            defaultValue: INIT_FREQUENCY
        }, {
            name: "shapeParam",
            defaultValue: INIT_SHAPE_PARAM,
            minValue: 0.3,
            maxValue: 2.7,
        }, {
            name: "aspiration",
            defaultValue: APIRATION_PARAM,
            minValue: 0.0,
            maxValue: 1.0,
        }];
    }

    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: { [name: string]: Float32Array }): boolean {

        let output: Float32Array[] = outputs[0];

        // resolve next render quantum (128 frames)
        for (let frame: number = 0; frame < QUANTUM_FRAMES; frame++) {

            if (this.frameInWaveform === 0) {

                // if params have changed since last cycle, let's adjust for the next cycle
                // (note: for some reason, only getting the param value for the first frame...)
                let newFrequency: number = parameters.frequency[0];
                if (newFrequency !== this.frequencyValue) {
                    this.frequencyValue = newFrequency;
                    this.framesPerWaveformCycle = Math.floor(SAMPLE_RATE / this.frequencyValue);
                }
                let newShapeParam: number = parameters.shapeParam[0];
                if (newShapeParam !== this.shapeParamValue) {
                    this.shapeParamValue = newShapeParam;
                    this.currentFunction = LfFunction.createWaveform(this.shapeParamValue);
                }
            }

            // calculate sample and apply it to all output channels
            let t: number = this.frameInWaveform / this.framesPerWaveformCycle;
            let sampleFlowDerivative: number = this.currentFunction.f(t);
            let sampleAspirationNoiseAmp: number = this.currentFunction.a(t);
            for (let channel: number = 0; channel < output.length; channel++) {
                let aspirationParam: number = parameters.aspiration[0];
                output[channel][frame] =
                    sampleFlowDerivative * (1 - aspirationParam * 0.5) +
                    aspirationParam * sampleAspirationNoiseAmp * inputs[0][0][frame];
            }

            // move to next frame in waveform (or loop to start)
            this.frameInWaveform = ++this.frameInWaveform < this.framesPerWaveformCycle ? this.frameInWaveform : 0;
        }

        return this.active;
    }
}

class LfFunction {

    tp: number;
    te: number;
    ta: number;
    tc: number;
    f: (n: number) => number;
    a: (t: number) => number;

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

    public static createWaveform = (rd: number): LfFunction => {

        rd = Math.max(rd, 0.3);
        rd = Math.min(rd, 2.7);

        let rap: number = (-1 + 4.8 * rd) / 100;
        let rkp: number = (22.4 + 11.8 * rd) / 100;
        let rgp: number = 1 / (4 * ((0.11 * rd / (0.5 + 1.2 * rkp)) - rap) / rkp);

        let t0: number = 1;
        let tp: number = t0 / (2 * rgp); // because rg = T0 / (2 * tp)
        let te: number = rkp * tp + tp;  // because rk = (te - tp) / tp
        let ta: number = rap / t0;
        let tc: number = t0;

        // ----------------------------------------------------
        // adapted (~ copied) from Pink Trombone by Neil Thapen
        let omega: number = Math.PI / tp;
        let epsilon: number = 1 / ta;
        let shift: number = Math.exp(-epsilon * (1 - te));
        let delta: number = 1 - shift;
        let rhsIntegral: number = ((1 / epsilon) * (shift - 1) + (1 - te) * shift) / delta;
        let totalLowerIntegral: number = -(te - tp) / 2 + rhsIntegral;
        let totalUpperIntegral: number = -totalLowerIntegral;
        var s: number = Math.sin(omega * te);
        let y: number = -Math.PI * s * totalUpperIntegral / (tp * 2);
        let z: number = Math.log(y);
        let alpha: number = z / (tp / 2 - te);
        let e0: number = -1 / (s * Math.exp(alpha * te));
        let f: (t: number) => number = (t) =>
            t < te
                ? e0 * Math.exp(alpha * t) * Math.sin(omega * t)    // the open phase
                : (-Math.exp(-epsilon * (t - te)) + shift) / delta; // the return phase
        // ----------------------------------------------------

        const minAmp: number = 0.2;

        // amplitude of aspiration noise (based on an approximation of the glottal "air flow" + constant)
        let a: (t: number) => number = (t) => t < te ? minAmp + Math.sin(t / te * Math.PI) * (1 - minAmp) : minAmp;

        return new LfFunction(tp, te, ta, tc, f, a);
    }
}

registerProcessor("lf-model-processor", LfModel);