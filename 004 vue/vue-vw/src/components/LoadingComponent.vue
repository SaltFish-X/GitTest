<template>
  <div class="loading"></div>
</template>

<script>
export default {
  mounted() {
    console.log('loading')
  }
}
</script>

<style>
.loading {
  width: 100%;
  height: 300px;
  background-color: red;
}
</style>
