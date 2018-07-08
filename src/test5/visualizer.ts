import "./visualizer.css";

import * as template from "!raw-loader!./visualizer.html";
import * as $ from "jquery";

const TEMPLATE_KNOB_ID: string = "##ID##";

export default class Visualizer implements IDisposable {

    public id: string;

    private analyserNode: AnalyserNode;
    private waveform: Float32Array;
    private scopeContext: CanvasRenderingContext2D;
    private scopeCanvas: HTMLCanvasElement;

    constructor(
        containerId: string,
        id: string,
        analyserNode: AnalyserNode) {

        this.id = id;
        this.analyserNode = analyserNode;

        // render analyser container
        let renderedTemplate: string = template
            .replace(new RegExp(TEMPLATE_KNOB_ID, "g"), id);
        $(`#${containerId}`).append(renderedTemplate);

        this.waveform = new Float32Array(analyserNode.frequencyBinCount);
        analyserNode.getFloatTimeDomainData(this.waveform);

        this.scopeCanvas = <HTMLCanvasElement>document.getElementById(id);
        this.scopeCanvas.width = this.waveform.length / 2;
        this.scopeCanvas.height = 185;
        this.scopeContext = this.scopeCanvas.getContext("2d")!;

        this.updateWaveform();
        this.drawOscilloscope();
    }

    private updateWaveform = () => {

        requestAnimationFrame(this.updateWaveform);
        this.analyserNode.getFloatTimeDomainData(this.waveform);
    }

    private drawOscilloscope = () => {

        requestAnimationFrame(this.drawOscilloscope);
        this.scopeContext.clearRect(0, 0, this.scopeCanvas.width, this.scopeCanvas.height);
        this.scopeContext.beginPath();
        for (let i: number = 0; i < this.waveform.length; i++) {
            const x: number = i/2;
            const y: number = (0.5 + this.waveform[i] / 2) * this.scopeCanvas.height;
            if (i === 0) {
                this.scopeContext.moveTo(x, y);
            } else {
                this.scopeContext.lineTo(x, y);
            }
        }
        this.scopeContext.stroke();
    }

    dispose(): void {
        // do nothing
    }
}