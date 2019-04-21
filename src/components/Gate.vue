<template>
  <div class="gate">
    <div>
      <button
        class="btn btn-sm"
        role="button"
        :aria-pressed="isOn"
        v-on:mousedown="clickButton"
        v-on:mouseup="releaseButton"
        v-on:mouseleave="releaseButton"
        :class="{ active : isOn, 'btn-primary' : isOn, 'btn-danger' : !isOn}"
      >{{ isOn ? "On" : "Off" }}</button>
      <input type="checkbox" id="check-hold" v-model="hold" v-on:change="releaseButton">
      <label class="form-check-label" for="check-hold">Hold</label>
    </div>
    <div>
      <select
        v-model="selectedMidiInputId"
        v-on:change="$emit('midi-input-selected', selectedMidiInputId)"
        :disabled="noMidiInput"
      >
        <option
          value
          disabled
          hidden
        >{{ noMidiInput ? "(no MIDI input found)" : "-- select MIDI input -- " }}</option>
        <option v-for="input in midiInputs" :key="input.id" :value="input.id">{{ input.name }}</option>
      </select>
      <a href="#" v-on:click="toggleMidiLearn()" class="midi-learn" v-if="selectedMidiInputId !== ''">{{ !midiLearning ? "MIDI learn" : "stop MIDI learn"}}</a>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";
import MidiController from "@/core/midi-controller";

@Component
export default class Gate extends Vue {
  @Prop(Object) private midiController!: MidiController;

  private isOn: boolean = false;
  private hold: boolean = false;
  private selectedMidiInputId: string = "";
  private midiInputs: WebMidi.MIDIPort[] = [];
  private midiLearning: boolean = false;

  private get noMidiInput() {
    return this.midiInputs.length === 0;
  }

  public created() {
    this.midiController.getMidiInterfaces().then(map => {
      this.midiInputs = Array.from(map.values());
    });
  }

  @Emit()
  private toggleMidiLearn() {
    this.midiLearning = !this.midiLearning;
    return this.midiLearning;
  }

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
  width: 170px;
  font-size: 0.9em;
}

button {
  margin: 10px 0px;
  width: 80px;
}

input {
  position: relative;
  top: 2px;
  margin-left: 10px;
}

label {
  margin-left: 5px;
}

select {
  width: 100%;
  margin-bottom: 3px;
}

a.midi-learn {
  display: block;
  float: right;
  font-size: 0.8em;
}
</style>
