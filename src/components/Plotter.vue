<template>
  <div :id="id" class="plot" :title="id"></div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import "chartist/dist/chartist.min.css";
import $ from "jquery";
import * as Chartist from "chartist";

declare module "chartist" {
  interface IChartistLineChart extends IChartistBase<ILineChartOptions> {
    new (
      target: any,
      data: any,
      options?: ILineChartOptions
    ): IChartistLineChart;
  }
}

const SAMPLES: number = 50;

type Point = {
  x: number;
  y: number;
};

@Component
export default class Plotter extends Vue {
  @Prop() private id!: string;
  @Prop() private label!: string;
  @Prop() private labels!: string[];

  public f: (x: number) => number = x => Math.sin(x * Math.PI * 2); // TODO fix this
  public ticks: number[] = [0, 0.33, 0.66, 1]; // TODO fix this

  private chart!: Chartist.IChartistLineChart;

  public mounted() {
    this.chart = new Chartist.Line(
      $(`.plot`).get(0),
      Plotter.buildData(this.f),
      Plotter.buildOptions(this.labels, this.ticks)
    );
  }

  @Watch('f')
  public updateChart (f: (x: number) => number, ticks: number[]) {
    this.chart.update(Plotter.buildData(f), Plotter.buildOptions(this.labels, ticks));
  };

  private static buildData = (f: (x: number) => number): {} => {
    let values: Point[] = [];
    for (let i: number = 0; i <= SAMPLES; i++) {
      values.push({
        x: i / SAMPLES,
        y: f(i / SAMPLES)
      });
    }

    return { series: [{ data: values }] };
  };

  private static buildOptions = (labels: string[], ticks: number[]): {} => {
    let i: number = 0;
    return {
      height: 135,
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
  };
}
</script>

<style>
.plot {
  /* positioning */
  position: relative;
  float: left;

  /* box-model */
  margin: 0px 0px;
  padding: 10px;

  /* visual */
  background-color: rgb(237, 239, 240);
}

.ct-chart-bar {
  padding: 10px;
}

.ct-series-a .ct-line {
  stroke: #3f3f3f;
  stroke-width: 2px;
}
</style>

