(async function () {
  let vueString = '';
  //load the resources
  await $.get(SOURCE_URL + '/custom_features/cleoducktra/quiz-questions.vue', null, function (html) {
    vueString = html.replace("<template>", "").replace("</template>", "");
  }, 'text');
  Vue.component('cleoducktra-quiz-questions', {
    template: vueString,
    props: [
      'apikey'
    ],
    mounted: function() {
      console.log(this.apikey);
    },
    data: function() {
      return {
        awaitingResponse: false,
        state: "prompt",
        input: "",
        questions: [],
        question: {
          prompt: ""
        },
      }
    },
    methods: {
      createQuestion: function() {
        let answers = [];
        for (let a in this.question.answers) {
          let answer = this.question.answers[a];
          answers.push({
            answer_weight: a == this.question.correct ? 100 : 0,
            numerical_answer_type: "exact_answer",
            answer_text: answer
          })
        }
        $.post(`/api/v1/courses/${ENV.COURSE_ID}/quizzes/${ENV.QUIZ.id}/questions`, {
          question: {
            question_name: this.input,
            question_type: "multiple_choice_question",
            points_possible: 1,
            question_text: `<p>${this.question.prompt}</p>`,
            answers: answers
          }
        }); 
      },
      submitRequest: async function() {
        let input = this.input;
        this.awaitingResponse = true;
        let response = await CLEODUCKTRA.get(`Create 10 multiple choice questions with answers about ${input}. Use the format Q: ... A) ... B) ... C) ... D) ... Answer: ...`);
        this.awaitingResponse = false;
        response = response.split("\n");
        let prompt = "";
        let answers = [];
        let correct = "";
        for (let r in response) {
          let line = response[r];
          let mPrompt = line.match(/Q:(.*)/);
          if (mPrompt) {
            prompt = mPrompt[1];
            continue;
          }
          let mAnswer = line.match(/^[A-Za-z]\)(.*)/);
          if (mAnswer) {
            answers.push(mAnswer[1]);
          }
          let mCorrect = line.match(/Answer: ([A-Z])/);
          let letters = "ABCDEFG";
          if (mCorrect) {
            correct = letters.indexOf(mCorrect[1]);
            let question = {
              prompt: prompt,
              answers: answers,
              correct: correct
            }
            this.questions.push(question);
            prompt = "";
            answers = [];
            correct = "";
          }
        }
        this.state = "response";
      }
    }
  });
})();