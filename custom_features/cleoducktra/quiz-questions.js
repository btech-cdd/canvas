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
          >
            <main class="msger-chat">
              <cleoducktra-message
                v-for="message in  messages"
                :message="message"
              ></cleoducktra-message> 
            </main>
            <form 
              style="margin: 0;"
              @submit.prevent="submitRequest" 
              class="msger-inputarea">
              <input @keydown="cycleOldMessages" :disabled="awaitingResponse" v-model="input" type="text" class="msger-input" placeholder="Enter your message...">
              <button :disabled="awaitingResponse" type="submit" class="msger-send-btn">Ask</button>
            </form>
          </div>
        </div>
      </div>
    `;
    $('body').append(vueString);
    class CleoDucktraMessage {
      constructor(text, name="CleoDucktra", img="") {
        this.name = name;
        this.align = "right";
        this.img = img;
        if (name == "CleoDucktra") {
          this.align = "left";
          this.img = "https://bridgetools.dev/canvas/media/cleoducktra-idle.gif"
        }
        this.text = text;
        this.timestamp = new Date();
        this.time = this.timestamp.getHours() + ":" + this.timestamp.getMinutes();
      }
    }
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
          messages: [
            new CleoDucktraMessage("Welcome! What can I do for you?")
          ],
        }
      },
      methods: {
        cycleOldMessages(e) {
          if (e.keyCode == 38) {
            console.log("CYCLING...");
            for (let i = this.messages.length - 1; i >= 0; i--) {
              let message = this.messages[i];
              console.log(message);
              if (message.name == this.canvasUserData.name && (this.lastOldMessage == -1 || i < this.lastOldMessage)) {
                this.lastOldMessage = i;
                this.input = message.text;
                break;
              }
            }
          } else {
            this.lastOldMessage = -1;
          }
        },
        addMessage(text, name="CleoDucktra", img="") {
          let message = new CleoDucktraMessage(
            text, 
            name,
            img);
          this.messages.push(message);
          let container = this.$el.querySelector(".msger-chat");
          container.scrollTop = container.scrollHeight;
          return message;
        },
        submitRequest: async function() {
          let input = this.input;
          this.addMessage(input, this.canvasUserData.name, this.canvasUserData.avatar_url);
          this.input = "";
          let message = this.addMessage("...");
          message.img = "https://bridgetools.dev/canvas/media/cleoducktra.gif"
          this.awaitingResponse = true;
          $.ajaxSetup({
            headers:{
                'Authorization': "Bearer " + this.key,
                'Content-Type': 'application/json'
            }
          });
          let data = `{
            "prompt": "${input}",
            "temperature": 0.9,
            "max_tokens": 2000,
            "top_p": 1,
            "frequency_penalty": 0,
            "presence_penalty": 0.6,
            "stop": [" Human:", " AI:"]
          }`;
          await $.post("https://api.openai.com/v1/engines/text-davinci-003/completions", data, function(resp) {

            message.text= resp.choices[0].text;
            message.img = "https://bridgetools.dev/canvas/media/cleoducktra-idle.gif"
          });
          this.awaitingResponse = false;
          let containerEl = this.$el.querySelector(".msger-chat");
          containerEl.scrollTop = containerEl.scrollHeight;
          this.$nextTick(function() {
            let inputEl = this.$el.querySelector(".msger-input");
            inputEl.focus();
          });
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