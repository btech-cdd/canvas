(async function () {
  await Promise.all([
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/scripts.js"),
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/components/course_content.js"),
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/components/surveys.js"),
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/course_score_els.js"),
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/course_scripts.js"),
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/context_menu.js"),
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/detailed_report_button.js")
  ]);




  // insert empty icons for unscored items
  $(".context_module_item").each(function() {
    let el = $(this);
    let infoEl = el.find('div.ig-info')
    infoEl.before(`<span class="ig-btech-evaluation-score" style="font-size: 1rem; cursor: pointer; user-select: none;"></span>`)
  });

  // init vars
  var 
    courseData
    , externalContentCounts
    , assignmentsData
    , courseReviewData
    , criteria
    , objectivesData
    , courseCode
    , year
    , bloomsCounts
    , topicTagsCounts
    , objectivesCounts
    , totalContentCounts
    , runningReviewer
    , surveys
    ;
    runningReviewer = false;

  async function initIcons() {
    totalContentCounts = 0;
    $(".context_module_item span.ig-btech-evaluation-score").each(function() {
      let el = $(this);
      el.html(`⚪`);
      totalContentCounts += 1;
    });
    $(".context_module_item.attachment span.ig-btech-evaluation-score").each(function() {
      let el = $(this);
      el.html(`🚫`);
    });
    $(".context_module_item.external_url span.ig-btech-evaluation-score").each(function() {
      let el = $(this);
      el.html(`🚫`);
    });
    $(".context_module_item.context_external_tool span.ig-btech-evaluation-score").each(function() {
      let el = $(this);
      el.html(`🚫`);
    });
    $(".context_module_item.context_module_sub_header span.ig-btech-evaluation-score").each(function() {
      let el = $(this);
      el.html(``);
      totalContentCount -= 1;
    });

    await calcExternalContentCount();
  }

  async function calcExternalContentCount() {
    try {
      assignmentsData = await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}/assignments`);
      for (let a in assignmentsData) {
        let assignment = assignmentsData[a];
        if (assignment.submission_types.includes('external_tool') && !assignment.is_quiz_assignment) {
          $(`.Assignment_${assignment.id} span.ig-btech-evaluation-score`).html('🚫');
        }
      }
    } catch (err) {
      console.error(err);
    }

    let externalContentCount = 0;
    $("span.ig-btech-evaluation-score").each(function() {
      let el = $(this);
      if (el.html() == `🚫`) externalContentCount += 1;
    });
    return externalContentCount;
  }

  function calcBloomsCounts(quizReviews, assignmentReviews) {
    let bloomsCounts = {};
    for (let q in quizReviews) {
      let quiz = quizReviews[q];
      // blooms
      if (quiz.blooms) {
        if (bloomsCounts?.[quiz.blooms] === undefined) bloomsCounts[quiz.blooms] = 0;
        bloomsCounts[quiz.blooms] += 1;
      }
    }

    for (let a in assignmentReviews) {
      let assignment = assignmentReviews[a];
      // blooms
      if (assignment.blooms) {
        if (bloomsCounts?.[assignment.blooms] === undefined) bloomsCounts[assignment.blooms] = 0;
        bloomsCounts[assignment.blooms] += 1;
      }
    }
    return bloomsCounts;
  }

  function calcObjectivesCounts(quizReviews, assignmentReviews) {
    let objectivesCounts = {};
    objectivesCounts =  addObjectives(objectivesCounts, quizReviews);
    objectivesCounts =  addObjectives(objectivesCounts, assignmentReviews);

    return objectivesCounts;
  }

  function setIcon() {

  }

  async function refreshIcons($vueApp, $modal) {
    // get assignment data to locate external assignments

    for (let m in courseReviewData.modules) {
      let moduleData = courseReviewData.modules[m];
      let moduleEl = $(`#${moduleData.module_id}`);
      let moduleScore = calcCriteriaAverageScore(moduleData, criteria.Modules);
      moduleEl.find('span.name').prepend(emoji?.[moduleScore])
    }

    for (let p in courseReviewData.pages) {
      let page = courseReviewData.pages[p];
      page.name = $(`.WikiPage_${page.page_id} span.item_name a.title`).text().trim();

      let pageScore = calcCriteriaAverageScore(page, criteria.Pages);
      let scoreEl = $(`.WikiPage_${page.page_id} span.ig-btech-evaluation-score`);
      if (page.ignore) {
        scoreEl.html('🚫');
      } else if (emoji?.[pageScore]) {
        scoreEl.html(emoji?.[pageScore]);
        scoreEl.click(function () {
          console.log($vueApp);
          $vueApp.individualContent = {
            type: 'Page',
            contentData: page,
            contentCriteria: criteria.Pages,
            rubricData: null,
            rubricCriteria: null
          }
          $vueApp.menuCurrent = 'individual';
          $modal.show();

        });
      }
    }

    for (let q in courseReviewData.quizzes) {
      let quiz = courseReviewData.quizzes[q];
      quiz.name = $(`.Quiz_${quiz.quiz_id} span.item_name a.title`).text().trim();

      let quizScore = calcCriteriaAverageScore(quiz, criteria.Quizzes);

      if (quiz.ignore) {
        $(`.Quiz_${quiz.quiz_id} span.ig-btech-evaluation-score`).html('🚫');
      } else
      if (emoji?.[quizScore]) {
        $(`.Quiz_${quiz.quiz_id} span.ig-btech-evaluation-score`).html(emoji?.[quizScore]);
      }
    }

    for (let a in courseReviewData.assignments) {
      let assignment = courseReviewData.assignments[a];
      assignment.name = $(`.Assignment_${assignment.assignment_id} span.item_name a.title`).text().trim();

      let assignmentScore = calcCriteriaAverageScore(assignment, criteria.Assignments);
      if (assignment.ignore) {
        $(`.Assignment_${assignment.assignment_id} span.ig-btech-evaluation-score`).html('🚫');
      } else if (emoji?.[assignmentScore]) {
        if (assignment.quiz_id) {
          $(`.Assignment_${assignment.quiz_id} span.ig-btech-evaluation-score`).html(
            `<div class="btech-course-reviewer-assignment-score-left" style="position: absolute; clip-path: inset(0 50% 0 0);">${emoji?.[assignmentScore]}</div><div class="btech-course-reviewer-assignment-score-right" style="clip-path: inset(0 0 0 50%);">⚪</div>`
          );
        }
        if (assignment.assignment_id) {
          $(`.Assignment_${assignment.assignment_id} span.ig-btech-evaluation-score`).html(
            `<div class="btech-course-reviewer-assignment-score-left" style="position: absolute; clip-path: inset(0 50% 0 0);">${emoji?.[assignmentScore]}</div><div class="btech-course-reviewer-assignment-score-right" style="clip-path: inset(0 0 0 50%);">⚪</div>`
          );
        }
      }
    }

    for (let r in courseReviewData.rubrics) {
      let rubric = courseReviewData.rubrics[r];
      let rubricScore = calcCriteriaAverageScore(rubric, criteria.Rubrics);
      let hasRubric = false;
      for (let a in assignmentsData) {
        let assignment = assignmentsData[a];
        if (assignment.id == rubric.assignment_id) {
          if (assignment.rubric) hasRubric = true;
        }
      }
        
      if (hasRubric) {
        $(`.Assignment_${rubric.assignment_id} span.ig-btech-evaluation-score .btech-course-reviewer-assignment-score-right`).html(
            `${emoji?.[rubricScore]}`
        );
      }
    }
  }
  
  async function refreshData() {
    // get course level data
    courseData = {};
    courseReviewData = {};
    objectivesData = [];
    criteria = {};
    surveys = {};
    year = null;
    courseCode = '';
    topicTagsCounts = {};

    courseData  = (await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}`))[0];
    courseReviewData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}`);
    criteria = await getCriteria();
    surveys = await bridgetoolsReq('https://surveys.bridgetools.dev/api/survey_data', {
        course_id: this.courseId
    }, 'POST');

    let courseCodeYear = getCourseCodeYear(courseData);
    year = courseCodeYear.year;
    courseCode = courseCodeYear.courseCode;



    try {
      objectivesData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${courseCode}/year/${year}/objectives`);
    } catch (err) {
      console.error(err);
    }

    objectivesCounts = calcObjectivesCounts(courseReviewData.quizzes, courseReviewData.assignments);
    bloomsCounts = calcBloomsCounts(courseReviewData.quizzes, courseReviewData.assignments);
    // objectivesCounts =  addObjectives(objectivesCounts, courseReviewData.pages);

    return true;
  }


  $(document).ready(async function() {
    await initIcons();
    let $modal = initModal();
    await refreshData();
    let $vueApp = generateDetailedCourseContent(
      courseReviewData
      , courseCode
      , year
      , criteria
      , objectivesData
      , objectivesCounts
      , externalContentCounts
      , totalContentCounts
      , bloomsCounts
      , surveys
    );
    await refreshIcons($vueApp, $modal);
    // button creates container, must run button first
    let $detailedReportButton = addDetailedReportButton();
    addContextMenu($detailedReportButton, [
        { id: 'reevaluate', text: 'Reevaluate All', func: async function () {
          updateReviewProgress({processed: 0, remaining: 1});
          await bridgetools.req(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/evaluate_content`, {course_code: courseCode, year: year}, 'POST');
          checkReviewProgress(
            courseReviewData, criteria
          );
        }},
        { id: 'refreshScore', text: 'Refresh Score', func: async function () {
          $detailedReportButton.html('');
          await refreshData();
          let courseScore = calcCourseScore(
            courseReviewData, criteria
          );
          let emoji = calcEmoji(courseScore);
          $detailedReportButton.html(emoji);
        }},
        // { id: 'clearReview', text: 'Clear Review', func: () => {}}
      ]);
    let courseScore = calcCourseScore(
      courseReviewData, criteria
    );
    let emoji = calcEmoji(courseScore);
    $detailedReportButton.append(emoji);
    initReviewProgressInterval(
      courseReviewData, criteria
    );

  })
})();