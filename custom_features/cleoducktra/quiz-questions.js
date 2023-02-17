(function () {
  console.log("QUIZ DUCK")
  let openButton = $(`
    <a href="#" class="generate_question_link btn">
      <i class="icon-add"></i><span class="screenreader-only">Generate Question</span>
      Generate Question 
    </a>
  `)
  $(".add_question.question_editing").append(openButton);
  if ($("#cleoducktra-quiz-questions").length === 0) {
    let vueString = `
      <div id="cleoducktra-quiz-questions" class="cleoducktra-input">
        <div
          v-show="show"
          @click.self="show = false;"
          class="btech-modal"
          style="display: inline-block;"
        >
          <div
            class="msger btech-modal-content"
            style="height: auto;"
            v-if="state=='prompt'"
          >
            <main class="msger-chat">
              <div>Create a quiz question about...</div>
            </main>
            <form 
              style="margin: 0;"
              @submit.prevent="submitRequest" 
              class="msger-inputarea">
              <input v-model="input" type="text" class="msger-input" placeholder="Enter your message...">
              <button type="submit" class="msger-send-btn">Ask</button>
            </form>
          </div>
          <div
            class="msger btech-modal-content"
            style="height: auto;"
            v-if="state=='response'"
          >
            <main class="msger-chat">
              <div v-if="question.prompt !== ''">
                <p>{{question.prompt}}</p>
                <ol>
                  <li v-for="answer in question.answers">{{answer}}</li>
                </ol>
                <p>Correct answer: {{question.correct + 1}}</p>
              </div>
            </main>
            <form 
              style="margin: 0;"
              class="msger-inputarea">
              <button @click="createQuestion(); submitRequest();" class="msger-send-btn">Create</button>
              <button @click="submitRequest();" class="msger-send-btn blue">Next</button>
              <button @click="state = 'prompt'; input='';" class="msger-send-btn red">Restart</button>
            </form>
          </div>
        </div>
      </div>
    `;
    $('body').append(vueString);
    //IMPORTED_FEATURE._init();
    new Vue({
      el: "#cleoducktra-quiz-questions",
      mounted: async function() {
        let canvasUserData = await $.get("/api/v1/users/self");
        console.log(canvasUserData);
        this.canvasUserData = canvasUserData;
        let key = "";
        try {
          key = await $.get(`/api/v1/users/self/custom_data/openai-key?ns=com.btech.cleoducktra`);
          this.key = key.data;
        } catch (err) {
          try {
            key = await $.get(`/api/v1/users/1893418/custom_data/openai-key?ns=com.btech.cleoducktra`);
            this.key = key.data;
          } catch (err) {
            this.key = "";
          }
        }
        openButton.click(() => {
          this.show = true;
        });
      },
      computed: {
      },
      data: function() {
        return {
          lastOldMessage: 0,
          key: "",
          input: "",
          canvasUserData: {},
          buttonX: 10,
          show: false,
          state: "prompt",
          response: "",
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
          console.log("SUBMIT!")
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
          await $.post("https://api.openai.com/v1/engines/text-davinci-003/completions", data, (resp) => {
            console.log(resp.choices);
            response = resp.choices[0].text;
          });
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
    Vue.component('cleoducktra-message', {
      template: `
        <div 
          class="msg"
          :class="{
            'right-msg': message.align == 'right',
            'left-msg': message.align == 'left',
          }"
          >
          <div
            class="msg-img"
            :style="{
              'background-image': 'url(&quot;' + message.img + '&quot;)' 
            }"
          ></div>

          <div class="msg-bubble">
            <div class="msg-info">
              <div class="msg-info-name">{{message.name}}</div>
              <div class="msg-info-time">{{message.time}}</div>
            </div>

            <div class="msg-text">
              {{message.text}}
            </div>
          </div>
        </div>
      `,
      mounted: function() {
        console.log(this.message.img);
      },
      data: function() {
        return {
        }
      },
      props: [
        'message'
      ]
    });
  }
})();