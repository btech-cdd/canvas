//THIS HAS VERY MUCH BEEN TAILORED TO DENTAL. IT WILL NEED TO BE REWORKED TO BE FLEXIBLE ACROSS DEPARTMENTS
if (/^\/courses\/[0-9]+\/grades\/[0-9]+$/.test(window.location.pathname)) {
  function addDot(el, color="#FC0") {
    $(el.find(".assignment_score .score_holder")).append(`
      <span class="unread_dot grade_dot" style="background-color: ${color};">&nbsp;</span>
    `);
  }
  let submissions = {};
  let submissionsData = ENV.submissions;
  for (let s in submissionsData) {
    let submission = submissionsData[s];
    submissions[submission.assignment_id] = submission;
    if (submission.assignment_id == 5353425) {
    }
  }
  let groups = ENV.assignment_groups;
  for (let g in groups) {
    let group = groups[g];
    let assignments = group.assignments;
    for (let a in assignments) {
      let assignment = assignments[a];
      if (!!submissions?.[assignment.id]) {
        let el =  $(`#submission_${assignment.id}`);
        let submission = submissions[assignment.id];
        let score = submission.score;
        if (submission.workflow_state == 'submitted' && score == null) {
          addDot(el, "#C00");
          continue;
        }
        let possible = assignment.points_possible;
        let perc = score / possible;
        if (score != null) {
          let context = el.find("div.context").text();
          if (context === "Skills Pass-Off") {
            console.log(submission);
            console.log(assignment);
            let rubricId = $(this).attr("id").replace("submission_", "rubric_");
            let table = $("#" + rubricId + " tbody.criterions");
            let criteria = $(table).find("tr.rubric-criterion");
            let completed = true;
            criteria.each(function() {
                //CHECK EVERY CRITERIA EXCEPT FOR ATTEMPTS
                let isAttemptsCriterion = $(this).find("th.description-header").text().includes("Attempts");
                //CHECK ALL CRITERIA EXCEPT ATTEMPTS
                if (!isAttemptsCriterion) {
                    let ratings = $(this).find("div.rating-tier-list div.rating-tier");
                    //IF THE TOP OPTION ISN'T SELECTED, IT'S NOT COMPLETE
                    if (!$(ratings[0]).hasClass("selected")) {
                        completed = false;
                    }
                }
            });
            if (completed === false) {
              addDot(el, "#FC0");
            }
          } else if (perc < .8) {
            addDot(el, "#FC0");
          }
        }
      }
    }
  }
  /*
  $("tr.student_assignment").each(function() {
    let el = $(this);
    let context = $(this).find("div.context").text();
    let gradeText = $(this).find("span.grade").text().replaceAll("Click to test a different score", "").trim();
    let grade = parseFloat(gradeText);
    let total = parseFloat($(this).find("td.points_possible").text().trim());
    console.log(context);
    console.log(grade);
    console.log(total);
    if (isNaN(grade) && gradeText != "-" && gradeText != "N/A") {
      addDot(el, "#C00");
      // $(this).css("background-color", highlightColor);
    } else if (!isNaN(grade) && !isNaN(total)) {
      let percent = (grade / total);
      if (context === "Quizzes" && percent < .8) {
        addDot(el, "#FC0");
      }
      if (context === "Assignments" && percent < .8) {
        addDot(el, "#FC0");
      }
      if (context === "Tests" && percent < .8) {
        addDot(el, "#FC0");
      }
      if (context === "Skills Pass-Off") {
        let rubricId = $(this).attr("id").replace("submission_", "rubric_");
        let table = $("#" + rubricId + " tbody.criterions");
        let criteria = $(table).find("tr.rubric-criterion");
        let completed = true;
        criteria.each(function() {
            //CHECK EVERY CRITERIA EXCEPT FOR ATTEMPTS
            let isAttemptsCriterion = $(this).find("th.description-header").text().includes("Attempts");
            //CHECK ALL CRITERIA EXCEPT ATTEMPTS
            if (!isAttemptsCriterion) {
                let ratings = $(this).find("div.rating-tier-list div.rating-tier");
                //IF THE TOP OPTION ISN'T SELECTED, IT'S NOT COMPLETE
                if (!$(ratings[0]).hasClass("selected")) {
                    completed = false;
                }
            }
        });
        if (completed === false) {
          addDot(el, "#FC0");
        }
      }
    }
  });
  */
}