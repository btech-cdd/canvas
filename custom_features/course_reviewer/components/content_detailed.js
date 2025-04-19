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
        <div class="btech-course-evaluator-content-box">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
            <div>
              <h2>Content Review</h2>
              <div v-for="(criterion, criterionName) in activeCriteria" :title="criterion.description">
                <span style="font-size: 0.75rem; width: 8rem; display: inline-block;">{{criterion.name}}</span>
                <span style="cursor: pointer; user-select: none;" @click="updateCriterion(criterion, criterionName)">
                {{calcEmojiFromData(contentData, activeCriteria, criterionName)}}
                </span>
              </div>
            </div>
            <div>
              <h2>Additional Criteria</h2>
              <div v-for="(score, criterionName) in contentData.additional_criteria" :title="criterionName">
                <span style="font-size: 0.75rem; width: 8rem; display: inline-block;">{{criterionName}}</span>
                <span>
                {{calcEmoji(score)}}
                </span>
              </div>
              <div v-if="contentData.objectives" title="The content is aligned to the course objectives.">
                <span style="font-size: 0.75rem; width: 8rem; display: inline-block;">Alignment</span>
                <span>{{ ((contentData?.objectives ?? []) > 0 ? emojiTF[1] : emojiTF[0])}}</span>
              </div>
            </div>
            <div>
              <div v-if="hasRubricData">
                <h2>Rubric Review</h2>
                <div v-for="(criterion, criterionName) in rubricCriteria" :title="criterion.description">
                  <span style="font-size: 0.75rem; width: 8rem; display: inline-block;">{{criterion.name}}</span>
                  <span>
                  {{calcEmojiFromData(rubricData, rubricCriteria, criterionName)}}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="btech-course-evaluator-content-box">
          <div title="Additional feedback generated by the AI reviewer" style="margin-top: 0.5rem; display: inline-block;">
              <h2>Feedback</h2>
              <div v-if="contentData?.feedback_list?.length > 0">
                <ul>
                  <li v-for="suggestion in contentData.feedback_list">{{suggestion}}</li>
                </ul>
              </div>
              <div v-else>
                {{contentData?.feedback ?? ""}}
              </div>
          </div>
          <div v-if="hasRubricData" title="Additional feedback generated by the AI reviewer" style="margin-top: 0.5rem; display: inline-block;">
            <p>{{rubricData.feedback}}</p>
          </div>
          <div title="Summary of the content by the AI reviewer" style="margin-top: 0.5rem; display: inline-block;">
              <h2>AI Summary</h2>
              <p>{{contentData.summary}}</p>
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
      activeCriteria: function () {
        let criteria = {};
        for (const [criterionName, criterion] of Object.entries(this.contentCriteria)) {
          if (criterion.active) {
            criteria[criterionName] = criterion;
          }
        }
        return criteria;
      },
      hasRubricData: function () {
        return this.rubricData && Object.keys(this.rubricData).length > 0;
      }

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
    },

    methods: {
      async updateCriterion(criterion, criterionName) {
        let val = this.contentData.criteria[criterionName];
        if (criterion.score_type === 'boolean') {
          if (typeof val !== 'boolean') val = false;
          val = !val;
        }
        else if (criterion.score_type === 'number') {
          if (typeof val !== 'number') val = 0;
          val += 1;
          if (val > 2) val = 0;
        }
          
        this.contentData.criteria[criterionName] = val;
        let contentType = this.contentData.content_type;
        let contentURL = '';
        let contentId = '';
        
        if (contentType == 'Page') {
          contentURL = 'pages'
          contentId = this.contentData.page_id;
        } else if (contentType == 'Assignment') {
          contentURL = 'assignments';
          contentId = this.contentData.assignment_id;
        } else if (contentType == 'Discussion') {
          contentURL = 'discussions';
          contentId = this.contentData.discussion_id;
        } else if (contentType == 'Quiz') {
          contentURL = 'quizzes';
          contentId = this.contentData.quiz_id;
        } else if (contentType == 'Module') {
          contentURL = 'modules';
          contentId = this.contentData.module_id;
        } else {
          return;
        }
        await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${this.contentData.course_id}/${contentURL}/${contentId}`, {
          criteria: this.contentData.criteria
        }, 'POST');
      },
      calcEmoji(perc) {
        if (isNaN(perc)) return '';
        if (perc < 0.5) return emoji[0]; // bronze
        if (perc < 0.8) return emoji[1]; // silver 
        return emoji[2]; // gold 
      },
      calcEmojiFromData(data, criteria, criterionName) {
        let criterion = criteria[criterionName];
        let val = data?.criteria?.[criterionName] ?? 0;
        if (val == undefined) return `🚫`;
        if (criterion.score_type == 'boolean') {
          return (val ? emojiTF[1] : emojiTF[0]);
        }
        if (criterion.score_type == 'number') {
          return (emoji?.[val] ?? '🚫');
        }
        return `🚫`;
      }
    }
  });
})();