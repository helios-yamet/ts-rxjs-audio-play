<template>
  <div v-bind:id="id" class="pan" v-bind:title="id">
    <div class="pan-label">
      <span>{{ label }}</span>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Panel extends Vue {
  @Prop() private id!: string;
  @Prop() private label!: string;
}
</script>

<style>
.pan {
  /* positioning */
  position: relative;
  float: left;

  /* box-model */
  margin: 0px 0px 10px 10px;
  padding: 10px;
  height: 205px;
  border-radius: 5px;

  /* visual */
  background-color: rgb(237, 239, 240);
}

.pan-label {
  /* box-model */
  width: 100%;
  height: 20px;
  margin-bottom: 10px;
  padding-left: 10px;
  border-radius: 5px;

  /* visual */
  background-color: #b6cfe2;

  /* typography */
  font-size: .9em;
  font-family: sans-serif;
  font-weight: bold;
  color: rgb(99, 99, 99);
  text-align: left;

  /* misc */
  user-select: none;
}
</style>
