(async function () {
  await Promise.all([
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/scripts.js"),
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/context_menu.js"),
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/components/content_detailed.js"),
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/detailed_report_button.js")
  ]);

  $(document).ready(async function() {
    var courseData, assignmentData, assignmentReviewData, assignmentCriteria, rubricCriteria, rubricReviewData, objectivesData, relatedAssignments, courseCode, year;
    async function refreshData() {
      // course level data
      courseData  = (await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}`))[0];
      let courseCodeYear = getCourseCodeYear(courseData);
      year = courseCodeYear.year;
      courseCode = courseCodeYear.courseCode;

      //New Quizzes
      if (ENV.ASSIGNMENT?.is_quiz_lti_assignment ?? false) {
        assignmentData = (await canvasGet(`/api/quiz/v1/courses/${ENV.COURSE_ID}/quizzes/${ENV.ASSIGNMENT.id}`))[0];
        try {
          assignmentReviewData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/quizzes/${ENV.ASSIGNMENT.id}`);
        } catch (err) {
          console.log(err);
          return false;
        }
        assignmentCriteria = (await getCriteria('Quizzes'))['Quizzes'];
      } 
      // Regular Assignments
      else {
        assignmentData = (await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}/assignments/${ENV.ASSIGNMENT_ID}`))[0];
        assignmentCriteria = (await getCriteria('Assignments'))['Assignments'];
        rubricCriteria = (await getCriteria('Rubrics'))['Rubrics'];
        try {
          assignmentReviewData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/assignments/${ENV.ASSIGNMENT_ID}`);
        } catch (err) {
          console.log(err);
          return false;
        }
        try {
          rubricReviewData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/assignments/${ENV.ASSIGNMENT_ID}/rubric`);
          console.log(rubricReviewData);
        } catch (err) {
          rubricReviewData = undefined;
          console.log(err);
        }
      }

      // objectives
      let objectivesQueryString = '';
      for (let o in assignmentReviewData.objectives) {
        if (o > 0) objectivesQueryString += '&';
        objectivesQueryString += 'objectives[]=' + assignmentReviewData.objectives[o];
      }

      try {
        objectivesData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${courseCode}/year/${year}/objectives`);
      } catch (err) {
        objectivesData = [];
        console.log(err);
      }

      return true;
    }

    

    await refreshData();
   // Function to create and position the custom context menu
   // Function to create and position the custom context menu

    if (assignmentReviewData?.assignment_id == undefined) return;
    let $modal = initModal();
    let $vueApp = generateDetailedContent('Assignments', assignmentReviewData, rubricReviewData, assignmentCriteria, rubricCriteria, objectivesData);
    let $detailedReportButton = addDetailedReportButton($vueApp);
    addContextMenu($detailedReportButton, [
      { id: 'reevaluate', text: 'Reevaluate', func: async function () {
        let reviewData = assignmentReviewData;
        let criteria = assignmentCriteria;
        $detailedReportButton.html('')
        let assignmentId = assignmentData.id;
        if (ENV.ASSIGNMENT?.is_quiz_lti_assignment ?? false) {
          let description = assignmentData.instructions;
          await evaluateNewQuiz(ENV.COURSE_ID, courseCode, year, assignmentId, description);
        } else {
          let description = assignmentData.description;
          let rubric = JSON.stringify(assignmentData.rubric);
          await evaluateAssignment(ENV.COURSE_ID, courseCode, year, assignmentId, description, rubric);
        }
        await refreshData();
        setButtonHTML($detailedReportButton, reviewData, criteria, rubricReviewData, rubricCriteria);
      }},
      { id: 'disable', text: 'Toggle Ignore', func: async function () {
      }},
      // { id: 'clearReview', text: 'Clear Review', func: () => {}}
    ]);

    function setButtonHTML($button, data, criteria, rubricData = null, rubricCriteria = null) {
      let score = calcCriteriaAverageScore(data, criteria);
      if (rubricData === null) {
        $detailedReportButton.html(`<div class="btech-course-reviewer-score" style="position: absolute;">${emoji?.[score]}</div>`);
      } else {
        let rubricScore = calcCriteriaAverageScore(rubricData, rubricCriteria);
        $button.html(`<div class="btech-course-reviewer-score-left" style="position: absolute; clip-path: inset(0 50% 0 0);">${emoji?.[score]}</div><div class="btech-course-reviewer-score-right" style="clip-path: inset(0 0 0 50%);">⚪</div>`);
        $(`.btech-course-reviewer-score-right`).html(
            `${emoji?.[rubricScore]}`
        );
      }
    }

    let reviewData = assignmentReviewData;
    let criteria = assignmentCriteria;
    if (reviewData.ignore) $detailedReportButton.html('🚫');
    else {
      setButtonHTML($detailedReportButton, reviewData, criteria, rubricReviewData, rubricCriteria);
    }
  });
})();