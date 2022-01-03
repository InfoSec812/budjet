<template>
  <suspense>
    <router-view />
  </suspense>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
});
</script>
<style lang="sass">
body
  height: 100%
  width: 100%
</style>