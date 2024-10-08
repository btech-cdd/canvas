(async function () {
  let vueString = '';
  //load the resources
  await $.get(SOURCE_URL + '/custom_features/cleoducktra/search.vue', null, function (html) {
    vueString = html.replace("<template>", "").replace("</template>", "");
  }, 'text');
  Vue.component('cleoducktra-search', {
    template: vueString,
    mounted: async function() {
      let canvasUserData = await $.get("/api/v1/users/self");
      this.canvasUserData = canvasUserData;
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
          new CleoDucktraMessage("What can I find for you?")
        ],
        state: "prompt",
        questions: [],
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
        let docs = await CLEODUCKTRA.searchDocs(input);
        message.text = "";
        for (let d in docs) {
          let doc = docs[d];
          console.log(doc);
          content = `<p><a href="${doc.url}">${doc.name}</a></p>`;
          include = false;
          for (let p in doc.pages) {
            let page = doc.pages[p];
            let resp = await CLEODUCKTRA.get(`
              Does the following content relate to my query: ${input}?
              If no, respond with just one word, 'No'. 
              If yes, respond 'Yes." then provide useful information based on the content and provide a quote from the content to support your answer.
              CONTENT: ${page}
            `)
            if (resp.startsWith("No") == false) {
              include = true;
              content += `<p>${resp.replace(/^Yes(\.|,| )/, "")}</p>`;
            }
          }
          if (include) message.text += content;
        }
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
})();