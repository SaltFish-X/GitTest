<template lang="pug">
.survey-type
  .survey-type__list(v-for='item in list' v-key="item.type")
    .survey-type__list-item {{ item.name }}
</template>

<script>
export default {
  data() {
    return {
      list: [
        { name: '单选题', type: 'radio' },
        { name: '填空题', type: 'text' }
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
</style>
