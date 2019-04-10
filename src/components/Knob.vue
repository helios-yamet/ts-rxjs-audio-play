<template>
  <div v-bind:id="id" v-bind:title="id" class="knob">
    <div class="knob-drag-area"></div>
    <div class="knob-value">0</div>
    <div class="knob-sprites-wrapper">
      <div class="knob-sprites"></div>
    </div>
    <div class="knob-label">
      <span>{{ label }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import $ from "jquery";
import * as Rx from "rxjs/Rx";

@Component
export default class Knob extends Vue {
  @Prop(String) readonly id!: string;
  @Prop(String) readonly label!: string;
  @Prop(Number) readonly minValue!: number;
  @Prop(Number) readonly maxValue!: number;
  @Prop(Number) readonly initialValue!: number;
  //@Prop(Function) readonly displayValue!: (value: number) => string;
  //@Prop(Function) readonly selectionCallback!: (knob: Knob) => void;

  private subscriptions: Rx.Subscription[];
  private $knobLabel!: JQuery<HTMLElement>;
  private $knobDragArea!: JQuery<HTMLElement>;
  private $knobSprites!: JQuery<HTMLElement>;
  private $knobValue!: JQuery<HTMLElement>;

  private subject: Rx.BehaviorSubject<number>;

  private midiId: number | undefined;

  constructor() {
    super();
    this.subscriptions = [];
    this.subject = new Rx.BehaviorSubject(this.initialValue);
  }

  mounted(){
    
    // resolve jQuery elements
    this.$knobLabel = $(`#${this.id} .knob-label`);
    this.$knobDragArea = $(`#${this.id} .knob-drag-area`);
    this.$knobSprites = $(`#${this.id} .knob-sprites`);
    this.$knobValue = $(`#${this.id} .knob-value`);

    this.subscriptions.push(this.setupDrag());
    this.subscriptions.push(this.setupUIUpdate());
    //this.subscriptions.push(this.setupSelector(this.selectionCallback));
  }

  beforeDestroy(){
    this.subscriptions.forEach(s => s.unsubscribe()); // TODO check if this is necessary
  }

  /**
   * Simple drag behavior for the knob (new value changes relative to current value).
   */
  private setupDrag = function(this: Knob): Rx.Subscription {
    const MAX_DRAG_DIST: number = 100;

    let mouseDown$ = Rx.Observable.fromEvent<MouseEvent>(
      this.$knobDragArea.get(0),
      "mousedown"
    );
    let mouseMove$ = Rx.Observable.fromEvent<MouseEvent>(document, "mousemove");
    let mouseUp$ = Rx.Observable.fromEvent<MouseEvent>(document, "mouseup");
    let mouseDrag$: Rx.Observable<number> = mouseDown$.flatMap(
      (downEvent: MouseEvent) => {
        downEvent.preventDefault();
        let startY: number = downEvent.screenY;
        let startValue: number = this.subject.value;

        return mouseMove$
          .map(moveEvent => {
            let dist: number = startY - moveEvent.screenY;
            let sign: number = dist < 0 ? -1 : 1;
            let normalizedDist: number =
              Math.min(Math.abs(dist), MAX_DRAG_DIST) * sign;
            let distRatio: number = normalizedDist / MAX_DRAG_DIST;
            let newValue: number =
              startValue + distRatio * (this.maxValue - this.minValue);
            return Math.round(
              Math.min(this.maxValue, Math.max(this.minValue, newValue))
            );
          })
          .distinctUntilChanged()
          .takeUntil(mouseUp$);
      }
    );

    return mouseDrag$.subscribe(
      state => this.subject.next(state),
      error => console.error(error)
    );
  };

  /**
   * Update the UI to reflect the subject value change.
   */
  private setupUIUpdate = function(this: Knob): Rx.Subscription {
    const NB_FRAMES: number = 50;
    const SPRITE_WIDTH: number = 100;

    return this.subject.subscribe(
      (state: number) => {
        let ratio: number =
          (state - this.minValue) / (this.maxValue - this.minValue);
        let frame: number = Math.floor(ratio * (NB_FRAMES - 1));
        this.$knobSprites.css(
          "transform",
          `translate(${-frame * SPRITE_WIDTH}px, 0px)`
        );
        this.$knobValue.text(state); // TODO receive this label from above
      },
      error => console.error(error),
      () => console.log("Completed")
    );
  };

  /**
   * Setup the selection behaviour by click (report selection to caller)
   */
  private setupSelector = function(
    this: Knob,
    selectionCallback: (knob: Knob) => void
  ): Rx.Subscription {
    return Rx.Observable.fromEvent(this.$knobLabel.get(0), "click").subscribe(
      () => {
        selectionCallback(this);
      }
    );
  };

  /**
   * Emit the next value for this knob, normalized according to min/max values.
   */
  public nextByRatio = function(this: Knob, ratio: number): void {
    this.subject.next(
      Math.round(this.minValue + ratio * (this.maxValue - this.minValue))
    );
  };

  /**
   * Report MIDI mapping (called by input controller)
   * @param selected Selected or not
   */
  public notifyMidiMapping = function(this: Knob, midiId: number): void {
    this.midiId = midiId;
  };

  /**
   * Mark as selected (or unselected)
   * @param selected Selected or not
   */
  public markSelection = function(this: Knob, selected: boolean): void {
    if (selected) {
      this.$knobLabel.addClass("selected");
    } else {
      this.$knobLabel.removeClass("selected");
    }
  };
}
</script>

<style>
.knob {
  /* positioning */
  position: relative;
  float: left;

  /* box-model */
  margin: 0px 0px;
  padding: 10px;

  /* visual */
  background-color: rgb(237, 239, 240);
}

.knob-drag-area {
  /* positioning */
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 2;

  /* box-model */
  width: 80px;
  height: 80px;

  /* visual */
  opacity: 0;

  /* misc */
  cursor: n-resize;
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
  font-size: 1em;
  font-family: sans-serif;
  color: rgb(99, 99, 99);
  text-align: center;

  /* misc */
  user-select: none;
  cursor: pointer;
}

.knob-label :hover {
  /* typography */
  font-weight: bold;
}

.knob-label.selected {
  /* box-model */
  border: 2px solid #24303a;

  /* visual */
  background-color: #5e676e;

  /* typography */
  font-weight: bold;
  color: white;
}
</style>

