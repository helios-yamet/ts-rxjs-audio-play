<template>
  <div id="app">
    <AppHeader></AppHeader>
    <div id="content">
      <div class="row">
        <div id="main-controls-container" class="col-md-8 col-push-2">
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

@Component({
  components: { AppHeader, AppFooter, Knob, Panel }
})
export default class App extends Vue {
  @Prop() private knobs!: string[];
}
</script>

<style>
#content {
  margin-top: 60px;
}
</style>
