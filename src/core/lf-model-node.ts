export default class LfModelNode extends AudioWorkletNode {

    constructor(audioContext: AudioContext) {

        super(audioContext, "lf-model-processor");
    }

    getNoiseLevelParam = (): AudioParam => this.parameters.get("noiseLevel");
}