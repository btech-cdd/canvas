(async function () {
  let vueString = '';
  //load the resources
  await $.get(SOURCE_URL + '/custom_features/cleoducktra/quiz-questions.vue', null, function (html) {
    vueString = html.replace("<template>", "").replace("</template>", "");
  }, 'text');
  Vue.component('cleoducktra-quiz-questions', {
    template: vueString,
    mounted: function() {
    },
    data: function() {
      return {
        awaitingResponse: false,
        state: "prompt",
        input: "",
        questions: [],
      }
    },
    methods: {
      createQuestion: async function(question) {
        let answers = [];
        for (let a in question.answers) {
          let answer = question.answers[a];
          answers.push({
            answer_weight: a == question.correct ? 100 : 0,
            numerical_answer_type: "exact_answer",
            answer_text: answer,
          })
        }
        await $.post(`/api/v1/courses/${ENV.COURSE_ID}/quizzes/${ENV.QUIZ.id}/questions`, {
          question: {
            question_name: this.input,
            question_type: "multiple_choice_question",
            points_possible: 1,
            question_text: `<p>${question.prompt}</p>`,
            answers: answers
          }
        }); 
        question.created = true;
      },
      extractQuestions: function(response) {
        response = response.replace(/Answer: ([A-Za-z])\)/g, "\nAnswer: $1\*")
        response = response.replace(/([A-Za-z]\) )/g, "\n$1")
        let questions = [];
        let lines = response.split("\n");
        let prompt = "";
        let answers = [];
        let correct = "";
        for (let l in lines) {
          let line = lines[l];
          let mPrompt = line.match(/[0-9]+\)(.*)/);
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
              correct: correct,
              created: false,
              include: true,
            }
            questions.push(question);
            prompt = "";
            answers = [];
            correct = "";
          }
        }
        return questions;
      },
      submitRequest: async function() {
        let input = this.input;
        this.awaitingResponse = true;
        let response = await CLEODUCKTRA.get(`Use the format 1) question A) option Answer: ... Create ten multiple choice questions with 4 options and answers about ${input}.`);
        this.awaitingResponse = false;
        let questions = this.extractQuestions(response);
        questions.forEach(question => this.questions.push(question));
        this.state = "response";
      }
    }
  });
})();