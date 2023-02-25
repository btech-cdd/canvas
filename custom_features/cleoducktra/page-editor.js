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
        awaitingResponse: false,
        state: "prompt",
        editOptions: [
          'Clarity',
          'Concision',
          'Spelling/Grammar'
        ]
      }
    },
    methods: {
    }
  });
})();