<template>
  <div class="gate">
    <button
      class="btn btn-sm"
      role="button"
      :aria-pressed="isOn"
      v-on:mousedown="clickButton"
      v-on:mouseup="releaseButton"
      v-on:mouseleave="releaseButton"
      :class="{ active : isOn, 'btn-primary' : isOn, 'btn-danger' : !isOn}"
    >{{ isOn ? "On" : "Off" }}</button>
    <div class="form-check">
      <input
        type="checkbox"
        class="form-check-input"
        id="check-hold"
        v-model="hold"
        v-on:change="releaseButton"
      >
      <label class="form-check-label" for="check-hold">Hold</label>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";

@Component
export default class Gate extends Vue {
  public isOn: boolean = false;
  public hold: boolean = false;

  private clickButton() {
    if (!this.isOn) {
      this.isOn = true;
      this.noteOn();
    } else if (this.isOn && this.hold) {
      this.isOn = false;
      this.noteOff();
    }
  }

  private releaseButton() {
    if (this.isOn && !this.hold) {
      this.isOn = false;
      this.noteOff();
    }
  }

  @Emit()
  private noteOn() {}

  @Emit()
  private noteOff() {}
}
</script>

<style scoped>
.gate {
  width: 110px;
}

.gate button {
  margin: 10px 0px;
  width: 100px;
}
</style>
