(async function() {
  Vue.component('rce-callout', {
    template: ` 
      <i
        @click="create"
        class="icon-note-light"
        title="Create a gray, centered callout box."
      ></i>
    `,
    props: {
    },
    computed: {},
    data() {
      return {
      } 
    },
    created: async function () {
    },

    methods: {
      // CREATES A COMMENT THAT APPEARS IN THE RIGHT MARGIN (PADDING) OF THE PAGE AND MOVES TO THE TOP OF THE ASSOCIATED ELEMENT EVEN ON PAGE RESIZE
      create: function () {
        let editor = tinymce.activeEditor;
        let selection = editor.selection;
        let selectionContent = selection.getContent();
        if (selectionContent !== "") {
          editor.execCommand("mceReplaceContent", false, `
            <div class="btech-callout-box flat">
            ${selectionContent}
            </div>
          `);
        } else {
          editor.execCommand("mceInsertContent", false, `
            <div class="btech-callout-box flat">
              <p>Callout Content</p>
            </div>
          `);
        }
      },
    },

    destroyed: function () {}
  });
})();