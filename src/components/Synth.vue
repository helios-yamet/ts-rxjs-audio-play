<template>
  <div class="container synth">
    <div class="row">
      <div class="col-md">
        <Panel id="panel-gate" label="Gate">
          <Gate v-on:note-on="synth.noteOn()" v-on:note-off="synth.noteOff()"></Gate>
        </Panel>
        <Panel id="panel-envelope" label="Envelope">
          <Knob id="env-a" :ctrl="synthState.envAttack"></Knob>
          <Knob id="env-d" :ctrl="synthState.envDecay"></Knob>
          <Knob id="env-s" :ctrl="synthState.envSustain"></Knob>
          <Knob id="env-r" :ctrl="synthState.envRelease"></Knob>
        </Panel>
      </div>
    </div>
    <div class="row">
      <div class="col-md">
        <Panel id="panel-synth" label="Vowel Synthesis">
          <Plotter id="plotter" :lfWaveform="lfWaveform"></Plotter>
          <Knob id="knob-shap" :ctrl="synthState.shapeParam"></Knob>
          <Knob id="knob-freq" :ctrl="synthState.frequency"></Knob>
          <Knob id="knob-aspi" :ctrl="synthState.aspiration"></Knob>
          <Knob id="knob-vowel" :ctrl="synthState.vowel"></Knob>
        </Panel>
      </div>
    </div>
    <div class="row">
      <div class="col-md">
        <Panel id="panel-vibrato" label="Vibrato">
          <Knob id="vib-amt" :ctrl="synthState.vibAmount"></Knob>
          <Knob id="vib-freq" :ctrl="synthState.vibFrequency"></Knob>
          <Knob id="vib-depth" :ctrl="synthState.vibDepth"></Knob>
        </Panel>
        <Panel id="panel-output" label="Output">
          <Visualizer id="visualizer" :mainAudio="mainAudio"></Visualizer>
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
import Visualizer from "@/components/Visualizer.vue";
import MainAudio from "@/core/main-audio";
import GlottalSynth from "@/core/glottal-synth";
import Formants, { Vowel, IFormantDefinition } from "@/core/formants";
import MidiController from "@/core/midi-controller";
import SynthState from "@/core/synth-state";

@Component({
  components: { Gate, Knob, Panel, Plotter, Visualizer }
})
export default class Synth extends Vue {
  @Prop(MainAudio) private mainAudio!: MainAudio;

  private lfWaveform: ILfWaveform = { tp: 0, te: 0, ta: 0, tc: 0, values: [] };
  private synthState = new SynthState();
  private midiInputs: WebMidi.MIDIPort[] = [];

  private midiController!: MidiController;
  private synth!: GlottalSynth;

  private created() {
    this.synth = new GlottalSynth(this.mainAudio, (v: ILfWaveform) => {
      this.lfWaveform = v;
    });
    this.midiController = new MidiController(
      this.synth,
      this.synthState.getAllControls()
    );
    this.midiController.getMidiInterfaces().then(map => {
      this.midiController.connectMidiInterface("input-1");
    });
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
  width: 720px;
  border-radius: 5px;
  margin: auto;
  padding: 30px 20px 20px 20px;

  /* visual */
  background-color: #26618e;
}
</style>
