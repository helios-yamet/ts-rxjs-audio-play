<template>
  <div class="container synth">
    <div class="row">
      <div class="col-md">
        <Panel id="panel-gate" label="Gate">
          <Gate
            @note-on="synth.noteOn()"
            @note-off="synth.noteOff()"
            @midi-input-selected="midi.connectMidiInterface($event)"
            @toggle-midi-learn="toggleMidiLearn($event)"
            :midiController="midi"
          ></Gate>
        </Panel>
        <Panel id="panel-envelope" label="Envelope">
          <Knob id="env-a" @midi-learn="midi.learn($event)" :ctrl="state.envAttack"></Knob>
          <Knob id="env-d" @midi-learn="midi.learn($event)" :ctrl="state.envDecay"></Knob>
          <Knob id="env-s" @midi-learn="midi.learn($event)" :ctrl="state.envSustain"></Knob>
          <Knob id="env-r" @midi-learn="midi.learn($event)" :ctrl="state.envRelease"></Knob>
        </Panel>
      </div>
    </div>
    <div class="row">
      <div class="col-md">
        <Panel id="panel-synth" label="Vowel Synthesis">
          <Plotter id="plotter" :lfWaveform="lfWaveform"></Plotter>
          <Knob id="knob-shap" @midi-learn="midi.learn($event)" :ctrl="state.shapeParam"></Knob>
          <Knob id="knob-freq" @midi-learn="midi.learn($event)" :ctrl="state.frequency"></Knob>
          <Knob id="knob-aspi" @midi-learn="midi.learn($event)" :ctrl="state.aspiration"></Knob>
          <Knob id="knob-vowel" @midi-learn="midi.learn($event)" :ctrl="state.vowel"></Knob>
        </Panel>
      </div>
    </div>
    <div class="row">
      <div class="col-md">
        <Panel id="panel-vibrato" label="Vibrato">
          <Knob id="vib-amt" @midi-learn="midi.learn($event)" :ctrl="state.vibAmount"></Knob>
          <Knob id="vib-freq" @midi-learn="midi.learn($event)" :ctrl="state.vibFrequency"></Knob>
          <Knob id="vib-depth" @midi-learn="midi.learn($event)" :ctrl="state.vibDepth"></Knob>
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
  private state = new SynthState();
  private midi: MidiController = new MidiController();

  private synth!: GlottalSynth;

  private created() {
    this.synth = new GlottalSynth(this.mainAudio, (v: ILfWaveform) => {
      this.lfWaveform = v;
    });
    this.midi.setSoundUnit(this.synth);
  }

  private toggleMidiLearn(toggle: boolean) {
    this.state.setMidiLearn(toggle);
    if (!toggle) {
      this.midi.stopLearn();
    }
  }

  @Watch("state.shapeParam.value")
  private onShapeParam(value: number) {
    this.synth.setShapeParam(value);
  }

  @Watch("state.frequency.value")
  private onFrequency(value: number) {
    this.synth.setFrequency(value);
  }

  @Watch("state.aspiration.value")
  private onAspiration(value: number) {
    this.synth.setAspiration(value);
  }

  @Watch("state.vowel.value")
  private onVowel(value: number) {
    this.synth.setVowel(Formants.all[value].vowel);
  }

  @Watch("state.vibAmount.value")
  private onVibAmount(value: number) {
    this.synth.setVibratoAmount(value);
  }

  @Watch("state.vibFrequency.value")
  private onVibFrequency(value: number) {
    this.synth.setVibratoFrequency(value);
  }

  @Watch("state.vibDepth.value")
  private onVibDepth(value: number) {
    this.synth.setVibratoDepth(value);
  }

  @Watch("state.envAttack.value")
  private onEnvAttack(value: number) {
    this.synth.setEnvelopeAttack(value);
  }

  @Watch("state.envDecay.value")
  private onEnvDecay(value: number) {
    this.synth.setEnvelopeDecay(value);
  }

  @Watch("state.envSustain.value")
  private onEnvSustain(value: number) {
    this.synth.setEnvelopeSustain(value);
  }

  @Watch("state.envRelease.value")
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
