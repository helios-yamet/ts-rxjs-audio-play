<template>
  <div v-bind:id="id" v-bind:title="id" class="knob">
    <div
      class="knob-drag-area"
      :class="{'map-mode': ctrl.midiMapMode, 'map-learn': ctrl.midiMapLearning}"
      @click="midiMapSelected"
    ></div>
    <div class="knob-value">{{ displayValueInternal() }}</div>
    <div class="knob-sprites-wrapper">
      <div class="knob-sprites" :style="rotation"></div>
    </div>
    <div class="knob-label">
      <span>{{ ctrl.name }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Emit } from "vue-property-decorator";
import $ from "jquery";
import * as Rx from "rxjs/Rx";

@Component
export default class Knob extends Vue {
  @Prop(String) private id!: string;
  @Prop(String) private label!: string;
  @Prop(Object) private ctrl!: ISynthControl;

  private subscriptions!: Rx.Subscription[];

  private displayValueInternal() {
    return this.ctrl.display
      ? this.ctrl.display(this.ctrl.value)
      : this.ctrl.value;
  }

  private get rotation() {
    const NB_FRAMES: number = 50;
    const SPRITE_WIDTH: number = 100;
    const ratio: number =
      (this.ctrl.value - this.ctrl.min) /
      (this.ctrl.max - this.ctrl.min);
    const frame: number = Math.floor(ratio * (NB_FRAMES - 1));
    return `transform: translate(${-frame * SPRITE_WIDTH}px, 0px)`;
  }

  public get valueRatio(): number {
    return (
      (this.ctrl.value - this.ctrl.min) /
      (this.ctrl.max - this.ctrl.min)
    );
  }

  private midiMapSelected() {
    if (this.ctrl.midiMapMode) {
      this.$emit("midi-map-selected", this.ctrl);
    }
  }

  private mounted() {
    const MAX_DRAG_DIST: number = 100;

    const mouseDown$ = Rx.Observable.fromEvent<MouseEvent>(
      $(`#${this.id} .knob-drag-area`).get(0),
      "mousedown"
    );

    const mouseDrag$: Rx.Observable<number> = mouseDown$
      .filter(() => !this.ctrl.midiMapMode)
      .flatMap((downEvent: MouseEvent) => {
        downEvent.preventDefault();
        const startY: number = downEvent.screenY;
        const startValue: number = this.ctrl.value;

        return Rx.Observable.fromEvent<MouseEvent>(document, "mousemove")
          .map(moveEvent => {
            const dist: number = startY - moveEvent.screenY;
            const sign: number = dist < 0 ? -1 : 1;
            const normalizedDist: number =
              Math.min(Math.abs(dist), MAX_DRAG_DIST) * sign;
            const distRatio: number = normalizedDist / MAX_DRAG_DIST;
            const newValue: number =
              startValue + distRatio * (this.ctrl.max - this.ctrl.min);
            return Math.round(
              Math.min(this.ctrl.max, Math.max(this.ctrl.min, newValue))
            );
          })
          .distinctUntilChanged()
          .takeUntil(Rx.Observable.fromEvent<MouseEvent>(document, "mouseup"));
      });

    this.subscriptions = [];
    this.subscriptions.push(
      mouseDrag$.subscribe(
        state => { this.ctrl.value = state; },
        error => console.error(error)
      )
    );
  }

  private beforeDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
</script>

<style>
.knob {
  /* positioning */
  position: relative;
  float: left;

  /* box-model */
  margin: 0px 0px;
  padding: 0px 5px;

  /* visual */
  background-color: rgb(237, 239, 240);
}

.knob-drag-area {
  /* positioning */
  position: absolute;
  left: 15px;
  top: 7px;
  z-index: 2;

  /* box-model */
  width: 80px;
  height: 80px;

  /* visual */
  opacity: 0;

  /* misc */
  cursor: n-resize;
}

.knob-drag-area.map-mode {
  /* visual */
  background-color: #af58ff;
  opacity: 0.5;

  /* misc */
  cursor: pointer;
}

.knob-drag-area.map-mode.map-learn {
  /* box-model */
  border: 4px solid #e6a1e6;
}

.knob-sprites-wrapper {
  /* positioning */
  position: relative;

  /* box-model */
  width: 100px;
  height: 100px;
  margin: 0px 0px;

  /* misc */
  overflow: hidden;
}

.knob-sprites {
  /* positioning */
  position: absolute;
  left: 0;
  top: 0;

  /* box-model */
  width: 5000px;
  height: 100%;

  /* visual */
  background-image: url("../assets/sprites_w100_h100_50frames.png");
  background-size: 100%, 100%;
  background-repeat: no-repeat;
}

.knob-value {
  /* positioning */
  position: relative;
  left: 0;
  top: 70px;
  z-index: 1;

  /* box-model */
  width: 100px;
  height: 30px;
  margin-top: -30px;

  /* typography */
  font-weight: bold;
  font-size: 1em;
  font-family: monospace;
  color: white;
  text-align: center;

  /* misc */
  user-select: none;
}

.knob-label {
  /* box-model */
  width: 100%;
  height: 25px;
  border: 2px solid rgb(99, 99, 99);
  border-radius: 5px;
  margin-bottom: 10px;

  /* visual */
  background-color: #b6cfe2;

  /* typography */
  font-size: 0.9em;
  font-family: sans-serif;
  color: rgb(99, 99, 99);
  text-align: center;

  /* misc */
  user-select: none;
}
</style>

