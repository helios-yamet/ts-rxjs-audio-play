class LfModel extends AudioWorkletProcessor {

    private active: boolean = true; // todo see how to manage this...

    constructor() {
        super();
    }

    static get parameterDescriptors(): ProcessorParams[] {
        return [{
            name: "frequency",
            defaultValue: 120
        },{
            name: "shapeParam",
            defaultValue: 1,
            minValue: 0.3,
            maxValue: 2.7,
        }];
    }

    // called every render quantum (= 128 frames, ~0.00266666667 [s] for sample rate of 48000 samples/s)
    process(
        inputs: Float32Array[][],
        outputs: Float32Array[][],
        parameters: { [name: string]: Float32Array }): boolean {

        let input: Float32Array[] = inputs[0];
        let output: Float32Array[] = outputs[0];

        for (let channel: number = 0; channel < output.length; channel++) {
            let inputChannel: Float32Array = input[channel];
            let outputChannel: Float32Array = output[channel];

            // 128 frames to render in each channel
            // -> need to map this to a range of actual time on the lf-model waveform (based on frequency and current position)
            // -> frequency and Rd need to remain the same for a cycle of the waveform (not like below)
            // -> might want to inverse the loop, channels can all share the same output (will be faster for now)
            for (let i: number = 0; i < outputChannel.length; i++) {
                outputChannel[i] = inputChannel[i] + (Math.random() * parameters.shapeParam[i]);
            }
        }

        this.port.postMessage(`lf-model processor says: I'm still useless`);
        return this.active;
    }
}

registerProcessor("lf-model-processor", LfModel);