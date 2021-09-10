//THIS IS THE GENERIC VERSION, JUST HIGHLIGHTS EVERYTHING BELOW 80%. THERE IS A MORE TAILORED DENTAL ONE.
IMPORTED_FEATURE = {};
if (/^\/courses\/[0-9]+\/grades\/[0-9]+$/.test(window.location.pathname)) {
  let highlightColor = "#FFC";
  $("tr.student_assignment").each(function () {
    let gradeText = $(this).find("span.grade").text().replaceAll("Click to test a different score", "").trim();
    let grade = parseFloat(gradeText);
    let total = parseFloat($(this).find("td.points_possible").text().trim());
    if (isNaN(grade) && gradeText != "-" && gradeText != "N/A") {
      $(this).css("background-color", highlightColor);
    } else if (!isNaN(grade) && !isNaN(total)) {
      let percent = (grade / total);
      if (percent < .8) {
        $(this).css("background-color", highlightColor);
      }
    }
  });
}