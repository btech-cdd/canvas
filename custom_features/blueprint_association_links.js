(async function () {
  let blueprintIcon = await getElement(".bcs__trigger")
  console.log(blueprintIcon);
  blueprintIcon.click(async function (e) {
    console.log('click!')
    let button = await getElement(".bcs__row__associations button");
    console.log("READY");
    button.click(async function (e) {
      console.log('click!!')
      rows = await getElement(".bca-associations-table tr");
      rows.each(function () {
        let spans = $(this).find("td span");
        console.log(spans);
        if (spans.length > 0) {
          let courseId = $(this).attr("id").replace("course_", "");
          $(spans[0]).wrapInner("<a href='/courses/" + courseId + "' target='#'></a>");
        }
      });
    });
  });
})();