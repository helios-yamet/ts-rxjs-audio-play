<template>
  <div id="app">
    <AppHeader></AppHeader>
    <div id="content" class="container">
      <div class="row">
        <div id="inputs-container" class="col"></div>
        <div id="main-controls-container" class="col">
          <Synth :mainAudio="mainAudio"></Synth>
        </div>
        <div id="outputs-container" class="col"></div>
      </div>
    </div>
    <AppFooter></AppFooter>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
import Synth from '@/components/Synth.vue';
import MainAudio from '@/core/main-audio';

@Component({
  components: { AppHeader, AppFooter, Synth },
})
export default class App extends Vue {

  private mainAudio: MainAudio;

  constructor() {
    super();
    this.mainAudio = new MainAudio();
  }
}
</script>

<style>
#content.container {
    margin-top: 60px;
}
</style>
