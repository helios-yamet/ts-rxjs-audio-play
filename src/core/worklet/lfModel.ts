/// <reference path="./typings.d.ts" />

class LfModel extends AudioWorkletProcessor {

    constructor() {
        super();
    }

    process(
        inputs: Float32Array[][],
        outputs: Float32Array[][],
        parameters: { [name: string]: Float32Array }): boolean {

        let input: Float32Array[] = inputs[0];
        let output: Float32Array[] = outputs[0];

        for (let channel: number = 0; channel < output.length; ++channel) {
            let outputChannel: Float32Array = output[channel];
            let inputChannel: Float32Array = input[channel];
            for (let i: number = 0; i < outputChannel.length; ++i) {
                outputChannel[i] = inputChannel[i] + 0.5 * (Math.random() * 1.6);
            }
        }

        console.log(inputs.length);
        return true;
    }
}

registerProcessor("lf-model", LfModel);