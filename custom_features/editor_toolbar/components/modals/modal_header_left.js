(async function() {
  console.log("MODAL HEADER LEFT");
  Vue.component('rce-modal-header-left', {
    template: ` 
      <i
        @click="create"
        class="icon-text"
        title="Create a content modal with an image on the left and text content on the right."
      ></i>
    `,
    props: {
      defaultimg: {
        type: String,
        default: ""
      },
      getContainer: {
        type: Function,
        default: () => {}
      },
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
        let container = this.getContainer($(editor.selection.getNode()));
        editor.selection.collapse(false);
        tinymce.activeEditor.execCommand('mceInsertContent', false, `
          <h2
            style="
              margin-top: -2rem;
              background-color: ${this.color};
              color: #FFFFFF;
              position: relative;
              z-index: 2;
              font-size: 2rem;
              display: inline-block;
              margin-left: -2rem;
              padding-left: 3rem;
              width: 90%;
              border: 0.25rem solid #FFFFFF;
            " 
          ><strong>HEADER</strong></h2>
        `)
      },
    },

    destroyed: function () {}
  });
})();
