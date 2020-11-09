(function () {
  IMPORTED_FEATURE = {};
  if (true) { //check the window location
    //THIS IS A TEMPLATE/TUTORIAL FOR HOW TO ADD A CUSTOM FEATURE
    IMPORTED_FEATURE = {
      initiated: false, //SET TO TRUE WHEN feature() IS RUN FROM THE custom_canvas.js PAGE TO MAKE SURE FEATURE ISN'T INITIATED TWICE
      courseId: '',
      settingsEl: null,
      definitions: {},
      terms: [],
      def: null,
      async getGlossary() {
        let feature = this;
        /*
        $('body').append("<table><thead><tr><th>Term</th><th>Definition</th></tr></thead><tbody><tr><td>-term-</td><td>-definition-</td></tr></tbody></table>");
        */
        try {
          await $.get("/api/v1/courses/" + feature.courseId + "/pages/glossary").success(function (data) {
            //if custom settings page exists, look for the appropriate header
            console.log(data.body);
            let table = $(data.body);
            let rows = table.find('tbody tr');
            rows.each(function() {
              let row = $(this);
              cells = row.find('td');
              let term = cells[0].textContent;
              let definition = cells[1].textContent;
              feature.terms.push(term);
              feature.definitions[term] = definition;
            });
            console.log(feature.terms);
            console.log(feature.definitions);
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
      renderPage() {
        let feature = this;
        let page = $('#wiki_page_show .show-content');
        let ps = page.find('p');
        ps.each(function() {
          let p = $(this);
          let html = p.html();
          for (let t = 0; t < feature.terms.length; t++) {
            let term = feature.terms[t];
            let regEx = new RegExp(term, 'ig');
            let replace = "<span style='font-weight: bold; cursor: help;' class='btech-term-definition'>" + term + "</span>";
            html = html.replace(regEx, replace);
          }
          p.html(html);
        });
        console.log(page);
      },
      async _init(params = {}) { //SOME FEATURES NEED CUSTOM PARAMS DEPENDING ON THE USER/DEPARTMENT/COURSE SUCH AS IF DENTAL HAS ONE SET OF RULES GOVERNING FORMATTING WHILE BUSINESS HAS ANOTHER
        let feature = this;
        let rPieces = /^\/courses\/([0-9]+)\/pages/;
        let pieces = window.location.pathname.match(rPieces);
        feature.def = $('<div id="btech-glossary-modal"><div class="btech-glossary-term"></div><div class="btech-glossary-definition"></div></div>');
        $('body').append(feature.def);
        def.find('.btech-glossary.term').text("TEST");
        if (pieces) {
          feature.courseId = parseInt(pieces[1]);
          await feature.getGlossary();
          feature.renderPage(); 
        }

        //get header on modules page and add an empty div
      },
    }
  }
})();