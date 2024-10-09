(async function() {
  Vue.component('content-detailed', {
    template: ` 
      <div>
        <div class="btech-course-evaluator-content-box">
          <h2>Relevant Objectives</h2>
          <div :style="{
              color: (contentData?.objectives ?? []).includes(objective.objective_id) ? '#000' : '#CCC' 
          }" v-for="objective in objectivesData">
            <span style="width: 1rem; display: inline-block;">{{(contentData?.objectives ?? []).includes(objective.objective_id) ? '&#10003;' : ''}}</span>
            {{objective.objective_text}}
          </div>
        </div>
        <div v-if="contentData.blooms" class="btech-course-evaluator-content-box">
          <div title="The bloom's taxonomy level of this content." style="margin-bottom: 0.5rem; display: inline-block;">
              <span 
              :style="{
                  'background-color': bloomsColors?.[contentData.blooms.toLowerCase()]
              }" 
              style="color: #000000; padding: 0.5rem; display: inline-block; border-radius: 0.5rem; display: inline-block;"
              >{{contentData.blooms}}</span>
          </div>
        </div> 
       
      </div> 
    `,
    props: {
      type: {
        type: String,
        default: '' 
      },
      objectivesData: {
        type: Object,
        default: () => ({})
      },
      contentData: {
        type: Object,
        default: () => ({})
      },
      contentCriteria: {
        type: Object,
        default: () => ({})
      },
      rubricData: {
        type: Object,
        default: null 
      },
      rubricCriteria: {
        type: Object,
        default: null 
      }
    },
    computed: {
    },
    data() {
      return {
        emoji: emoji,
        emojiTF: emojiTF,
        bloomsColors: bloomsColors,
        sortCriteria: sortCriteria,
        courseId: ENV.COURSE_ID,
      }
    },
    created: async function () {
      this.contentCriteria = sortCriteria(this.contentCriteria);
      this.rubricCriteria = sortCriteria(this.rubricCriteria);
      console.log(this.contentCriteria);
    },

    methods: {
      calcEmoji(perc) {
        if (isNaN(perc)) return '';
        if (perc < 0.5) return emoji[0]; // bronze
        if (perc < 0.8) return emoji[1]; // bronze
        return emoji[2]; // bronze
      },
      calcEmojiFromData(data, criteria, criterionName) {
        let criterion = criteria[criterionName];
        let val = data?.criteria?.[criterionName] ?? 0;
        if (criterion.score_type == 'boolean') {
          return (val ? emojiTF[1] : emojiTF[0]);
        }
        if (criterion.score_type == 'number') {
          return (emoji?.[val] ?? '');
        }
        return '';
      }
    }
  });
})();