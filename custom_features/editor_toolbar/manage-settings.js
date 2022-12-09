(async function() {
  console.log("TOOLBAR");
  $("#content").empty();
  $("#content").html(`
    <div
      id="toolbar-settings"
    >
      <div
        v-for="setting, val in settings.misc
      >
        <span>{{setting}}</span>
      </div>
      <p>hello world</p>
    </div>
  `);
  await $.getScript("https://cdn.jsdelivr.net/npm/vue@2.6.12");
  new Vue({
    el: "#toolbar-settings",
    mounted: async function () {
      this.getSettings();
    },
    data: function () {
      return {
        settings: {},
        defaultSettings: {
          misc: {
            hoverreveal: true,
            definition: true,
          },
          tables: {
            excel: false,
            tabs: true
          },
          iconcategories: {
            canvas: true,
            plumbing: true,
          }
        }
      }
    },
    methods: {
      async parseCanvasData(settings) {
        if (settings != undefined) {
          for (let category in settings) {
            let val = settings[category]
            if (typeof val != "string") {
              for (let bool in val) {
                if (val[bool] == "true") val[bool] = true;
                if (val[bool] == "false") val[bool] = false;
              }
            }
          }
        } else {
          settings = {};
          for (let i in this.defaultSettings) {
            let ival = this.defaultSettings[i];
            //if this setting doesn't exist, set it to the default
            if (settings?.[i] == undefined) {
              settings[i] = ival
            } else {
              console.log(typeof ival); //what is it, object, string, int, bool?
              //else iterate
              for (let j in this.defaultSettings) {
                //fix this to infinite loop however deep it needs to go
              }
            }
          }
        }

        console.log(settings);

        // await $.put(`/api/v1/users/self/custom_data/toolbarsettings?ns=com.btech`, {
        //   data: settings
        // });
        return settings;
      },

      async getSettings() {
        let settings;
        let v = 1.1;
        try {
          settings = await $.get(`/api/v1/users/self/custom_data/toolbarsettings?ns=com.btech`);
          settings = settings.data;
        } catch (err) {
          console.log(err);
        }
        settings = this.parseCanvasData(settings);


        console.log(settings);

      } 
    }
  });
  let assignmentData = [];
  for (let i = 0; i < assignmentData.length; i++) {
    let group = assignmentData[i];
    $("#content").append("<h2>" + group.name + " (" + group.group_weight + "%)</h2>");
  }

  // expandButton.click(function() {
  //   let maxWidth = getCSSVar("--btech-max-width");
  //   if (maxWidth == "auto") {
  //     $(expandButton.find("svg")).attr("fill", "#AAA");
  //     $.put(`/api/v1/users/self/custom_data?ns=com.btech&data[page_width]=default`);
  //     setCSSVar("--btech-max-width", DEFAULT_MAX_WIDTH);
  //   } else {
  //     $(expandButton.find("svg")).attr("fill", "#000000");
  //     $.put(`/api/v1/users/self/custom_data?ns=com.btech&data[page_width]=auto`);
  //     setCSSVar("--btech-max-width", "auto");
  //   }
  // })
})();