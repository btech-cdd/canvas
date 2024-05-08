(async function() {
  Vue.component('rce-modal-image-left', {
    template: ` 
      <i
        @click="create"
        class="icon-image"
        title="Create a content modal with an image on the left and text content on the right."
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
        let container = getContainer($(editor.selection.getNode()));
        container.after(`
          <div
            class="
              btech-formatted-content-modal
              btech-formatted-content-image-left-wrapper
            "
            style="
              display: grid;
              grid-template-columns: 1fr 2fr;
            "
          >
            <img
              style="width: 100%;"
              src="${this.defaultimg}"
            />
            <div>
              <p>TEXT</p>
            </div>
          </div>
        `)
      },
    },

    destroyed: function () {}
  });
})();