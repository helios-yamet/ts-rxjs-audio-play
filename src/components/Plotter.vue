<template>
<div :id="id" class="plot" :title="id">
    <div class="plot-label">
        <span>{{ label}}</span>
    </div>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Plotter extends Vue {
  @Prop()
  private id!: string;

  @Prop()
  private label!: string;
}
</script>

<style>
.plot {

    /* positioning */
    position: relative;
    float: left;

    /* box-model */
    margin: 0px 10px 10px 10px;
    padding: 10px;

    /* visual */
    background-color: rgb(237, 239, 240);
}

.plot-label {

    /* box-model */
    width: 100%;
    height: 20px;
    margin-bottom: 15px;

    /* visual */
    background-color: #b6cfe2;

    /* typography */
    font-size:1em;
    font-family: sans-serif;
    font-weight: bold;
    color: rgb(99, 99, 99);
    text-align: center;

    /* misc */
    user-select: none;
}

.ct-chart-bar {

    padding: 10px;
}

.ct-series-a .ct-line {
    stroke: #3F3F3F;
    stroke-width: 2px;
}
</style>

