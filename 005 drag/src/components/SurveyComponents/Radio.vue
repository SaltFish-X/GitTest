<template lang="pug">
.survey-radio
  .survey-radio__title {{ title }}
  el-radio-group(v-model="model")
    el-radio(v-for="item in option" :key="item.value" :label="item.value") {{item.label }}
</template>
<script>
export default {
  data() {
    return {
      model: '',
      title: '请选择你的性别',
      option: [{ value: '1', label: '男' }, { value: '2', label: '女' }],
      en: {}
    };
  }
};
</script>

<style lang="scss" scoped>
</style>
