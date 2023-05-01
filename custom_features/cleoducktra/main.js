(async function () {
  CLEODUCKTRA = {
    apikey: "",
    init: async function() {
      try {
        let resp = await $.get(`/api/v1/users/self/custom_data/openai-key?ns=com.btech.cleoducktra`);
        this.apikey = resp.data;
      } catch (err) {
        try {
          let resp = await $.get(`/api/v1/users/1893418/custom_data/openai-key?ns=com.btech.cleoducktra`);
          this.apikey = resp.data;
        } catch (err) {
          console.log(err);
        }
      }
    },
    edit: async function(input) {
      
    },
    imageUrls: async function(input) {
      return //don't need to do images, they all suck right now
      $.ajaxSetup({
        headers:{
            'Authorization': "Bearer " + this.apikey,
            'Content-Type': 'application/json'
        }
      });
      let data = {
        "prompt": input,
        "n": 3,
        "size": "256x256",
        "response_format": "url",
        "user": "" + ENV.current_user_id
      };
      data = JSON.stringify(data);
      let urls = [];
      try {
        await $.post("https://api.openai.com/v1/images/generations", data, function(resp) {
          for (let d in resp.data) {
            urls.push(resp.data[d].url)
          }
        });
      } catch (err) {
        console.log(err);
      }
      delete $.ajaxSettings.headers.Authorization;
      delete $.ajaxSettings.headers['Content-Type'];
      return urls;
    },
    formatResponse: function(resp) {
      resp = resp.replaceAll("\n", "<br>");
      resp = resp.replaceAll(/```(.*)```/ig, "<pre>$1</pre>");
      console.log(resp);
      return resp;
    },
    searchDocs: async function(input) {
      $.ajaxSetup({
        headers:{
            'Content-Type': 'application/json'
        }
      });
      let resp = await $.post("https://btech-docs.bridgetools.dev/api/query", JSON.stringify({
        "query": input
      }));
      console.log(resp);
      return resp;
    },
    get: async function(input) {
      $.ajaxSetup({
        headers:{
            'Authorization': "Bearer " + this.apikey,
            'Content-Type': 'application/json'
        }
      });
      let data = {
        "model": "gpt-4",
        "messages": [
          {
            "role": 'user',
            "content": input
          }
        ],
        "temperature": 0.9,
        "max_tokens": 2000,
        "top_p": 1,
        "frequency_penalty": 0,
        "presence_penalty": 0.6,
        "stop": [" Human:", " AI:"]
      };
      data = JSON.stringify(data);
      let response = "";
      try {
        await $.post("https://api.openai.com/v1/chat/completions", data, function(resp) {
          response = resp.choices[0].message.content.trim();
        });
      } catch (err) {
        console.log(err);
      }
      delete $.ajaxSettings.headers.Authorization;
      delete $.ajaxSettings.headers['Content-Type'];
      return response;
    }
  }
  CLEODUCKTRA.init();
  createSideMenuButton(
    "Ask Cleo"
    , ""
    , `
    <svg 
      xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 1000 1000" enable-background="new 0 0 1000 1000" xml:space="preserve"
      class="ic-icon-svg menu-item__icon"
      >
    <metadata> Svg Vector Icons : http://www.onlinewebfonts.com/icon </metadata>
    <g fill="#FFF">
      <g>
        <path d="M309.1,193.7c-10.5,0-23,8-23,45.9c0,38,12.5,45.9,23,45.9s23-8,23-45.9C332.1,201.7,319.6,193.7,309.1,193.7z"/>
        <path d="M691.9,193.7c-10.5,0-23,8-23,45.9c0,38,12.5,45.9,23,45.9c10.5,0,23-8,23-45.9C714.9,201.7,702.4,193.7,691.9,193.7z"/>
        <path d="M777.2,314.1c-9.3-30.7-17.4-57.3-17.4-74.4c0-65.6-17.2-121.7-33.1-146.2c-40-61.3-146.4-83.3-225.9-83.5c-0.1,0-0.1,0-0.2,0h0c0,0,0,0,0,0c-0.2,0-0.3,0-0.5,0c-0.2,0-0.4,0-0.5,0c-0.1,0-0.1,0-0.2,0c-79.6,0.2-185.9,22.2-225.9,83.5c-15.9,24.5-33.1,80.6-33.1,146.2c0,17.1-8.1,43.7-17.4,74.4c-15.3,50.5-34.4,113.3-28.4,172.1c6.4,62.9,26.4,110.9,59.5,142.6c27.3,26.2,56.2,34,68.6,37.3c0.5,0.1,1.1,0.3,1.7,0.5c-4.6,56.5-7.3,118.1-7.3,185.6c0,44.6,21.2,81.4,61.3,106.3c32.7,20.3,76.1,31.5,122.4,31.5c0,0,0,0,0,0c0,0,0,0,0,0c0,0,0,0,0,0s0,0,0,0c46.3,0,89.8-11.2,122.4-31.5c40.1-24.9,61.3-61.7,61.3-106.3c0-67.5-2.8-129.3-7.3-185.8c0.2-0.1,0.5-0.1,0.7-0.2c12.3-3.3,41.3-11.1,68.5-37.3c33.1-31.7,53.1-79.7,59.5-142.6C811.6,427.4,792.5,364.6,777.2,314.1z M500.5,913.5c5.2,2.3,13.5,21.7,17.1,30.1c2.2,5.1,4.4,10.1,6.6,14.6c-7.8,0.8-15.8,1.2-23.8,1.2c-8,0-15.9-0.4-23.8-1.2c2.2-4.6,4.4-9.5,6.6-14.6C487,935.2,495.4,915.9,500.5,913.5z M606.8,932.5c-13.8,8.6-30.3,15.3-48.5,19.9c-0.8-0.2-1.6-0.3-2.5-0.4c-2.9-4.1-7.1-13.8-10-20.5c-9.4-21.7-21-48.6-45.3-48.6s-35.9,27-45.3,48.6c-2.9,6.7-7.1,16.5-10,20.5c-0.8,0.1-1.7,0.2-2.5,0.4c-18.2-4.6-34.7-11.3-48.5-19.9c-31.1-19.3-46.9-46.3-46.9-80.3c0-262.3,40.5-430.4,70.1-553.1c0.1-0.6,0.3-1.2,0.4-1.7c20.1,14.7,52.5,34.2,82.6,34.2c30.1,0,62.5-19.5,82.6-34.2c0.1,0.6,0.3,1.2,0.4,1.8c29.6,122.7,70.1,290.7,70.1,553C653.7,886.1,637.9,913.2,606.8,932.5z M775.2,483.1C762.9,604,700.6,627.8,674.2,635.3C659.9,485,633.1,373.9,613.3,292c-2.1-8.7-4.1-17.1-6.1-25.2c0-0.1,0-0.1,0-0.1c0-0.1,0-0.2-0.1-0.2c-0.8-3-2.4-5.5-4.6-7.5c-0.1-0.1-0.2-0.1-0.2-0.2c-0.3-0.3-0.6-0.5-0.9-0.7c-0.2-0.1-0.3-0.2-0.5-0.3c-0.3-0.2-0.5-0.3-0.8-0.5c-0.2-0.1-0.4-0.2-0.6-0.3c-0.2-0.1-0.5-0.3-0.7-0.4c-0.2-0.1-0.4-0.2-0.6-0.3c-0.3-0.1-0.5-0.2-0.8-0.3c-0.2-0.1-0.4-0.1-0.6-0.2c-0.3-0.1-0.6-0.2-0.9-0.3c-0.2,0-0.3-0.1-0.5-0.1c-0.3-0.1-0.6-0.1-1-0.2c-0.2,0-0.3,0-0.5-0.1c-0.3,0-0.7-0.1-1-0.1c-0.2,0-0.4,0-0.5,0c-0.3,0-0.6,0-0.9,0c-0.3,0-0.5,0-0.8,0.1c-0.2,0-0.5,0-0.7,0.1c-0.4,0.1-0.8,0.1-1.2,0.2c-0.1,0-0.2,0-0.3,0c0,0,0,0,0,0c-1.8,0.4-3.6,1.2-5.2,2.4c-0.1,0.1-0.2,0.1-0.3,0.2c-0.2,0.2-0.5,0.4-0.7,0.6c-0.2,0.1-0.3,0.3-0.5,0.4c0,0-0.1,0.1-0.1,0.1c-12.7,11.7-52.1,41.9-81.5,41.9c-29.2,0-68.8-30.3-81.5-41.9c0,0,0,0,0,0c-0.3-0.3-0.6-0.6-1-0.8c-0.1,0-0.1-0.1-0.2-0.2c-0.3-0.2-0.7-0.5-1-0.7c-0.1-0.1-0.2-0.1-0.3-0.2c-0.2-0.1-0.4-0.2-0.6-0.3c-0.2-0.1-0.5-0.3-0.7-0.4c-0.1,0-0.1-0.1-0.2-0.1c-0.4-0.2-0.8-0.4-1.2-0.5c0,0-0.1,0-0.1,0c-0.4-0.1-0.9-0.3-1.3-0.4c0,0,0,0,0,0c-0.1,0-0.2,0-0.3-0.1c-0.4-0.1-0.7-0.2-1.1-0.2c-0.2,0-0.4,0-0.7-0.1c-0.3,0-0.5-0.1-0.8-0.1c-0.3,0-0.6,0-0.8,0c-0.2,0-0.4,0-0.6,0c-0.3,0-0.6,0-0.9,0.1c-0.2,0-0.4,0-0.6,0.1c-0.3,0-0.5,0.1-0.8,0.1c-0.2,0-0.5,0.1-0.7,0.2c-0.2,0.1-0.4,0.1-0.7,0.2c-0.3,0.1-0.5,0.2-0.8,0.3c-0.2,0.1-0.3,0.1-0.5,0.2c-0.3,0.1-0.6,0.2-0.9,0.4c-0.1,0.1-0.3,0.1-0.4,0.2c-0.3,0.2-0.6,0.3-0.9,0.5c-0.1,0.1-0.3,0.2-0.4,0.3c-0.3,0.2-0.5,0.4-0.8,0.5c-0.2,0.1-0.3,0.3-0.5,0.4c-0.2,0.2-0.4,0.3-0.6,0.5c-0.2,0.2-0.4,0.4-0.6,0.6c-0.1,0.1-0.2,0.2-0.4,0.4c0,0,0,0,0,0.1c-0.3,0.3-0.5,0.6-0.7,0.9c-0.1,0.1-0.2,0.2-0.2,0.3c-0.2,0.3-0.4,0.6-0.6,0.9c-0.1,0.1-0.2,0.3-0.3,0.4c-0.1,0.1-0.2,0.3-0.2,0.5c-0.2,0.3-0.3,0.6-0.5,0.9c0,0,0,0.1,0,0.1c-0.2,0.4-0.4,0.9-0.5,1.3c0,0,0,0.1,0,0.1c-0.2,0.5-0.3,0.9-0.4,1.4c0,0,0,0,0,0c-1.9,8.1-4,16.5-6,25.2c-19.8,82-46.6,193.2-60.9,343.7c-25.8-7.2-89.5-30-102-152.5c-5.4-52.8,12.7-112.3,27.3-160.1c10.1-33.1,18.7-61.6,18.7-83.3c0-56.1,14.5-108.5,28.1-129.4c14.9-22.9,45.3-41.5,87.7-54c33.9-9.9,75.1-15.6,113.3-15.6c38.1,0.1,79.4,5.7,113.3,15.6c42.5,12.4,72.8,31.1,87.7,54c13.6,20.9,28.1,73.4,28.1,129.4c0,21.7,8.7,50.2,18.7,83.3C762.4,370.8,780.5,430.4,775.2,483.1z"/>
        <path d="M439.3,423.4c-8.5,0-15.3,6.9-15.3,15.3v15.3c0,8.5,6.9,15.3,15.3,15.3c8.5,0,15.3-6.9,15.3-15.3v-15.3C454.6,430.3,447.7,423.4,439.3,423.4z"/>
        <path d="M561.8,423.4c-8.5,0-15.3,6.9-15.3,15.3v15.3c0,8.5,6.9,15.3,15.3,15.3c8.5,0,15.3-6.9,15.3-15.3v-15.3C577.1,430.3,570.2,423.4,561.8,423.4z"/>
      <g/>
    </g>
    </svg>
    `
  );
  if ($("#cleoducktra").length === 0) {
    let vueString = '';
    //load the resources
    await $.get(SOURCE_URL + '/custom_features/cleoducktra/main.vue', null, function (html) {
      vueString = html.replace("<template>", "").replace("</template>", "");
    }, 'text');
    await $.getScript(SOURCE_URL + "/custom_features/cleoducktra/message.js");
    await $.getScript(SOURCE_URL + "/custom_features/cleoducktra/quiz-questions.js");
    await $.getScript(SOURCE_URL + "/custom_features/cleoducktra/content-outline.js");
    await $.getScript(SOURCE_URL + "/custom_features/cleoducktra/page-editor.js");
    await $.getScript(SOURCE_URL + "/custom_features/cleoducktra/search.js");
    await $.getScript("https://cdnjs.cloudflare.com/ajax/libs/jsdiff/5.1.0/diff.min.js");
    await $.getScript("https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.7/beautify-html.min.js");

    //create vue object
    $('body').append(vueString);
    //IMPORTED_FEATURE._init();
    new Vue({
      el: "#cleoducktra",
      mounted: async function() {
        let canvasUserData = await $.get("/api/v1/users/self");
        this.canvasUserData = canvasUserData;
        $("#global_nav_ask-cleo_link").click((e) => {
          e.preventDefault();
          this.show = true;
        })

        this.menus.push("Search");

        if (ENV.COURSE_ID != undefined) {
          this.menus.push("Content Outline");
        }
        if (ENV.QUIZ != undefined) {
          this.menus.push("Quiz Questions");
        }
        if (ENV.WIKI_PAGE != undefined) {
          this.menus.push("Page Editor");
        }
        // "Assignments",
        // "Quiz Questions"
      },
      computed: {
      },
      data: function() {
        return {
          lastOldMessage: 0,
          input: "",
          canvasUserData: {},
          awaitingResponse: false,
          buttonX: 10,
          show: false,
          messages: [
            new CleoDucktraMessage("Welcome! What can I do for you?")
          ],
          menus: [
            "Ask Cleo",
          ],
          menuCurrent: "Ask Cleo"
        }
      },
      methods: {
        cycleOldMessages(e) {
          if (e.keyCode == 38) {
            for (let i = this.messages.length - 1; i >= 0; i--) {
              let message = this.messages[i];
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
          let text = await CLEODUCKTRA.get(input);
          message.text= CLEODUCKTRA.formatResponse(text);
          message.img = "https://bridgetools.dev/canvas/media/cleoducktra-idle.gif"
          this.awaitingResponse = false;
          let containerEl = this.$el.querySelector(".msger-chat");
          containerEl.scrollTop = containerEl.scrollHeight;
          this.$nextTick(function() {
            let inputEl = this.$el.querySelector(".msger-input");
            inputEl.focus();
          });
        },
        autoResizeInput(e) {
          const textarea = $(e.target)[0];
          const maxHeight = 200; // set the maximum height here
          textarea.style.height = "auto";
          textarea.style.height = (textarea.scrollHeight ?? 0 + 2) + "px";
          if (textarea.offsetHeight > maxHeight) {
            textarea.style.height = maxHeight + "px";
            textarea.style.overflowY = "scroll";
          }
        }
      }
    });
  }
})();
