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
        settings: {}
      }
    },
    methods: {
      async getSettings() {
        let settings;
        try {
          settings = await $.get(`/api/v1/users/self/custom_data/toolbarsettings?ns=com.btech`);
          if (settings?.misc == undefined) {
            settings.misc = {
              hoverreveal: true,
              definition: true,
            }
          }
          console.log(settings.data);
        } catch (err) {
          console.log(err);
          settings = {
            misc: {
              hoverreveal: true,
              definition: true,
            },
            iconcategories: {
              canvas: true,
              plumbing: true,
            }
          };
          $.put(`/api/v1/users/self/custom_data/toolbarsettings?ns=com.btech`, {
            data: settings
          });
        }

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