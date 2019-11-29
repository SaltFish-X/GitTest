<template lang="pug">
.survey
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
  components: { SurveyList, SurveyOption, SurveyType }
};
</script>

<style lang="scss" scoped>
.survey {
  display: flex;
}
</style>
