<template>
  <LazyLoading></LazyLoading>
</template>

<script>
const LazyLoading = () => import('./LazyLoading')
export default {
  components: { LazyLoading }
}
</script>

<style>
</style>
