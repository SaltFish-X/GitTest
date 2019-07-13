<template>
  <div class="lazy-loading">
    <div class="lazy-loading__item" v-for="item in index" :key="item">{{ item }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      index: []
    }
  },
  mounted() {
    this.index = [...Array(10).keys()].map(e => e * Math.random())
  }
}
</script>

<style>
.lazy-loading {
  margin: 20px;
  background-color: #eee;
}
</style>
