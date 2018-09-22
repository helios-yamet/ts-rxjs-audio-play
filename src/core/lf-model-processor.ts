class LfModel extends AudioWorkletProcessor {

    private active: boolean = true; // todo see how to manage this...

    constructor() {
        super();
    }

    static get parameterDescriptors(): ProcessorParams[] {
        return [{
            name: "shapeParam",
            defaultValue: 1
        }];
    }

    process(
        inputs: Float32Array[][],
        outputs: Float32Array[][],
        parameters: { [name: string]: Float32Array }): boolean {

        let input: Float32Array[] = inputs[0];
        let output: Float32Array[] = outputs[0];

        for (let channel: number = 0; channel < output.length; channel++) {

            let outputChannel: Float32Array = output[channel];
            let inputChannel: Float32Array = input[channel];

            for (let i: number = 0; i < outputChannel.length; i++) {
                outputChannel[i] = inputChannel[i] + (Math.random() * parameters.shapeParam[i]);
            }
        }

        this.port.postMessage("Hi, I'm useless at this stage.");
        return this.active;
    }
}

registerProcessor("lf-model-processor", LfModel);