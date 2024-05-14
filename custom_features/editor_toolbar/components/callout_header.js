(async function() {
  Vue.component('rce-callout-header', {
    template: ` 
      <i
        @click="create"
        class="icon-note-light"
        title="Create a gray, centered callout box."
      ></i>
    `,
    props: {
      color: {
        type: String,
        default: '#d22232'
      }
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
            <div 
              style="
                background-color: #F6F6F6;
                padding: 0.5rem;
                margin: 0.5rem auto 1rem auto;;
                width: 90%;
                max-width: 50ch;
                border: 1px solid #DDD;
              "
            >
            <h3 style="
              margin-top: -1.5rem; 
              text-align: center; 
              font-size: 1.5rem;"
            >
              <span style="
                background-color: ${this.color};
                color: #ffffff; 
                z-index: 2; 
                display: inline-block; 
                margin: auto; 
                padding-left: 1rem; 
                padding-right: 1rem;"
              >
                <strong>HEADER</strong>
              </span>
            </h3>
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
