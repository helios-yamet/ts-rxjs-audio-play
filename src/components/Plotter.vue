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

type Point = {
  x: number;
  y: number;
};

@Component
export default class Plotter extends Vue {
  @Prop() private id!: string;
  @Prop() private lfWaveform!: ILfWaveform;

  private chart!: Chartist.IChartistLineChart;

  public mounted() {
    this.chart = new Chartist.Line(
      $(`.plot`).get(0),
      Plotter.buildData(this.lfWaveform),
      Plotter.buildOptions(this.lfWaveform)
    );
  }

  @Watch("lfWaveform")
  private updateChart() {
    this.chart.update(
      Plotter.buildData(this.lfWaveform),
      Plotter.buildOptions(this.lfWaveform)
    );
  }

  private static buildData = (waveform: ILfWaveform): {} => {
    let values: Point[] = [];
    for (let i: number = 0; i <= waveform.values.length; i++) {
      values.push({
        x: i / waveform.values.length,
        y: waveform.values[i]
      });
    }

    return { series: [{ data: values }] };
  };

  private static buildOptions = (waveform: ILfWaveform): {} => {
    let i: number = 0;
    const labels = ["Tp", "Te", "Ta", "Tc"];
    return {
      height: 135,
      width: 200,
      lineSmooth: false,
      showPoint: false,
      axisY: {
        type: Chartist.AutoScaleAxis,
        labelOffset: {
          x: 0,
          y: 5
        },
        offset: 22,
        high: .5,
        low: -1
      },
      axisX: {
        type: Chartist.FixedScaleAxis,
        offset: 22,
        high: 1,
        low: 0,
        ticks: [waveform.tp, waveform.te, waveform.ta, waveform.tc],
        labelInterpolationFnc: () => labels[i++]
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
  padding: 0px;

  /* visual */
  background-color: rgb(237, 239, 240);
}

.ct-chart-line {
  padding-left: -10px;
}

.ct-series-a .ct-line {
  stroke: #3f3f3f;
  stroke-width: 2px;
}
</style>

