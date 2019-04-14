<template>
  <div class="visualizer-wrapper">
    <canvas :id="id" class="visualizer" :title="id"></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import $ from 'jquery';
import MainAudio from '../core/main-audio';

@Component
export default class Visualizer extends Vue {
  @Prop(String) private id!: string;
  @Prop(MainAudio) private mainAudio!: MainAudio;

  private context!: CanvasRenderingContext2D;
  private canvas!: HTMLCanvasElement;

  mounted(){
    this.canvas = <HTMLCanvasElement>$(`#${this.id}`).get(0);
    const pixelRatio: number = window.devicePixelRatio || 1;
    const rect: ClientRect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * pixelRatio;
    this.canvas.height = rect.height * pixelRatio;
    this.context = this.canvas.getContext('2d')!;
    this.drawOscilloscope();
  }

  private drawOscilloscope () {
    requestAnimationFrame(this.drawOscilloscope);

    const FRAC: number = 4;
    const AMP: number = 1.5;

    const frequencies: Float32Array = this.mainAudio.getFrequencies();
    const len: number = frequencies.length;
    const barWidth: number = (this.canvas.width / len) * FRAC - 3;

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i: number = 0; i < len / FRAC; i++) {
      const x: number = this.canvas.width * (i / len) * FRAC;

      this.context.fillStyle = 'rgba(237, 239, 240, 1)';
      this.context.fillRect(x, 0, barWidth, this.canvas.height);

      const y: number = -frequencies[i] * AMP - 25;

      this.context.fillStyle = '#b6cfe2';
      this.context.fillRect(x, y, barWidth, this.canvas.height);

      this.context.fillStyle = 'rgb(94, 103, 111)';
      this.context.fillRect(x, y, barWidth, 3);
    }
  }
}
</script>

<style>
.visualizer-wrapper {
  /* box-model */
  margin-bottom: 0px;
  padding: 10px 20px 0px 30px;

  /* typography */
  text-align: center;
}

.visualizer-wrapper > canvas {
  /* positioning */
  width: 100%;
  height: 100px;
}
</style>

