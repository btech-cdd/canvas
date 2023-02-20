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
        state: "prompt",
        input: "",
        objectives: [],
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
      submitRequest: async function() {
        let input = this.input;
        this.awaitingResponse = true;
        let response = await CLEODUCKTRA.get(`What are the ten most important skills needed for ${input}. Use the format 1) skill: description`);
        this.awaitingResponse = false;
        let lines = response.split("\n");
        for (let l in  lines) {
          let line = lines[l];
          let mObjective = line.match(/[0-9]+\) (.*): (.*)/);
          if (mObjective) {
            let name = mObjective[1];
            let description = mObjective[2];
            this.objectives.push({
              name: name,
              description: description,
              include: false
            });
          }
        }
        this.state = "response";
      }
    }
  });
})();