let checkbox = $("#only_consider_graded_assignments");
let checked = checkbox.is(":checked");
if (checked) {
  let gradesEl = $("#right-side-wrapper .final_grade .grade");
  let currentGrade = 0;
  try {
    currentGrade = parseFloat(gradesEl.text().match(/([0-9]+(\.[0-9]+){0,1})%/)[1]);
  } catch(e) {
    console.log(e);
  }
  console.log(currentGrade);
  checkbox.click();
  let finalGrade = 0;
  try {
    finalGrade = parseFloat(gradesEl.text().match(/([0-9]+(\.[0-9]+){0,1})%/)[1]);
  } catch(e) {
    console.log(e);
  }
  console.log(finalGrade);
  let progress = 0;
  if (currentGrade > 0) {
    progress = Math.round(finalGrade / currentGrade * 10000) / 100;
    gradesEl.append("*");
    gradesEl.parent().after("<div>Progress: ~"+progress+"%</div><div id=\"btech-grade-disclaimer\">*This grade treats unsubmitted assignments as 0.</div>")
    checkbox.click(function() {
      let checked = checkbox.is(":checked");
      console.log(checked);
      if (!checked) {
        $("#btech-grade-disclaimer").show();
        gradesEl.append("*");
      }
      if (checked) $("#btech-grade-disclaimer").hide();
    });
  }
  console.log(progress + "%");
}