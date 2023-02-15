$("body").append(`
  <div id="vue-cleoquacktra">
    <p>This is a test</p>
  </div>
`);
new Vue({
  el: '#vue-cleoquacktra',
  mounted: async function () {
  },

  data: function () {
    return {
      history: []
    }
  },
  computed: {
  },
  methods: {
  }
});