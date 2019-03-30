import "chartist/dist/chartist.min.css";
import "./function-plotter.css";

import template from "!raw-loader!./function-plotter.html";
import * as $ from "jquery";
import * as Chartist from "chartist";

declare module "chartist" {
    interface IChartistLineChart extends IChartistBase<ILineChartOptions> {
        new(target: any, data: any, options?: ILineChartOptions): IChartistLineChart;
    }
}

const TEMPLATE_PLOT_ID: string = "##ID##";
const TEMPLATE_LABEL: string = "##LABEL##";

const SAMPLES: number = 50;

type Point = {
    x: number;
    y: number;
};

export default class FunctionPlotter {

    id: string;
    chart: Chartist.IChartistLineChart;

    constructor(
        containerId: string,
        id: string,
        label: string,
        f: (x: number) => number,
        labels: string[],
        ticks: number[]) {

        this.id = id;

        // render plotter container
        let renderedTemplate: string = template
            .replace(new RegExp(TEMPLATE_PLOT_ID, "g"), id)
            .replace(new RegExp(TEMPLATE_LABEL), label);
        $(`#${containerId}`).append(renderedTemplate);

        this.chart = new Chartist.Line($(`.plot`).get(0), this.buildData(f), this.buildOptions(labels, ticks));
    }

    updateChart = (f: (x: number) => number, labels: string[], ticks: number[]): void => {
        this.chart.update(this.buildData(f), this.buildOptions(labels, ticks));
    }

    private buildData = (f: (x: number) => number): {} => {

        let values: Point[] = [];
        for (let i: number = 0; i <= SAMPLES; i++) {
            values.push({
                x: i / SAMPLES,
                y: f(i / SAMPLES)
            });
        }

        return { series: [{ data: values }] };
    }

    private buildOptions = (labels: string[], ticks: number[]): {} => {

        let i: number = 0;
        return {
            height: 150,
            width: 230,
            lineSmooth: false,
            showPoint: false,
            axisY: {
                high: 0.6,
                low: -1
            },
            axisX: {
                type: Chartist.FixedScaleAxis,
                high: 1,
                low: 0,
                ticks: ticks,
                labelInterpolationFnc: () => {
                    return labels[i++];
                }
            }
        };
    }
}

