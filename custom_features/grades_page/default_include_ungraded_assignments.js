let gradesEl = $("#student_grades_right_content .final_grade");
let currentGrade = gradesEl.text().match(/([0-9]+(\.[0-9]+){0,1}%)/)[1];
console.log(currentGrade);
$("#only_consider_graded_assignments_wrapper").find('label').click();
let finalGrade = gradesEl.text().match(/([0-9]+(\.[0-9]+){0,1}%)/)[1];
console.log(finalGrade);