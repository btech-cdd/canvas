(async function() {
  Vue.component('course-content', {
    template: ` 
      <div style="padding: 8px 0;">
        <h2>{{ type }}</h2>
        <div v-for="(count, name) in counts">
          <span style="font-size: 0.75rem; width: 8rem; display: inline-block;">{{ toTitleCase(name) }}</span><span>{{ count }}</span>
        </div>
      </div>
    `,
    props: {
      type: {
        type: String,
        default: '' 
      },
      reviews: {
        type: Object,
        default: () => ({})
      },
      criteria: {
        type: Object,
        default: () => ({})
      },
      calcCounts: {
        type: Function,
        required: true
      }
    },
    computed: {
      activeCriteria: function () {
        let criteria = {};
        for (const [criterionName, criterion] of Object.entries(this.criteria)) {
          if (criterion.active) {
            criteria[criterionName] = criterion;
          }
        }
        return criteria;
      },
      counts() {
        let counts = this.calcCounts(this.reviews, this.criteria);
        return counts;
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