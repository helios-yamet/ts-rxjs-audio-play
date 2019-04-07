<template>
  <div class="example">{{ msg }}</div>
</template>

<script lang="ts">
export default {
  data(): Object {
    return {
      msg: "Hello world!"
    };
  }
};
</script>

<style>
.example {
  color: red;
}
</style>