(async function() {
  Vue.component('rce-editor-icon', {
    template: ` 
      <div
        class="icon-text"
      >
        <img
          @click="create"
          title="Create a right aligned header at the top of the current modal."
          :src="'https://bridgetools.dev/canvas/media/editor-icons/' + icon"
        ></img>
      </div>
    `,
    props: {
      icon: {
        type: String,
        default: ""
      },
    },
    computed: {},
    data() {
      return {
      } 
    },
    created: async function () {
    },

    methods: {
    },

    destroyed: function () {}
  });
})();

