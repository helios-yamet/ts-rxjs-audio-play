<template>
  <div>
    <div class="row">
      <Panel id="panel-synth" label="Vowel Synthesis">
        <Plotter id="plotter" label="Waveform" :labels="['Ts', 'Tp', 'Te', 'Tc']"></Plotter>
        <Knob
          id="knob-shap"
          label="Shape (rd)"
          :minValue="synthState.shapeParam.min"
          :maxValue="synthState.shapeParam.max"
          :value.sync="synthState.shapeParam.init"
          v-on:select="selectKnob"
        ></Knob>
        <Knob
          id="knob-freq"
          label="Frequency"
          :minValue="synthState.frequency.min"
          :maxValue="synthState.frequency.max"
          :value.sync="synthState.frequency.init"
        ></Knob>
        <Knob
          id="knob-aspi"
          label="Aspiration"
          :minValue="synthState.aspiration.min"
          :maxValue="synthState.aspiration.max"
          :value.sync="synthState.aspiration.init"
        ></Knob>
        <Knob
          id="knob-vowel"
          label="Vowel"
          :minValue="synthState.vowel.min"
          :maxValue="synthState.vowel.max"
          :value.sync="synthState.vowel.init"
        ></Knob>
      </Panel>
    </div>
    <div class="row">
      <Panel id="panel-vibrato" label="Vibrato">
        <Knob
          id="vib-amt"
          label="Amount"
          :minValue="synthState.vibAmount.min"
          :maxValue="synthState.vibAmount.max"
          :value.sync="synthState.vibAmount.init"
        ></Knob>
        <Knob
          id="vib-freq"
          label="Frequency"
          :minValue="synthState.vibFrequency.min"
          :maxValue="synthState.vibFrequency.max"
          :value.sync="synthState.vibFrequency.init"
        ></Knob>
        <Knob
          id="vib-depth"
          label="Depth"
          :minValue="synthState.vibDepth.min"
          :maxValue="synthState.vibDepth.max"
          :value.sync="synthState.vibDepth.init"
        ></Knob>
      </Panel>
      <Panel id="panel-envelope" label="Envelope">
        <Knob
          id="env-a"
          label="Attack"
          :minValue="synthState.envAttack.min"
          :maxValue="synthState.envAttack.max"
          :value.sync="synthState.envAttack.init"
        ></Knob>
        <Knob
          id="env-d"
          label="Decay"
          :minValue="synthState.envDecay.min"
          :maxValue="synthState.envDecay.max"
          :value.sync="synthState.envDecay.init"
        ></Knob>
        <Knob
          id="env-s"
          label="Sustain"
          :minValue="synthState.envSustain.min"
          :maxValue="synthState.envSustain.max"
          :value.sync="synthState.envSustain.init"
        ></Knob>
        <Knob
          id="env-r"
          label="Release"
          :minValue="synthState.envRelease.min"
          :maxValue="synthState.envRelease.max"
          :value.sync="synthState.envRelease.init"
        ></Knob>
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

// import LfModelNode from '@/core/lf-model-node';

class SynthProp {
  public init: number;
  public min: number;
  public max: number;
  constructor(init?: number, min?: number, max?: number) {
    this.init = init || 0;
    this.min = min || 0;
    this.max = max || 100;
  }
}
class SynthState {
  public shapeParam = new SynthProp(20);
  public frequency = new SynthProp(120, 30, 450);
  public aspiration = new SynthProp();
  public vowel = new SynthProp(20, 0, 24);
  public vibAmount = new SynthProp(50);
  public vibFrequency = new SynthProp(50);
  public vibDepth = new SynthProp(10);
  public envAttack = new SynthProp(20);
  public envDecay = new SynthProp();
  public envSustain = new SynthProp(100);
  public envRelease = new SynthProp(15);
}

@Component({
  components: { Knob, Panel, Plotter }
})
export default class Synth extends Vue {
  @Prop(MainAudio) private mainAudio!: MainAudio;

  public synthState = new SynthState();

  selectKnob(knob: any) {
    console.log(`Knob selected! --> ${knob}`);
  }
}
</script>

<style scoped>
</style>
