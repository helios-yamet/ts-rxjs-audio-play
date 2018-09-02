class LfModel extends AudioWorkletProcessor {

    constructor() {
        super();
    }

    process(inputs, outputs) {
        let input = inputs[0];
        let output = outputs[0];
        for (let channel = 0; channel < output.length; ++channel) {
            let outputChannel = output[channel];
            let inputChannel = input[channel];
            for (let i = 0; i < outputChannel.length; ++i) {
                outputChannel[i] = inputChannel[i] + 0.1 * (Math.random() - 0.5);
            }
        }

        console.log(inputs.length)
        return true;
    }
}

registerProcessor('lf-model', LfModel);