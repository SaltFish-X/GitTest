<script>
import Radio from './SurveyComponents/Radio';
const toComponents = { Radio };
export default {
  data() {
    return {
      list: []
    };
  },
  methods: {
    handleDrop(e) {
      e.preventDefault();
      const data = JSON.parse(e.dataTransfer.getData('data'));
      console.log(data);
      toComponents[data.type] ? this.list.push(data) : 0;
    },
    handleDragover(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  },
  render(h) {
    return (
      <div
        class="survey-list"
        onDrop={this.handleDrop}
        onDragover={this.handleDragover}
      >
        <Radio />
        {this.list.map(e => {
          return h(toComponents[e.type]);
        })}
      </div>
    );
  }
};
</script>

<style lang="scss" scoped>
.survey-list {
  width: 60vw;
  margin: 0 10px;
  background-color: #eee;
  // border: 1px soild #000;
}
</style>
