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
      <div class="btech-course-evaluator-content-box">
        {{summary}}
      </div>
    </div>
    `,
    props: {
      course: {
        type: Object,
        default: {}
      },
      surveys: {
        type: Array,
        default: []
      }
    },
    computed: {
    },
    data() {
      return {
        courseId: ENV.COURSE_ID,
        questions: {},
        surveyRatingsList: [],
        summary: `Loading Summary...`,
        ratings: []
      }
    },
    mounted: async function () {
      this.processSurveys();
      this.generateSummary();
    },

    methods: {
      processSurveys: async function () {
        let surveys = this.surveys;
        // LOOK UP FOR NUMBERIC RATINGS
        let ratingRef = {
          'Strongly Agree': 1,
          'Agree': 0.8,
          'Disagree': 0.2,
          'Strongly Disagree': 0
        }

        // ITERATE OVER EACH QUESTION AND CREATE AN OBJECT FOR THE SUMMARY DATA OF EACH QUESTION (WHAT WILL BE USED IN REPORT)
        let questions = {};
        for (let q in surveys.questions) {
          let question = surveys.questions[q];
          if (question.type == 'Rating') {
            this.surveyRatingsList.push(question.question);
            question.count = 0;
            question.sum = 0;
            question.average = 0;
            question.agree = 0;
            question.agree_perc = 0;
          }
          else if (question.type == 'Text') {
            // this.surveyTextList.push(question.question);
            question.page = 0;
            question.comments = [];
          }
          questions[question.question] = question;
        }

        // GO OVER EACH RESPONSE AND POPULATE SUMMARY DATA
        for (let r in surveys.responses) {
          let response = surveys.responses[r];
          for (let question in response.questions) {
            let questionResponse = response.questions[question];
            let questionData = questions[question];
            if (questionData.type == 'Rating') {
              let val = ratingRef?.[questionResponse];
              if (val !== undefined) {
                questions[question].count += 1;
                questions[question].agree += val > 0.5 ? 1 : 0;
                questions[question].sum += val;
              }
            }
            else if (questionData.type == 'Text') {
              questions[question].comments.push(questionResponse);
            }
          }
        }

        // SOME CLEAN UP ON QUESTIONS
        for (let question in questions) {
          let data = questions[question];
          if (data.type == 'Rating') {
            if (questions[question].count == 0) questions[question].average = "N/A";
            else questions[question].average = questions[question].sum / questions[question].count
            questions[question].agree_perc = Math.round((questions[question].agree / questions[question].count) * 1000) / 10;
            this.ratings.push(question);
          }
          else if (data.type == 'Text') {
            questions[question].max_pages = Math.ceil(questions[question].comments.length / this.surveyCommentsPerPage)
            questions[question].comments.sort((a, b) => {
              return b.length - a.length;
            })
          }
        }

        this.questions = questions;
      },
      async generateSummary() {
        let prompt = ``;
        for (let text in this.questions) {
          let question = this.questions[text];
          if (question.type == 'Text') {
            let responses = ``;
            for (let i in question.comments) {
              responses += `<response_${i + 1}>${question.comments[i]}</response_${i + 1}>`;
            }
            prompt += `
              <survey_question>
                <prompt>${text}</prompt>
                <responses>${responses}</responses>
              </survey_question>
            `
          }
        }
        prompt = `<survey_data>${prompt}</survey_data>`;
        let summary = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${this.courseId}/summarize`, {
            prompt: prompt 
        }, 'POST');
        this.summary = summary;
      }
    }
  });
})();
