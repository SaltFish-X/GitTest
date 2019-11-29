<template lang="pug">
.survey-type
  .survey-type__list(v-for='item in list' :key="item.type" @drop.prevent="handleDrop" @dragover.prevent="handleDragover")
    .survey-type__list-item(draggable="true" @dragstart="handleDragStart($event, item)") {{ item.name }}
</template>

<script>
export default {
  data() {
    return {
      list: [
        { name: '单选题', type: 'Radio' },
        { name: '填空题', type: 'text' }
      ]
    };
  },
  methods: {
    handleDrop(e) {
      console.log(e);
    },
    handleDragover(e) {
      e.dataTransfer.dropEffect = 'move';
    },
    handleDragStart(e, item) {
      // console.log(e, item);
      // 拖动数据文档 https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types
      const data = JSON.stringify(item);
      e.dataTransfer.setData('data', data);
    }
  }
};
</script>

<style lang="scss" scoped>
.survey-type {
  height: 80vh;
}
.survey-type__list {
  &-item {
    padding: 5px 10px;
    margin: 10px 0px;
    border: 1px solid #000;
  }
}
</style>
