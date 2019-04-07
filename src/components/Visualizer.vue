<template>
<div class="visualizer-wrapper">
    <canvas :id="id" class="visualizer" :title="id">
    </canvas>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Visualizer extends Vue {
  @Prop()
  private id!: string;
}
</script>

<style>
.visualizer-wrapper {

    /* box-model */
    margin-bottom: 0px;
    padding: 10px 20px 0px 30px;

    /* typography */
    text-align: center;
}

.visualizer-wrapper > canvas {

    /* positioning */
    width: 100%;
    height: 100px;
}
</style>

