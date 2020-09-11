(async function () {
  let blueprintIcon = await getElement(".bcs__trigger")
  blueprintIcon.click(async function (e) {
    let button = await getElement(".bcs__row__associations button");
    button.click(async function (e) {
      rows = await getElement(".bca-associations-table tr");
      rows.each(function () {
        let spans = $(this).find("td span");
        if (spans.length > 0) {
          let courseId = $(this).attr("id").replace("course_", "");
          $(spans[0]).wrapInner("<a href='/courses/" + courseId + "' target='#'></a>");
        }
      });
    });
  });
})();