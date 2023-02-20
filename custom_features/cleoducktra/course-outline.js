class CleoDucktraCourse {
  constructor(name) {
    this.name = name;
    this.objectives = [];
  }

  async getObjectives() {
    let response = await CLEODUCKTRA.get(`Create ten objectives for a course about ${this.name}. Use the format 1) skill: description`);
    let lines = response.split("\n");
    for (let l in  lines) {
      let line = lines[l];
      let mObjective = line.match(/[0-9]+\) (.*): (.*)/);
      if (mObjective) {
        let name = mObjective[1];
        let description = mObjective[2];
        this.objectives.push(new CleoDucktraObjective(name, description));
      }
    }

  }
}
class CleoDucktraObjective {
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.topics = [];
    this.include = false;
  }
}

class CleoDucktraTopics {
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.include = false;
  }
}

(async function () {
  let vueString = '';
  //load the resources
  await $.get(SOURCE_URL + '/custom_features/cleoducktra/course-outline.vue', null, function (html) {
    vueString = html.replace("<template>", "").replace("</template>", "");
  }, 'text');
  Vue.component('cleoducktra-course-outline', {
    template: vueString,
    mounted: function() {
    },
    data: function() {
      return {
        awaitingResponse: false,
        state: "course",
        objectives: [],
        course: new Course("") 
      }
    },
    methods: {
      // createQuestion: async function(question) {
      //   let answers = [];
      //   for (let a in question.answers) {
      //     let answer = question.answers[a];
      //     answers.push({
      //       answer_weight: a == question.correct ? 100 : 0,
      //       numerical_answer_type: "exact_answer",
      //       answer_text: answer
      //     })
      //   }
      //   await $.post(`/api/v1/courses/${ENV.COURSE_ID}/quizzes/${ENV.QUIZ.id}/questions`, {
      //     question: {
      //       question_name: this.input,
      //       question_type: "multiple_choice_question",
      //       points_possible: 1,
      //       question_text: `<p>${question.prompt}</p>`,
      //       answers: answers
      //     }
      //   }); 
      //   question.created = true;
      // },
      getObjectives: async function() {
        this.awaitingResponse = true;
        this.course.getObjectives();
        this.awaitingResponse = false;
        this.state = "objectives";
      },
      getTopics: async function() {

      },
    }
  });
})();