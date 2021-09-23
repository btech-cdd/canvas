(function() {
  'use strict';
  let modules = {};
  let moduleEls = $(".context_module");
  moduleEls.each(function() {
      let el = $(this)
      let label = el.attr('aria-label');
      modules[label] = el;
      if (label !== "Orientation") {
          console.log(label);
          el.hide();
      }
  });
  $.get("/api/v1/courses/" + ENV.COURSE_ID + "/sections?include[]=students", function(data) {
      for (let d in data) {
          let section = data[d];
          if (section.students != null) {
              for (let moduleName in modules) {
                  if (moduleName.includes(section.name)) {
                      modules[moduleName].show();
                  }
              }
          }
      }
      console.log(data);
  });
  // Your code here...
})();