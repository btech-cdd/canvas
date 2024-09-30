(async function() {
  Vue.component('course-surveys', {
    template: ` 
    <div>
      <div class="btech-course-evaluator-content-box">
        <div v-for="(question, q) in ratings">
          <div>
            <span :title="questions[question].agree_perc + '% of ' + questions[question].count + ' students agree with this statement.'">{{calcEmoji(questions[question].average)}}</span>
            <span>{{questions[question].question}}</span>
          </div>
        </div>
      </div>
    </div>
    `,
    props: {
      questions: {
        type: Object,
        default: () => ({})
      },
      ratings: {
        type: Array,
        default: []
      }
    },
    computed: {
      counts() {
        return this.calcCounts(this.reviews, this.criteria)
      }
    },
    data() {
      return {
      }
    },
    created: async function () {
    },

    methods: {
    }
  });
})();
