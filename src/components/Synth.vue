<template>
  <div class="container synth">
    <div class="row">
      <div class="col-md">
        <Panel id="panel-gate" label="Gate">
          <Gate v-on:note-on="synth.noteOn()" v-on:note-off="synth.noteOff()"></Gate>
        </Panel>
        <Panel id="panel-synth" label="Vowel Synthesis">
          <Plotter id="plotter" label="Waveform" :labels="['Ts', 'Tp', 'Te', 'Tc']"></Plotter>
          <Knob
            id="knob-shap"
            label="Shape (rd)"
            :minValue="synthState.shapeParam.min"
            :maxValue="synthState.shapeParam.max"
            :value.sync="synthState.shapeParam.value"
            v-on:select="selectKnob"
          ></Knob>
          <Knob
            id="knob-freq"
            label="Frequency"
            :minValue="synthState.frequency.min"
            :maxValue="synthState.frequency.max"
            :value.sync="synthState.frequency.value"
          ></Knob>
          <Knob
            id="knob-aspi"
            label="Aspiration"
            :minValue="synthState.aspiration.min"
            :maxValue="synthState.aspiration.max"
            :value.sync="synthState.aspiration.value"
          ></Knob>
          <Knob
            id="knob-vowel"
            label="Vowel"
            :minValue="synthState.vowel.min"
            :maxValue="synthState.vowel.max"
            :value.sync="synthState.vowel.value"
          ></Knob>
        </Panel>
      </div>
    </div>
    <div class="row">
      <div class="col-md">
        <Panel id="panel-vibrato" label="Vibrato">
          <Knob
            id="vib-amt"
            label="Amount"
            :minValue="synthState.vibAmount.min"
            :maxValue="synthState.vibAmount.max"
            :value.sync="synthState.vibAmount.value"
          ></Knob>
          <Knob
            id="vib-freq"
            label="Frequency"
            :minValue="synthState.vibFrequency.min"
            :maxValue="synthState.vibFrequency.max"
            :value.sync="synthState.vibFrequency.value"
          ></Knob>
          <Knob
            id="vib-depth"
            label="Depth"
            :minValue="synthState.vibDepth.min"
            :maxValue="synthState.vibDepth.max"
            :value.sync="synthState.vibDepth.value"
          ></Knob>
        </Panel>
        <Panel id="panel-envelope" label="Envelope">
          <Knob
            id="env-a"
            label="Attack"
            :minValue="synthState.envAttack.min"
            :maxValue="synthState.envAttack.max"
            :value.sync="synthState.envAttack.value"
          ></Knob>
          <Knob
            id="env-d"
            label="Decay"
            :minValue="synthState.envDecay.min"
            :maxValue="synthState.envDecay.max"
            :value.sync="synthState.envDecay.value"
          ></Knob>
          <Knob
            id="env-s"
            label="Sustain"
            :minValue="synthState.envSustain.min"
            :maxValue="synthState.envSustain.max"
            :value.sync="synthState.envSustain.value"
          ></Knob>
          <Knob
            id="env-r"
            label="Release"
            :minValue="synthState.envRelease.min"
            :maxValue="synthState.envRelease.max"
            :value.sync="synthState.envRelease.value"
          ></Knob>
        </Panel>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import Gate from "@/components/Gate.vue";
import Knob from "@/components/Knob.vue";
import Panel from "@/components/Panel.vue";
import Plotter from "@/components/Plotter.vue";
import MainAudio from "@/core/main-audio";
import GlottalSynth from "@/core/glottal-synth";
import Formants, { Vowel, IFormantDefinition } from "@/core/formants";
// import LfModelNode from '@/core/lf-model-node';

class SynthProp {
  public value: number;
  public min: number;
  public max: number;
  constructor(value?: number, min?: number, max?: number) {
    this.value = value || 0;
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
  components: { Gate, Knob, Panel, Plotter }
})
export default class Synth extends Vue {
  @Prop(MainAudio) private mainAudio!: MainAudio;

  public synthState = new SynthState();
  private synth!: GlottalSynth;

  private created() {
    this.synth = new GlottalSynth(this.mainAudio, 70, Vowel.A_Bass);
  }

  private selectKnob(knob: any) {
    console.log(`Knob selected! --> ${knob}`);
  }

  @Watch("synthState.shapeParam.value")
  private onShapeParam(value: number) {
    this.synth.setShapeParam(value);
  }

  @Watch("synthState.frequency.value")
  private onFrequency(value: number) {
    this.synth.setFrequency(value);
  }

  @Watch("synthState.aspiration.value")
  private onAspiration(value: number) {
    this.synth.setAspiration(value);
  }

  @Watch("synthState.vowel.value")
  private onVowel(value: number) {
    this.synth.setVowel(Formants.all[value].vowel);
  }

  @Watch("synthState.vibAmount.value")
  private onVibAmount(value: number) {
    this.synth.setVibratoAmount(value);
  }

  @Watch("synthState.vibFrequency.value")
  private onVibFrequency(value: number) {
    this.synth.setVibratoFrequency(value);
  }

  @Watch("synthState.vibDepth.value")
  private onVibDepth(value: number) {
    this.synth.setVibratoDepth(value);
  }

  @Watch("synthState.envAttack.value")
  private onEnvAttack(value: number) {
    this.synth.setEnvelopeAttack(value);
  }

  @Watch("synthState.envDecay.value")
  private onEnvDecay(value: number) {
    this.synth.setEnvelopeDecay(value);
  }

  @Watch("synthState.envSustain.value")
  private onEnvSustain(value: number) {
    this.synth.setEnvelopeSustain(value);
  }

  @Watch("synthState.envRelease.value")
  private onEnvRelease(value: number) {
    this.synth.setEnvelopeRelease(value);
  }
}
</script>

<style scoped>
.synth {
  /* box model */
  margin: auto;
  width: 950px;

  /* positioning */
  padding: 50px 20px 30px 20px;

  background-color: #26618e;
}
</style>
