<template>
  <div id="app">
    <AppHeader></AppHeader>
    <div id="content">
      <div class="row">
        <div id="inputs-container" class="col-md"></div>
        <div id="main-controls-container" class="col-md">
          <Panel id="panel-1" label="Hello Panel">
            <Knob
              v-for="(knob, key) in ['12', '32']"
              :key="key"
              :id="knob"
              :label="knob"
              :minValue="0"
              :maxValue="200"
              :initialValue="50"
            ></Knob>
          </Panel>
        </div>
        <div id="outputs-container" class="col-md">
          <Visualizer id="visualizer" :mainAudio="mainAudio"></Visualizer>
        </div>
      </div>
    </div>
    <AppFooter></AppFooter>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import Knob from "@/components/Knob.vue";
import Panel from "@/components/Panel.vue";
import Visualizer from "@/components/Visualizer.vue";

import GlottalInput from "./core/glottal-input";
import InputController from "./core/input-controller";
import MainAudio from "./core/main-audio";

@Component({
  components: { AppHeader, AppFooter, Knob, Panel, Visualizer }
})
export default class App extends Vue {
  @Prop() private knobs!: string[];

  // private inputController: InputController;
  private input!: GlottalInput;
  private mainAudio: MainAudio;

  constructor() {
    super();

    this.mainAudio = new MainAudio();
    // this.inputController = new InputController();
    /* this.input = new GlottalInput(
      "main-controls-container",
      "glottal",
      mainAudio,
      this.inputController
    ); */
  }
}
</script>

<style>
#content {
  margin-top: 60px;
}
</style>
