export default class LfModelNode extends AudioWorkletNode {

    constructor(audioContext: AudioContext) {

        super(audioContext, "lf-model-processor");
    }

    getFrequency = (): AudioParam => this.parameters.get("frequency");
    getShapeParam = (): AudioParam => this.parameters.get("shapeParam");
    getAspiration = (): AudioParam => this.parameters.get("aspiration");

    public static waveformFunction = (rd: number): LfFunction => {

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
        let f: (n: number) => number = (t) =>
            t < te
                ? e0 * Math.exp(alpha * t) * Math.sin(omega * t)    // the open phase
                : (-Math.exp(-epsilon * (t - te)) + shift) / delta; // the return phase
        // ----------------------------------------------------

        return new LfFunction(tp, te, ta, tc, f);
    }
}

export class LfFunction {

    tp: number;
    te: number;
    ta: number;
    tc: number;
    f: (n: number) => number;

    constructor(tp: number, te: number, ta: number, tc: number, f: (n: number) => number) {
        this.tp = tp;
        this.te = te;
        this.ta = ta;
        this.tc = tc;
        this.f = f;
    }
}