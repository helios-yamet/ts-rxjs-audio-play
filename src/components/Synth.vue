<template>
  <div>
    <div class="row">
      <Panel id="panel-synth" label="Vowel Synthesis">
        <Plotter></Plotter>
        <Knob id="knob-shap" label="Shape (rd)" :minValue="0" :maxValue="100" :initialValue="50"></Knob>
        <Knob id="knob-freq" label="Frequency" :minValue="30" :maxValue="450" :initialValue="120"></Knob>
        <Knob id="knob-aspi" label="Aspiration" :minValue="0" :maxValue="100" :initialValue="0"></Knob>
        <Knob id="knob-vowel" label="Vowel" :minValue="0" :maxValue="24" :initialValue="20"></Knob>
      </Panel>
    </div>
    <div class="row">
      <Panel id="panel-vibrato" label="Vibrato">
        <Knob id="vib-amt" label="Amount" :minValue="0" :maxValue="100" :initialValue="50"></Knob>
        <Knob id="vib-freq" label="Frequency" :minValue="0" :maxValue="100" :initialValue="50"></Knob>
        <Knob id="vib-depth" label="Depth" :minValue="0" :maxValue="100" :initialValue="10"></Knob>
      </Panel>
      <Panel id="panel-envelope" label="Envelope">
        <Knob id="env-a" label="Attack" :minValue="0" :maxValue="100" :initialValue="20"></Knob>
        <Knob id="env-d" label="Decay" :minValue="0" :maxValue="100" :initialValue="0"></Knob>
        <Knob id="env-s" label="Sustain" :minValue="0" :maxValue="100" :initialValue="100"></Knob>
        <Knob id="env-r" label="Release" :minValue="0" :maxValue="100" :initialValue="15"></Knob>
      </Panel>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Knob from "@/components/Knob.vue";
import Panel from "@/components/Panel.vue";
import Plotter from "@/components/Plotter.vue";
import MainAudio from "@/core/main-audio";

@Component({
  components: { Knob, Panel, Plotter }
})
export default class Synth extends Vue {
  @Prop(MainAudio) private mainAudio!: MainAudio;
  private shapeParam!: number;
  private frequency!: number;
  private aspiration!: number;
  private vowel!: number;
  private vibAmount!: number;
  private vibFrequency!: number;
  private vibDepth!: number;
  private envAttack!: number;
  private envDecay!: number;
  private envSustain!: number;
  private envRelease!: number;
}
</script>

<style scoped>
</style>
