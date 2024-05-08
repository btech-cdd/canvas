(async function() {
  Vue.component('rce-modal-header-banner', {
    template: ` 
      <i
        @click="create"
        class="icon-text"
        title="Create a banner image with a text header."
      ></i>
    `,
    props: {
      deafultimg: {
        type: String,
        default: ""
      },
      getContainer: {
        type: Function,
        default: () => {}
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
        console.log(this.defaultimg);
        container.after(`
          <div
            class="
              btech-formatted-content-modal
              btech-formatted-content-image-right-wrapper
            "
            style="
              display: grid;
              grid-template-columns: 2fr 1fr;
            "
          >
            <div>
              <p>TEXT</p>
            </div>
            <img
              style="width: 100%;"
              src="${this.defaultimg}"
            />
          </div>
        `)
      },
    },

    destroyed: function () {}
  });
})();
