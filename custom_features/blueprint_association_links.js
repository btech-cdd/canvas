(async function () {
  let blueprintIcon = await getElement(".bcs__trigger")
  console.log(blueprintIcon);
  blueprintIcon.click(async function (e) {
    console.log('click!')
    let button = await getElement(".bcs__row__associations button");
    button.click(async function (e) {
      rows = await getElement(".bca-associations__course-row");
      rows = $(".bca-associations__course-row");
      rows.each(function () {
        let spans = $(this).find("span");
        let courseId = $(this).attr("id").replace("course_", "");
        $(spans[0]).wrapInner("<a href='/courses/" + courseId + "' target='#'></a>");
      });
    });
  });
})();