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
        tooLong: false,
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
      restart() {
        this.state = 'select type';
        this.awaitingResponse = false;
        this.tooLong = false;
        this.revision = '';
        this.diffs = '';
        this.content = '';
      },
      applyEdits() {

      },
      async editPage() {
        this.awaitingResponse = true;
        let editType = this.editType;
        let content = TOOLBAR.editor.getContent();
        content = html_beautify(content);
        let contentArr = content.split("\n");
        contentArr.map(s => s.trim());
        contentArr.filter(item => item);
        this.content = content;
        let tokenCount = content.split(" ").length;
        if (tokenCount < 1000) {
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

          let revision = await CLEODUCKTRA.get(`${req} ${content}`);
          this.awaitingResponse = false;
          revision = html_beautify(revision);
          let revisionArr = revision.split("\n");
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
        } else {
          this.tooLong = true;
          console.log("TOO BIG: " + tokenCount + " TOKENS");
        }
      }
    }
  });
})();