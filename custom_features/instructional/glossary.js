(function () {
  IMPORTED_FEATURE = {};
  if (true) { //check the window location
    //THIS IS A TEMPLATE/TUTORIAL FOR HOW TO ADD A CUSTOM FEATURE
    IMPORTED_FEATURE = {
      initiated: false, //SET TO TRUE WHEN feature() IS RUN FROM THE custom_canvas.js PAGE TO MAKE SURE FEATURE ISN'T INITIATED TWICE
      courseId: '',
      settingsEl: null,
      async getGlossary() {
        let feature = this;
        /*
        $('body').append("<table><thead><tr><th>Term</th><th>Definition</th></tr></thead><tbody><tr><td>-term-</td><td>-definition-</td></tr></tbody></table>");
        */
        try {
          await $.get("/api/v1/courses/" + feature.courseId + "/pages/glossary").success(function (data) {
            //if custom settings page exists, look for the appropriate header
            console.log(data.body);
          });
        } catch (e) {
          console.log(e);
        }
        return;
      },
      async createSettingsPage() {
        let feature = this;
        feature.settingsEl.html(`
          <h2>ABOUT</h2>
          <p>Do not edit/delete this page.</p>
          <p>This page was created to store date for custom course features. All saved features will be lost if this page is deleted.</p>
          <h2>SETTINGS</h2>
        `);
      },
      async getSettingData(settingId) {
        let val = "";
        let settings = this.settingsEl;
        if (settings !== null) {
          let setting = settings.find('#' + settingId);
          if (setting.length > 0) {
            //get the name of the page to append and then grab the page
            val = setting.text();
          }
        }
        return val;
      },
      async updateSetting(settingId, value) {
        let setting = this.settingsEl.find("#" + settingId);
        if (setting.length == 0) {
          setting = $("<div id='" + settingId + "'></div>");
          this.settingsEl.append(setting);
        }
        setting.text(value);
      },
      async _init(params = {}) { //SOME FEATURES NEED CUSTOM PARAMS DEPENDING ON THE USER/DEPARTMENT/COURSE SUCH AS IF DENTAL HAS ONE SET OF RULES GOVERNING FORMATTING WHILE BUSINESS HAS ANOTHER
        let feature = this;
        let rPieces = /^\/courses\/([0-9]+)\/pages/;
        let pieces = window.location.pathname.match(rPieces);
        if (pieces) {
          feature.courseId = parseInt(pieces[1]);
          await this.getGlossary();
        }

        //get header on modules page and add an empty div
      },
    }
  }
})();