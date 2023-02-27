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
        selection: false,
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
        this.selection = false;
      },
      applyEdits() {
        if (this.selection) {
          TOOLBAR.editor.selection.setContent(this.revision);
        } else {
          TOOLBAR.editor.setContent(this.revision);
        }
        this.restart();
      },
      async editPage() {
        this.awaitingResponse = true;
        let editType = this.editType;
        console.log(TOOLBAR.editor.selection.getContent());
        let content = TOOLBAR.editor.getContent();
        if (TOOLBAR.editor.selection.getContent() !== "") {
          content = TOOLBAR.editor.selection.getContent();
          this.selection = true;
        }
        content = html_beautify(content);
        let contentArr = content.split("\n");
        contentArr.map(s => s.trim());
        contentArr.filter(item => item);
        this.content = content;
        let tokenCount = content.split(" ").length * 1.4;
        if (tokenCount < 1000) {
          let req = "";
          if (editType == "Concision") {
            req = "Edit the content of this html to be more concise"
          } else if (editType == "Clarity") {
            req = "Edit the content of this html to be more clear"
          } else if (editType == "Accuracy") {
            req = "Correct any factually incorrect statements in the following html and then wrap the statement in italics tags."
          } else if (editType == "Spelling/Grammar") {
            req = "Edit the content of this html for spelling and grammar using American spelling."
          } 

          let revision = await CLEODUCKTRA.get(`${req}. ${content}`);
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