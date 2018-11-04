import "./visualizer.css";

import * as template from "!raw-loader!./visualizer.html";
import * as $ from "jquery";
import MainAudio from "../core/mainAudio";

const TEMPLATE_KNOB_ID: string = "##ID##";

export default class Visualizer implements IDisposable {

    public id: string;

    private mainAudio: MainAudio;
    private context: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;

    constructor(
        containerId: string,
        id: string,
        mainAudio: MainAudio) {

        this.id = id;

        // render analyser container
        let renderedTemplate: string = template
            .replace(new RegExp(TEMPLATE_KNOB_ID, "g"), id);
        $(`#${containerId}`).append(renderedTemplate);

        this.mainAudio = mainAudio;

        this.canvas = <HTMLCanvasElement>document.getElementById(id);
        let pixelRatio: number = window.devicePixelRatio || 1;
        var rect: ClientRect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * pixelRatio;
        this.canvas.height = rect.height * pixelRatio;
        this.context = this.canvas.getContext("2d")!;

        this.drawOscilloscope();
    }

    private drawOscilloscope = () => {

        requestAnimationFrame(this.drawOscilloscope);

        const FRAC: number = 4;
        const AMP: number = 1.5;

        let frequencies: Float32Array = this.mainAudio.getFrequencies();
        let len: number = frequencies.length;
        let barWidth: number = this.canvas.width / len * FRAC - 3;

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i: number = 0; i < len / FRAC; i++) {

            let x: number = this.canvas.width * (i / len) * FRAC;

            this.context.fillStyle = "rgba(237, 239, 240, 1)";
            this.context.fillRect(x, 0, barWidth, this.canvas.height);

            let y: number = -frequencies[i] * AMP - 25;

            this.context.fillStyle = "#b6cfe2";
            this.context.fillRect(x, y, barWidth, this.canvas.height);

            this.context.fillStyle = "rgb(94, 103, 111)";
            this.context.fillRect(x, y, barWidth, 3);
        }
    }

    dispose(): void {
        // do nothing
    }
}