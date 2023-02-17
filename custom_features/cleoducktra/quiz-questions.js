(function () {
  console.log("QUIZ DUCK")
  if ($("#cleoducktra-quiz-questions").length === 0) {
    let vueString = `
      <div id="cleoducktra-quiz-questions" class="cleoducktra-input">
        <div
          v-if="show"
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
              <div v-if="!awaitingResponse">Create a quiz question about...</div>
              <div v-if="awaitingResponse">Creating question...</div>
            </main>
            <form 
              v-if="!awaitingResponse"
              style="margin: 0;"
              @submit.prevent="submitRequest" 
              class="msger-inputarea">
              <input v-model="input" type="text" class="msger-input" placeholder="Enter your message...">
              <button :disabled="awaitingResponse" type="submit" class="msger-send-btn">Ask</button>
            </form>
          </div>
          <div
            class="msger btech-modal-content"
            style="height: auto;"
            v-if="state=='response'"
          >
            <main class="msger-chat">
              <div>{{response}}</div>
            </main>
            <form 
              style="margin: 0;"
              @submit.prevent="submitRequest" 
              class="msger-inputarea">
              <button :disabled="awaitingResponse" type="submit" class="msger-send-btn">Ask</button>
              <button :disabled="awaitingResponse" type="submit" class="msger-send-btn">Ask</button>
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
        // $("#global_nav_ask-cleo_link").click((e) => {
        //   e.preventDefault();
        //   this.show = true;
        // })
      },
      computed: {
      },
      data: function() {
        return {
          lastOldMessage: 0,
          key: "",
          input: "",
          canvasUserData: {},
          awaitingResponse: false,
          buttonX: 10,
          show: true,
          state: "prompt",
          response: "",
        }
      },
      methods: {
        submitRequest: async function() {
          let input = this.input;
          this.input = "";
          this.awaitingResponse = true;
          $.ajaxSetup({
            headers:{
                'Authorization': "Bearer " + this.key,
                'Content-Type': 'application/json'
            }
          });
          let data = `{
            "prompt": "Create a multiple choice question and answer about ${input}. . Use the format Q: ... A) ... B) ... C) ... D) ... Answer: ...",
            "temperature": 0.5,
            "max_tokens": 2000,
            "top_p": 1,
            "frequency_penalty": 0,
            "presence_penalty": 0,
            "stop": [" Human:", " AI:"]
          }`;
          let response = "";
          await $.post("https://api.openai.com/v1/engines/text-davinci-003/completions", data, (resp) => {
            console.log(resp.choices);
            response = resp.choices[0].text;
          });
          response = response.split("\n");
          let question = "";
          let answers = [];
          let correct = "";
          for (let r in response) {
            let line = response[r];
            let mQuestion = line.match(/Q:(.*)/);
            if (mQuestion) {
              question = mQuestion[1];
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
          response = `
            ${question}\n
          `;
          for (let a in answers) {
            let answer = answers[a];
            response += `${a + 1}) ${answer}\n`;
          }
          response += `Correct Answer: ${correct + 1}\n`;
          this.response = response;
          this.awaitingResponse = false;
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