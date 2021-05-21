let gradesEl = $(".final_grade .grade");
let currentGrade = 0;
try {
  currentGrade = parseFloat(gradesEl.text().match(/([0-9]+(\.[0-9]+){0,1})%/)[1]);
} catch(e) {
  console.log(e);
}
$("#only_consider_graded_assignments_wrapper").find('label').click();
let finalGrade = 0;
try {
  finalGrade = parseFloat(gradesEl.text().match(/([0-9]+(\.[0-9]+){0,1})%/)[1]);
} catch(e) {
  console.log(e);
}
if (currentGrade > 0) console.log(finalGrade / currentGrade);