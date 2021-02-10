(async function () {
  async function delay(ms) {
    // return await for better async stack trace support in case of errors.
    return await new Promise(resolve => setTimeout(resolve, ms));
  }
  async function getElement(selectorText, iframe = "") {
    let element;
    if (iframe === "") {
      element = $(selectorText);
    } else {
      element = $(iframe).contents().find(selectorText);
    }
    if (element.length > 0 && element.html().trim() !== "") {
      return element;
    } else {
      await delay(250);
      return getElement(selectorText, iframe);
    }
  }
  this.APP = new Vue({
    el: '#canvas-courses-report-vue',
    mounted: async function () {
      $('#canvas-courses-report-vue').css({
        visibility: 'visible'
      });
      let app = this;
      let dept = '' + CURRENT_DEPARTMENT;
      await app.loadJsonFile('dept_data/3819');
      console.log(app.json.courses_data);
      app.loading = false;
    },

    computed: {
    },

    updated: function () {},

    data: function () {
      return {
        loading: true,
        json: {},
        minEnrollments: 5,
        minProgress: 10,
        colors: {
          base: '#334',
          black: '#000000',
          white: '#ffffff',
          red: 'rgb(217, 83, 79)',
          orange: 'rgb(229, 128, 79)',
          yellow: 'rgb(240, 173, 78)',
          green: 'rgb(92, 184, 92)',
          blue: 'rgb(91, 192, 222)',
          gray: '#E0E0E0',
          noProgress: '#E0E0E0',
          complete: '#5BC0DE',
          badDate: '#D9534F',
          warningDate: '#F0AD4E',
          goodDate: '#5CB85C',
        },
        scrollTop: 0, //used to save the scroll location of the main screen before going into the student report
      }
    },
    methods: {
      async loadJsonFile(name) {
        let app = this;
        let jsonUrl = 'https://jhveem.xyz/lti/report_data/' + name;
        let jsonData = {};
        await $.post(jsonUrl, function (data) {
          jsonData = data;
        });
        if (name.includes('dept_data')) name = 'courses_data'
        app.json[name] = jsonData;
      },

      getBGColor(val, groups) {
        let app = this;
        if (val < groups[0]) return app.colors.red;
        if (val < groups[1]) return app.colors.yellow;
         return app.colors.green;
      }
    }
  })
})();