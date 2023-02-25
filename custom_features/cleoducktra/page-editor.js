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
        diffs: "",
        awaitingResponse: false,
        editType: "",
        state: "select type",
        show: "revision",
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
        let content = TOOLBAR.editor.getContent();
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
          let contentArr = content.split("\n");
          contentArr.filter(item => item);

          let revision = await CLEODUCKTRA.get(`${req} ${TOOLBAR.editor.getBody().innerHTML}`);
          let revisionArr = resp.split("\n");
          revisionArr.map(s => s.trim());
          revisionArr.filter(item => item);

          let diffs = Diff.diffArrays(contentArr, revisionArr);
          let displayRevisions = "";
          diffs.forEach((part) => {
            const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
            console.log(part);
            displayRevisions += `<div style="color: ${color};">${part.value.join(" ")}</div>`
          })
          this.diffs = displayRevisions;
          this.revision = revision;
        }
      }
    }
  });
})();