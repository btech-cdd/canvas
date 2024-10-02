/*
// this should be enough to pull all questions that could possibly appear in the quiz.
// need to probably weight it by the number of questions pulled from each group
//// somehow randomly select some of the questions if it's over x ammount, e.g. pull up to 2x the number of items pulled into the quiz itself.
// then need to pull questions that aren't in a bank separately
*/
(async function () {
  await Promise.all([
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/scripts.js"),
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/context_menu.js"),
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/components/content_detailed.js"),
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/detailed_report_button.js")
  ]);

  var courseData, quizReviewData = {}, quizCriteria = {}, quizData = {}, objectivesData, courseCode, year;
  $(document).ready(async function() {

    async function refreshData() {
      let criteriaData = (await bridgetools.req(`https://reports.bridgetools.dev/api/reviews/criteria/type/Quizzes`));
      quizCriteria = {};
      for (let c in criteriaData) {
        let criterion = criteriaData[c];
        let name = criterionNameToVariable(criterion.name);
        quizCriteria[name] = criterion;
      }

      courseData  = (await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}`))[0];
      quizData = (await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}/quizzes/${ENV.QUIZ.id}`))[0];
      let courseCodeYear = getCourseCodeYear(courseData);
      year = courseCodeYear.year;
      courseCode = courseCodeYear.courseCode;
      try {
        quizReviewData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/quizzes/${ENV.QUIZ.id}`);
      } catch (err) {
        console.log(err);
        return false;
      }

      let objectivesQueryString = '';
      for (let o in quizReviewData.objectives) {
        if (o > 0) objectivesQueryString += '&';
        objectivesQueryString += 'objectives[]=' + quizReviewData.objectives[o];
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

    if (quizReviewData?.quiz_id == undefined) return;
    let $detailedReportButton = addDetailedReportButton()
    generateDetailedContent('Quizzes', quizReviewData, null, quizCriteria, null, objectivesData);

    addContextMenu($detailedReportButton, [
      { id: 'reevaluate', text: 'Reevaluate', func: async function () {
        await evaluateQuiz(ENV.COURSE_ID, courseCode, year, quizData.id, quizData.description)
        await refreshData();
      }},
      { id: 'disable', text: 'Toggle Ignore', func: async function () {
        ignoreItem(ENV.COURSE_ID, 'quizzes', quizData.id, !quizData.ignore);
      }},
      // { id: 'clearReview', text: 'Clear Review', func: () => {}}
    ]);


    let data = quizReviewData;
    let averageScore = calcCriteriaAverageScore(data, quizCriteria);
    // let averageRubricScore = calcCriteriaAverageScore(rubricReviewData, rubricCriteria);
    if (data.ignore) $detailedReportButton.html('🚫');
    else {
      if (false) { // check if it needs a rubric
        $detailedReportButton.html(`<div class="btech-course-reviewer-quiz-score-left" style="position: absolute; clip-path: inset(0 50% 0 0);">${emoji?.[averageScore]}</div><div class="btech-course-reviewer-quiz-score-right" style="clip-path: inset(0 0 0 50%);">⚪</div>`);
        $(`.btech-course-reviewer-quiz-score-right`).html(
            `${emoji?.[averageRubricScore]}`
        );
      } else {
        $detailedReportButton.html(emoji?.[averageScore]);
      }
    }
  });
})();