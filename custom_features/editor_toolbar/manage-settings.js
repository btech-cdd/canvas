(async function() {
  console.log("TOOLBAR");
  $("#content").empty();
  $("#content").html(`
    <div
      id="toolbar-settings"
    >
      {{settings}}
      <div
        v-for="val, setting in settings.misc"
      >
        <span>{{setting}}</span><input @click="updateSettings" type="checkbox" :id="'misc-' + setting" v-model="settings.misc[setting]">
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
      fillInDefault(current, preset) {
        for (let i in preset) {
          let val = preset[i];
          //if this setting doesn't exist, set it to the default
          if (current?.[i] == undefined) {
            current[i] = val
          } else if (typeof val == "object") {
            current[i] = this.fillInDefault(current[i], val)
          }
        }
        return current;
      },

      async parseCanvasData(settings) {
        console.log(settings);
        if ((settings !== undefined) && (typeof settings == "object")) {
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
          console.log("ABORT");
          settings = {};
        }
        settings = this.fillInDefault(settings, this.defaultSettings);

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
        settings = await this.parseCanvasData(settings);
        await $.put(`/api/v1/users/self/custom_data/toolbarsettings?ns=com.btech`, {
          data: settings
        });
        this.settings = settings;

        console.log(settings);

      },

      async updateSettings() {
        console.log(this.settings);
        await $.put(`/api/v1/users/self/custom_data/toolbarsettings?ns=com.btech`, {
          data: this.settings
        });
      },

      async resetSettings() {
        await $.put(`/api/v1/users/self/custom_data/toolbarsettings?ns=com.btech`, {
          data: this.defaultSettings
        });
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