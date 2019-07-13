<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <!-- <HelloWorld msg="Welcome to Your Vue.js App" /> -->
    <LazyLoading></LazyLoading>
    <LazyLoading1></LazyLoading1>
    <!-- <LoadingComponent></LoadingComponent> -->
    <!-- <LazyLoading v-for="item in index" :key="item" :id="item"></LazyLoading> -->
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
// import LazyLoading from "./components/LazyLoading.vue";
// import LazyLoading1 from "./components/LazyLoading1.vue";
// const LoadingComponent = () => import("./components/LoadingComponent");
const LazyLoading = () => import('./components/LazyLoading')
const LazyLoading1 = () => ({ component: import('./components/LazyLoading1') })
export default {
  name: 'app',
  components: {
    HelloWorld,
    LazyLoading,
    LazyLoading1
  },
  data() {
    return {
      index: [],
      show: false
    }
  },
  mounted() {
    window.setTimeout(() => {
      this.show = true
    }, 3000)
    // this.index = Array.from(new Array(1000).keys());
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  background-color: #fff;
}

img {
  width: 200px;
}
body {
  margin: 0px;
}
p {
  font-size: 24px;
}

@media screen and (min-width: 750px) {
  #app {
    width: 750px;
    margin: auto;
  }
  body {
    background: #000;
  }
}
</style>
