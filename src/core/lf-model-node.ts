import MainAudio from "./main-audio";

export class LfFunction {

    public tp: number;
    public te: number;
    public ta: number;
    public tc: number;
    public f: (n: number) => number;
    public a: (t: number) => number;

    constructor(
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

export default class LfModelNode extends AudioWorkletNode {

    public static waveformFunction = (rd: number): LfFunction => {

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
        const f: (n: number) => number = (t) =>
            t < te
                ? e0 * Math.exp(alpha * t) * Math.sin(omega * t)    // the open phase
                : (-Math.exp(-epsilon * (t - te)) + shift) / delta; // the return phase
        // ----------------------------------------------------

        const minAmp: number = 0.2;

        // amplitude of aspiration noise (based on an approximation of the glottal "air flow" + constant)
        const a: (t: number) => number = (t) => t < te ? minAmp + Math.sin(t / te * Math.PI) * (1 - minAmp) : minAmp;

        return new LfFunction(tp, te, ta, tc, f, a);
    }

    constructor(mainAudio: MainAudio) {

        super(mainAudio.audioContext, "lf-model-processor");
    }

    public getFrequency = (): AudioParam => this.parameters.get("frequency");
    public getShapeParam = (): AudioParam => this.parameters.get("shapeParam");
    public getAspiration = (): AudioParam => this.parameters.get("aspiration");
}
