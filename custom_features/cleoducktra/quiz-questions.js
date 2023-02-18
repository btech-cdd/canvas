(async function () {
  let vueString = '';
  //load the resources
  await $.get(SOURCE_URL + '/custom_features/cleoducktra/quiz-questions.vue', null, function (html) {
    vueString = html.replace("<template>", "").replace("</template>", "");
  }, 'text');
  Vue.component('cleoducktra-quiz-questions', {
    template: vueString,
    props: [
      'key'
    ],
    mounted: function() {
      console.log(this.key);
    },
    data: function() {
      return {
        awaitingResponse: false,
        state: "prompt",
        input: "",
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
        console.log(this.key);
        let input = this.input;
        $.ajaxSetup({
          headers:{
              'Authorization': "Bearer " + this.key,
              'Content-Type': 'application/json'
          }
        });
        let data = {
          "prompt": `Create a multiple choice question and answer about ${input}. Use the format Q: ... A) ... B) ... C) ... D) ... Answer: ...`,
          "temperature": 0.5,
          "max_tokens": 500,
          "top_p": 1,
          "frequency_penalty": 0,
          "presence_penalty": 0,
          "stop": [" Human:", " AI:"]
        };
        console.log(data.prompt);
        data = JSON.stringify(data);
        let response = "";
        this.awaitingResponse = true;
        await $.post("https://api.openai.com/v1/engines/text-davinci-003/completions", data, (resp) => {
          console.log(resp.choices);
          response = resp.choices[0].text;
        });
        this.awaitingResponse = false;
        delete $.ajaxSettings.headers.Authorization;
        delete $.ajaxSettings.headers['Content-Type'];
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
          }
        }
        let question = {
          prompt: prompt,
          answers: answers,
          correct: correct
        }
        this.question = question;
        this.state = "response";
      }
    }
  });
})();