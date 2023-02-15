(function () {
  console.log("CleoQuacktra");
  if ($("#cleoquacktra").length === 0) {
      let vueString = `
        <div id="cleoquacktra">
          <div 
            @mouseover="buttonX = 100;"
            @mouseleave="buttonX = 10;"
            @click="showHelp = !showHelp; console.log(showHelp);"
            style='
              width: 110px; 
              margin-right: -140px; 
              position:fixed; 
              bottom: 20px; 
              z-index:1000; 
              transition: 0.5s; 
              background-color: #A00012;
              border: 2px solid #D61310;
              padding: 10px 20px;
              color: #FFF;
              border-radius: 5px; 
              cursor: pointer;
              user-select: none;
            ' 
            :style="{'right': buttonX + 'px'}"
          >
            Ask CleoQuacktra 
          </div>
          <div v-if="showHelp">
            <div
              @click.self="showHelp = false;"
              style='
                position: fixed;
                z-index: 100000;
                padding-top: 10px;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: #000;
                background-color: rgb(0, 0, 0, 0.4);
              ' 
            >
            <div
              id="btech-help-modal"
              class="msger"
              style='
                position: absolute;
                background-color: rgb(255,255,255);
                color: #000;
                width: 80%;
                height: 80%;
                top: 10%;
                left: 10%;
                z-index: 100001;
                border-radius: 5px;
                box-shadow: 0px 0px 8px 1px #333;
                padding: 10px;
                overflow-y: scroll;
              '
            >
                <main class="msger-chat">
                  <cleoquacktra-message
                    v-for="message in  messages"
                    :message="message"
                  ></cleoquacktra-message> 
                </main>
                <form @submit.prevent="submitRequest" class="msger-inputarea">
                  <input :disabled="awaitingResponse" v-model="input" type="text" class="msger-input" placeholder="Enter your message...">
                  <button :disabled="awaitingResponse" type="submit" class="msger-send-btn">Ask</button>
                </form>
            </div>
          </div>
        </div>
      `;
      $('body').append(vueString);
      class CleoQuacktraMessage {
        constructor(text, name="CleoQuacktra") {
          this.name = name;
          this.align = "right";
          if (name == "CleoQuacktra") {
            this.align = "left";
          }
          this.text = text;
          this.timestamp = new Date();
          this.time = this.timestamp.getHours() + ":" + this.timestamp.getMinutes();
        }
      }
      //IMPORTED_FEATURE._init();
      new Vue({
        el: "#cleoquacktra",
        mounted: async function() {
          let key = await $.get(`/api/v1/users/self/custom_data/openai-key?ns=com.btech.cleoquacktra`);
          this.key = key.data;
          console.log(this.key);
        },
        computed: {
        },
        data: function() {
          return {
            key: "",
            input: "",
            awaitingResponse: false,
            buttonX: 10,
            showHelp: false,
            messages: [
              new CleoQuacktraMessage("Welcome! What can I do for you?")
            ],
          }
        },
        methods: {
          addMessage(text, name="CleoQuacktra") {
            let message = new CleoQuacktraMessage(text, name);
            this.messages.push(message);
            const container = this.$el.querySelector(".msger");
            container.scrollTop = container.scrollHeight;
            return message;
          },
          submitRequest: async function() {
            let input = this.input;
            this.addMessage(input, "Me");
            this.input = "";
            let message = this.addMessage("...");
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
              "max_tokens": 150,
              "top_p": 1,
              "frequency_penalty": 0,
              "presence_penalty": 0.6,
              "stop": [" Human:", " AI:"]
            }`;
            console.log(data);
            await $.post("https://api.openai.com/v1/engines/text-davinci-003/completions", data, function(resp) {
              console.log(resp);
              message.text= resp.choices[0].text;
            });
            this.awaitingResponse = false;
            const container = this.$el.querySelector(".msger");
            container.scrollTop = container.scrollHeight;
          }
        }
      });
      Vue.component('cleoquacktra-message', {
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
              style="background-image: url(https://image.flaticon.com/icons/svg/145/145867.svg)"
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
