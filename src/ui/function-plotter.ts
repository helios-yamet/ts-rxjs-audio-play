import "chartist/dist/chartist.min.css";
import "./function-plotter.css";

import * as template from "!raw-loader!./function-plotter.html";
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
        ticks:number[]) {

        this.id = id;

        // render plotter container
        let renderedTemplate: string = template
            .replace(new RegExp(TEMPLATE_PLOT_ID, "g"), id)
            .replace(new RegExp(TEMPLATE_LABEL), label);
        $(`#${containerId}`).append(renderedTemplate);

        let i: number = 0;
        this.chart = new Chartist.Line(
            $(`.plot`).get(0),
            {
                series: [{ data: this.calculatePoints(f) }]
            },
            {
                height: 400,
                width: 500,
                lineSmooth: false,
                showPoint: false,
                axisX: {
                    type: Chartist.FixedScaleAxis,
                    high: 1,
                    low: 0,
                    ticks: ticks,
                    labelInterpolationFnc: (n:any) => {
                        return labels[i++];
                    }
                }
            });
    }

    calculatePoints = (f: (x: number) => number): Point[] => {

        let values: Point[] = [];
        for (let i: number = 0; i <= SAMPLES; i++) {
            values.push({
                x: i / SAMPLES,
                y: f(i / SAMPLES)
            });
        }

        return values;
    }

    updateChart = (f: (x: number) => number): void => {
        this.chart.update({ series: [{ data: this.calculatePoints(f) }] });
    }
}

