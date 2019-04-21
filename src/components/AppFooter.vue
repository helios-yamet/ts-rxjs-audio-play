<template>
  <footer class="footer bg-dark">
    <div class="container">
      <span class="text-muted"></span>
    </div>
  </footer>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class AppFooter extends Vue { }
</script>

<style scoped>
.footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 60px;
    text-align: center;
    line-height: 60px;
    background-color: #f5f5f5;
}
</style>