(function () {
  IMPORTED_FEATURE = {};
  if (/^\/courses\/[0-9]+\/modules$/.test(window.location.pathname)) {
      IMPORTED_FEATURE = {
          initiated: false,
          displayHours: false,
          displayHoursElement: {},
          hoursTotal: 0,
          _init() {
              let feature = this;
              let modules = $('div.item-group-condensed');
              let hoursTotal = 0;
              modules.each(function () {
                  let headerElement = $($(this).find("div.ig-header span.name")[0]);
                  let header = headerElement.text().trim();
                  if (header !== "") {
                      let items = $(this).find("ul.ig-list div.ig-row span.item_name span.title");
                      items.each(function () {
                          let label = $(this).text();
                          console.log(label);
                          if (label.includes("#HOURSTOTAL#")) {
                              feature.displayHoursElement = this;
                              feature.displayHours = true;
                          }
                      });
                  }
              });
              if (feature.displayHours) {
                  modules.each(function () {
                      let module = $(this);
                      let headerElements = $(this).find("div.ig-header span.name");
                      let headerElement = $(headerElements[0]);
                      let header = headerElement.text().trim();
                      let headerMatch = header.match(/(.*) - [0-9]+[\.]{0,1}[0-9]* [H|h]our(s){0,1}/);
                      if (headerMatch !== null) {
                          header = headerMatch[1].trim();
                      }
                      if (header !== "") {
                          let items = module.find("ul.ig-list div.ig-row");
                          let pointsTotal = 0;
                          items.each(function () {
                              if ($(this).hasClass('ig-published')) {
                                  let info = $(this).find('div.ig-info');
                                  let pointsElement = info.find('span.points_possible');
                                  if (pointsElement.text().trim() !== "") {
                                      let points = parseFloat(pointsElement.text());
                                      pointsTotal += points;
                                  }
                              }
                          });
                          let hours = pointsTotal / 10;
                          hoursTotal += hours;
                          let hoursString = "Hour";
                          if (hours != 1) {
                              hoursString += "s";
                          }
                          headerElements.each(function() {
                              let oElement = $(this);
                              let displayElement = oElement.clone();
                              oElement.after(displayElement);
                              oElement.hide();
                              displayElement.text(header + " - " + hours.toFixed(1) + " " + hoursString + " (Total: " + hoursTotal.toFixed(1) + ")");
                          });
                      }
                  });
              }
              $(feature.displayHoursElement).find('span.title').text($(feature.displayHoursElement).find('span.title').text().replace("#HOURSTOTAL#", hoursTotal.toFixed(1)));
          }
      }
  }
})();