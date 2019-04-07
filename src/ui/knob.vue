<template>
  <div v-bind:id="id" v-bind:title="id" class="knob">
    <div class="knob-drag-area"></div>
    <div class="knob-value">0</div>
    <div class="knob-sprites-wrapper">
      <div class="knob-sprites"></div>
    </div>
    <div class="knob-label">
      <span>{{ label }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import * as Vue from 'vue'
import Component from 'vue-class-component'

@Component 
export default class KnobVue extends Vue {
  count = 0
  increment() { this.count++ }
}

import Vue from 'vue';
export default class KnobVue extends Vue {

  public id: string;
  public label: string;

  constructor(id: string, label: string){
    super();
    this.id = id;
    this.label = label;
  }
  data(): Object {
    return {
      id: this.id,
      label: this.label
    };
  }
}
</script>

<style>
.knob {

    /* positioning */
    position: relative;
    float: left;

    /* box-model */
    margin: 0px 0px;
    padding: 10px;

    /* visual */
    background-color: rgb(237, 239, 240);
}

.knob-drag-area {

    /* positioning */
    position: absolute;
    left: 20px;
    top: 20px;
    z-index: 2;

    /* box-model */
    width: 80px;
    height: 80px;

    /* visual */
    opacity: 0;

    /* misc */
    cursor: n-resize;
}

.knob-sprites-wrapper {

    /* positioning */
    position: relative;

    /* box-model */
    width: 100px;
    height: 100px;
    margin: 0px 0px;

    /* misc */
    overflow: hidden;
}

.knob-sprites {

    /* positioning */
    position: absolute;
    left: 0;
    top: 0;

    /* box-model */
    width: 5000px;
    height: 100%;

    /* visual */
    background-image: url("./sprites_w100_h100_50frames.png");
    background-size: 100%, 100%;
    background-repeat: no-repeat;
}

.knob-value {

    /* positioning */
    position: relative;
    left: 0;
    top: 70px;
    z-index: 1;

    /* box-model */
    width: 100px;
    height: 30px;
    margin-top: -30px;

    /* typography */
    font-weight: bold;
    font-size:1em;
    font-family: monospace;
    color: white;
    text-align: center;

    /* misc */
    user-select: none;
}

.knob-label {

    /* box-model */
    width: 100%;
    height: 25px;
    border: 2px solid rgb(99, 99, 99);
    border-radius: 5px;
    margin-bottom: 10px;

    /* visual */
    background-color: #b6cfe2;

    /* typography */
    font-size:1em;
    font-family: sans-serif;
    color: rgb(99, 99, 99);
    text-align: center;

    /* misc */
    user-select: none;
    cursor: pointer;
}

.knob-label :hover {
    
    /* typography */
    font-weight: bold;
}

.knob-label.selected {
 
    /* box-model */
    border: 2px solid #24303a;

    /* visual */
    background-color: #5e676e;

    /* typography */
    font-weight: bold;
    color: white;
}
</style>