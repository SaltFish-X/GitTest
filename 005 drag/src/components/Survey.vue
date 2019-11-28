<template lang="pug">
.Survey
  SurveyType
  SurveyList
  SurveyOption
</template>

<script>
import SurveyList from './SurveyList';
import SurveyOption from './SurveyOption';
import SurveyType from './SurveyType';
export default {
  data() {
    return {};
  },
  computed: { SurveyList, SurveyOption, SurveyType }
};
</script>

<style lang="scss" scoped>
</style>
