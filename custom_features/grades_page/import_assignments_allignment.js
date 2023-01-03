//Need to add a button to run this on the allignment page
function allignAssignments(reg="") {
  let noMatchList = [];
  $(".assignment_section table tr").each(function() {
    let titleOriginal = $(this).find("th.title").text()
    let title = titleOriginal.replace(reg, "");
    let select = $(this).find("select");
    let options = select.find("option");
    let found = false;
    options.each(function() {
        let option = $(this);
        let val = option.attr("value");
        let name = option.text().replace(reg, "");
        if (name == title) {
            select.val(val).change();
            found = true;
        }
    });
    if (!found) {
      select.val("ignore").change();
      noMatchList.push(titleOriginal);
    }
  });
}
allignAssignments(/Module [0-9]+\.[0-9]+:\s*/);
