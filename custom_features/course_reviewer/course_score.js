(async function () {
  await Promise.all([
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/scripts.js"),
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/components/course_content.js"),
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/course_score_els.js"),
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/course_scripts.js"),
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/context_menu.js"),
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/detailed_report_button.js")
  ]);




  // insert empty icons for unscored items
  $(".context_module_item").each(function() {
    let el = $(this);
    let infoEl = el.find('div.ig-info')
    infoEl.before(`<span class="ig-btech-evaluation-score" style="font-size: 1rem;"></span>`)
  });

  // init vars
  var 
    courseData
    , externalContentCounts
    , contentCount
    , assignmentsData
    , assignmentReviewsData
    , assignmentCriteria
    , pageReviewsData
    , pageCriteria
    , quizReviewsData
    , quizCriteria
    , courseReviewData
    , rubricReviewsData
    , rubricCriteria
    , objectivesData
    , courseCode
    , year
    , bloomsCounts
    , topicTagsCounts
    , objectivesCounts
    , totalContentCounts
    , runningReviewer
    ;
    runningReviewer = false;

  async function refreshData() {
    totalContentCounts = 0;
    externalContentCounts = 0;
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
      contentCount -= 1;
    });
    // get course level data
    courseData  = (await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}`))[0];
    courseReviewData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}`);

    let courseCodeYear = getCourseCodeYear(courseData);
    year = courseCodeYear.year;
    courseCode = courseCodeYear.courseCode;

    // get quiz data
    try {
      quizReviewsData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/quizzes`);
      quizCriteria = await getCriteria('Quizzes');
    } catch (err) {
      console.error(err);
    }

    // get assignment data
    try {
      assignmentReviewsData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/assignments`);
      assignmentsData = await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}/assignments`);
      assignmentCriteria = await getCriteria('Assignments');
      for (let a in assignmentsData) {
        let assignment = assignmentsData[a];
        if (assignment.submission_types.includes('external_tool') && !assignment.is_quiz_assignment) {
          $(`.Assignment_${assignment.id} span.ig-btech-evaluation-score`).html('🚫');
        }
      }
    } catch (err) {
      console.error(err);
    }

    try {
      rubricReviewsData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/rubrics`);
      rubricCriteria = await getCriteria('Rubrics');
    } catch (err) {
      console.error(err);
    }

    $("span.ig-btech-evaluation-score").each(function() {
      let el = $(this);
      if (el.html() == `🚫`) externalContentCounts += 1;
    });

    // get page data
    try {
      pageReviewsData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/pages`);
      pageCriteria = await getCriteria('Pages');
    } catch (err) {
      console.error(err);
    }

    try {
      objectivesData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${courseCode}/year/${year}/objectives`);
    } catch (err) {
      objectivesData = [];
      console.error(err);
    }

    bloomsCounts = {};
    topicTagsCounts = {};
    objectivesCounts = {};
    
    quizQuestionCounts = {
      promptQuality: 0,
      prompt_clarity: 0,
      prompt_positive: 0,
      prompt_complete_sentence: 0,
      options_quality: 0,
      options_clarity: 0,
      options_length: 0,
      options_sentence_completion: 0,
      options_incorrect_answer_quality: 0,
      options_concise: 0,
    };

    objectivesCounts = {};
    // objectivesCounts =  addObjectives(objectivesCounts, pageReviewsData);
    objectivesCounts =  addObjectives(objectivesCounts, assignmentReviewsData);
    objectivesCounts =  addObjectives(objectivesCounts, quizReviewsData);

    topicTagsCounts = {};
    topicTagsCounts =  addTopics(topicTagsCounts, pageReviewsData);
    topicTagsCounts =  addTopics(topicTagsCounts, assignmentReviewsData);
    topicTagsCounts =  addTopics(topicTagsCounts, quizReviewsData);

    for (let o in pageReviewsData) {
      let page = pageReviewsData[o];
      pageReviewsData[o].name = $(`.WikiPage_${page.page_id} span.item_name a.title`).text().trim();

      let pageScore = calcCriteriaAverageScore(page, pageCriteria);
      if (page.ignore) {
        $(`.WikiPage_${page.page_id} span.ig-btech-evaluation-score`).html('🚫');
      } else if (emoji?.[pageScore]) {
        $(`.WikiPage_${page.page_id} span.ig-btech-evaluation-score`).html(emoji?.[pageScore]);
      }
    }

    for (let q in quizReviewsData) {
      let quiz = quizReviewsData[q];
      quizReviewsData[q].name = $(`.Quiz_${quiz.quiz_id} span.item_name a.title`).text().trim();

      // blooms
      if (quiz.blooms) {
        if (bloomsCounts?.[quiz.blooms] === undefined) bloomsCounts[quiz.blooms] = 0;
        bloomsCounts[quiz.blooms] += 1;
      }

      let quizScore = calcCriteriaAverageScore(quiz, quizCriteria);

      if (quiz.ignore) {
        $(`.Quiz_${quiz.quiz_id} span.ig-btech-evaluation-score`).html('🚫');
      } else
      if (emoji?.[quizScore]) {
        $(`.Quiz_${quiz.quiz_id} span.ig-btech-evaluation-score`).html(emoji?.[quizScore]);
      }
    }

    assignmentCounts = calcCourseAssignmentCounts(assignmentReviewsData);
    for (let a in assignmentReviewsData) {
      let assignment = assignmentReviewsData[a];
      assignmentReviewsData[a].name = $(`.Assignment_${assignment.assignment_id} span.item_name a.title`).text().trim();

      // blooms
      if (assignment.blooms) {
        if (bloomsCounts?.[assignment.blooms] === undefined) bloomsCounts[assignment.blooms] = 0;
        bloomsCounts[assignment.blooms] += 1;
      }

      let assignmentScore = calcCriteriaAverageScore(assignment, assignmentCriteria);
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

    rubricCounts = calcCourseRubricCounts(rubricReviewsData);
    for (let r in rubricReviewsData) {
      let rubric = rubricReviewsData[r];
      let rubricScore = calcCriteriaAverageScore(rubric, rubricCriteria);
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

    return true;
  }


  

  await refreshData();
  $(document).ready(async function() {
   // Function to create and position the custom context menu
   // Function to create and position the custom context menu

    let $detailedReportButton = addDetailedReportButton(function ($modalContent) {
        generateDetailedContent(
          $modalContent
          , courseReviewData
          , courseCode
          , year
          , objectivesData
          , objectivesCounts
          , assignmentReviewsData
          , assignmentCriteria
          , rubricReviewsData
          , rubricCriteria
          , quizReviewsData
          , quizCriteria
          , pageReviewsData
          , pageCriteria
          , externalContentCounts
          , totalContentCounts
          , bloomsCounts
        );
      }
    );
    addContextMenu($detailedReportButton, [
        { id: 'reevaluate', text: 'Reevaluate All', func: async function () {
          updateReviewProgress({processed: 0, remaining: 1});
          await bridgetools.req(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/evaluate_content`, {course_code: courseCode, year: year}, 'POST');
          checkReviewProgress(
            pageReviewsData, pageCriteria,
            quizReviewsData, quizCriteria,
            assignmentReviewsData, assignmentCriteria,
            rubricReviewsData, rubricCriteria
          );
        }},
        { id: 'refreshScore', text: 'Refresh Score', func: async function () {
          $detailedReportButton.html('');
          await refreshData();
          let courseScore = calcCourseScore(
            pageReviewsData, pageCriteria,
            quizReviewsData, quizCriteria,
            assignmentReviewsData, assignmentCriteria,
            rubricReviewsData, rubricCriteria
          );
          let emoji = calcEmoji(courseScore);
          $detailedReportButton.html(emoji);
        }},
        // { id: 'clearReview', text: 'Clear Review', func: () => {}}
      ]);
    let courseScore = calcCourseScore(
      pageReviewsData, pageCriteria,
      quizReviewsData, quizCriteria,
      assignmentReviewsData, assignmentCriteria,
      rubricReviewsData, rubricCriteria
    );
    let emoji = calcEmoji(courseScore);
    $detailedReportButton.append(emoji);
    initReviewProgressInterval(
      pageReviewsData, pageCriteria,
      quizReviewsData, quizCriteria,
      assignmentReviewsData, assignmentCriteria,
      rubricReviewsData, rubricCriteria
    );

  })
})();