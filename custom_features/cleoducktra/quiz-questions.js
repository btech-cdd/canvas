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
              <div>Create a quiz question about...</div>
            </main>
            <form 
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
            "prompt": "Create a multiple choice question about ${input}",
            "temperature": 0.9,
            "max_tokens": 2000,
            "top_p": 1,
            "frequency_penalty": 0,
            "presence_penalty": 0.6,
            "stop": [" Human:", " AI:"]
          }`;
          await $.post("https://api.openai.com/v1/engines/text-davinci-003/completions", data, (resp) => {
            console.log(resp.choices);
            this.response = resp.choices[0].text;
          });
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