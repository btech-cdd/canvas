(async function () {
  await $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/scripts.js");
  await $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/course_score_els.js");
  await $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/course_scripts.js");

  // jQuery easing functions (if not included already)
  $.easing.easeInOutQuad = function (x, t, b, c, d) {
      if ((t /= d / 2) < 1) return c / 2 * t * t + b;
      return -c / 2 * ((--t) * (t - 2) - 1) + b;
  };

  $.easing.easeOutQuad = function (x, t, b, c, d) {
      return -c * (t /= d) * (t - 2) + b;
  };


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
    , pageReviewsData
    , quizReviewsData
    , courseReviewData
    , rubricReviewsData
    , objectivesData
    , courseCode
    , year
    , bloomsCounts
    , topicTagsCounts
    , objectivesCounts
    , assignmentCounts
    , quizCounts
    , quizQuestionCounts
    , pageCounts
    , rubricCounts
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
    } catch (err) {
      console.log(err);
    }

    // get assignment data
    try {
      assignmentReviewsData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/assignments`);
      assignmentsData = await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}/assignments`);
      for (let a in assignmentsData) {
        let assignment = assignmentsData[a];
        if (assignment.submission_types.includes('external_tool')) {
          $(`.Assignment_${assignment.id} span.ig-btech-evaluation-score`).html('🚫');
        }
      }
    } catch (err) {
      console.log(err);
    }

    try {
      rubricReviewsData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/rubrics`);
    } catch (err) {
      console.log(err);
    }

    $("span.ig-btech-evaluation-score").each(function() {
      let el = $(this);
      if (el.html() == `🚫`) externalContentCounts += 1;
    });

    // get page data
    try {
      pageReviewsData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/pages`);
    } catch (err) {
      console.log(err);
    }

    try {
      objectivesData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${courseCode}/year/${year}/objectives`);
    } catch (err) {
      objectivesData = [];
      console.log(err);
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

    pageCounts = calcCoursePageCounts(pageReviewsData);
    for (let o in pageReviewsData) {
      let page = pageReviewsData[o];
      pageReviewsData[o].name = $(`.WikiPage_${page.page_id} span.item_name a.title`).text();
      console.log(pageReviewsData[o].name);

      let pageScore = calcPageScore(page);
      if (page.ignore) {
        $(`.WikiPage_${page.page_id} span.ig-btech-evaluation-score`).html('🚫');
      } else if (emoji?.[pageScore]) {
        $(`.WikiPage_${page.page_id} span.ig-btech-evaluation-score`).html(emoji?.[pageScore]);
      }
    }

    quizCounts = calcCourseQuizCounts(quizReviewsData);
    for (let q in quizReviewsData) {
      let quiz = quizReviewsData[q];

      // blooms
      if (quiz.blooms) {
        if (bloomsCounts?.[quiz.blooms] === undefined) bloomsCounts[quiz.blooms] = 0;
        bloomsCounts[quiz.blooms] += 1;
      }

      let quizScore = calcQuizScore(quiz);

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

      // blooms
      if (assignment.blooms) {
        if (bloomsCounts?.[assignment.blooms] === undefined) bloomsCounts[assignment.blooms] = 0;
        bloomsCounts[assignment.blooms] += 1;
      }

      let assignmentScore = calcAssignmentScore(assignment);
      if (assignment.ignore) {
        $(`.Assignment_${assignment.assignment_id} span.ig-btech-evaluation-score`).html('🚫');
      } else if (emoji?.[assignmentScore]) {
        $(`.Assignment_${assignment.assignment_id} span.ig-btech-evaluation-score`).html(
          `<div class="btech-course-reviewer-assignment-score-left" style="position: absolute; clip-path: inset(0 50% 0 0);">${emoji?.[assignmentScore]}</div><div class="btech-course-reviewer-assignment-score-right" style="clip-path: inset(0 0 0 50%);">⚪</div>`
        );
      }
    }

    rubricCounts = calcCourseRubricCounts(rubricReviewsData);
    for (let r in rubricReviewsData) {
      let rubric = rubricReviewsData[r];
      let rubricScore = calcRubricScore(rubric);
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

  // add button
  let detailedReportButton = $('<div></div>').attr('id', 'btech-detailed-evaluation-button');
  function addButton(detailedReportButton) {
    // Create the icon element

    // Apply inline styles
    detailedReportButton.css({
      'position': 'fixed',
      'cursor': 'pointer',
      'bottom': '25px',
      'right': '20px',
      'width': '2.75rem',
      'height': '2.75rem',
      'padding': '0.25rem',
      'font-size': '2rem',
      'text-align': 'center',
      'background-color': '#E8E8E8',
      'border': '1px solid #888',
      'border-radius': '50%',
      'z-index': '1000', // Ensure it is above other elements
    });

    // Append the icon to the body
    $('body').append(detailedReportButton);

    // Smooth bounce animation using jQuery
    detailedReportButton.animate({bottom: '50px'}, 200, 'easeInOutQuad', function() {
        detailedReportButton.animate({bottom: '15px'}, 220, 'easeInOutQuad', function() {
            detailedReportButton.animate({bottom: '40px'}, 180, 'easeInOutQuad', function() {
                detailedReportButton.animate({bottom: '20px'}, 200, 'easeInOutQuad', function() {    
                    detailedReportButton.animate({bottom: '25px'}, 100, 'easeInOutQuad', function() {
                    });
                });
            });
        });
    });

    // Ensure the icon stays in the bottom right corner on scroll
    $(window).scroll(function() {
        detailedReportButton.css({
            'bottom': '25px',
            'right': '20px'
        });
    });

  }

  detailedReportButton.click(async function () {
    $("body").append(`
      <div class='btech-modal' style='display: inline-block;'>
        <!-- ERASE THE DISPLAY PIECE BEFORE GOING LIVE -->
        <div class='btech-modal-content' style='max-width: 800px;'>
          <div id="btech-course-reviewer-detailed-report" class='btech-modal-content-inner'></div>
        </div>
      </div>
    `);
    let modal = $('body .btech-modal');
    modal.on("click", function(event) {
      if ($(event.target).is(modal)) {
          modal.remove();
      }
    });
    let modalContent = $('body .btech-modal-content-inner');
    generateDetailedContent(
      modalContent
      , courseReviewData
      , courseCode
      , year
      , objectivesData
      , objectivesCounts
      , assignmentReviewsData
      , assignmentCounts
      , rubricReviewsData
      , rubricCounts
      , quizReviewsData
      , quizCounts
      , quizQuestionCounts
      , pageReviewsData
      , pageCounts
      , externalContentCounts
      , totalContentCounts
      , bloomsCounts
    );
  });

  

  await refreshData();
  $(document).ready(async function() {
    let progressCounts = await checkReviewProgress(pageCounts, quizCounts, assignmentCounts, rubricCounts);
    addButton(detailedReportButton);
    if (progressCounts.remaining == 0) {
      let courseScore = calcCourseScore(pageCounts, quizCounts, assignmentCounts, rubricCounts);
      let emoji = calcEmoji(courseScore);
      detailedReportButton.html(emoji);
    } else {
      updateReviewProgress(progressCounts);
    }
    initReviewProgressInterval(pageCounts, quizCounts, assignmentCounts, rubricCounts);
  })
})();