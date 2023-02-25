(async function () {
  let vueString = '';
  //load the resources
  await $.get(SOURCE_URL + '/custom_features/cleoducktra/page-editor.vue', null, function (html) {
    vueString = html.replace("<template>", "").replace("</template>", "");
  }, 'text');
  Vue.component('cleoducktra-page-editor', {
    template: vueString,
    mounted: function() {
    },
    data: function() {
      return {
        content: "",
        revision: "",
        awaitingResponse: false,
        editType: "",
        state: "select type",
        editOptions: [
          'Clarity',
          'Concision',
          'Accuracy',
          'Spelling/Grammar'
        ]
      }
    },
    methods: {
      async editPage() {
        let editType = this.editType;
        let content = TOOLBAR.editor.getBody().innerHTML;
        this.content = content;
        let tokenCount = content.split(" ").length;
        console.log(tokenCount);
        if (tokenCount < 500) {
          let req = "";
          if (editType == "Concision") {
            req = "Edit the content of this html to be more concise."
          } else if (editType == "Clarity") {
            req = "Edit the content of this html to be more clear."
          } else if (editType == "Accuracy") {
            req = "Edit the content of this html for factual accuracy."
          } else if (editType == "Spelling/Grammar") {
            req = "Edit the content of this html for spelling and grammar."
          }
          let resp = await CLEODUCKTRA.get(`${req} ${TOOLBAR.editor.getBody().innerHTML}`);
          console.log(resp);
          this.revision = resp;
        }
      }
    }
  });
})();