(async function () {
  console.log("BLUEPRINT LINKS");
  $('body').on('click', '.bcs__row__associations button', async function (e) {
    console.log("BUTTON 2 CLICK")
    rows = await getElement(".bca-associations-table tr");
    rows.each(function () {
      console.log("ROW FOUND");
      let spans = $(this).find("td span");
      if (spans.length > 0) {
        let courseId = $(this).attr("id").replace("course_", "");
        console.log(courseId);
        $(spans[0]).wrapInner("<a href='/courses/" + courseId + "' target='#'></a>");
      }
    });
  });
})();