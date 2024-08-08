(async function () {
  await $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/scripts.js");
  await $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/course_review_els.js");

  // jQuery easing functions (if not included already)
  $.easing.easeInOutQuad = function (x, t, b, c, d) {
      if ((t /= d / 2) < 1) return c / 2 * t * t + b;
      return -c / 2 * ((--t) * (t - 2) - 1) + b;
  };

  $.easing.easeOutQuad = function (x, t, b, c, d) {
      return -c * (t /= d) * (t - 2) + b;
  };


  $(".context_module_item").each(function() {
    let el = $(this);
    let infoEl = el.find('div.ig-info')
    infoEl.before(`<span class="ig-btech-evaluation-score" style="font-size: 1rem;"></span>`)
  });


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
    , assignmentCounts;

  async function refreshData() {
    totalContentCount = 0;
    externalContentCounts = 0;
    $(".context_module_item span.ig-btech-evaluation-score").each(function() {
      let el = $(this);
      el.html(`⚪`);
      totalContentCount += 1;
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

    let regex = /^([A-Z]{4} \d{4}).*(\d{4})(?=[A-Z]{2})/;
    let match = courseData.sis_course_id.match(regex);
    if (match) {
      courseCode = match[1];
      year = match[2];
    } else {
      console.log("NO SIS ID FOUND");
      courseCode = '';
      year = '';
    }

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
    pageCounts = {
      includes_outcomes: 0,
      chunked_content: 0,
      career_relevance: 0,
      supporting_media: 0,
      clarity: 0
    }
    assignmentCounts = {
      includes_outcomes: 0,
      chunked_content: 0,
      career_relevance: 0,
      provides_feedback: 0,
      modeling: 0,
      clarity: 0
    };
    quizCounts = {
      clarity: 0,
      includes_outcomes: 0,
      chunked_content: 0,
      career_relevance: 0,
      provides_feedback: 0,
      instructions: 0,
      preparation: 0,
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
      // other scores
      if (page.includes_outcomes !== undefined) pageCounts.includes_outcomes += page.includes_outcomes ? 1 : 0;
      if (page.chunked_content !== undefined) pageCounts.chunked_content += page.chunked_content ? 1 : 0;
      if (page.career_relevance !== undefined) pageCounts.career_relevance += page.career_relevance? 1 : 0;
      if (page.supporting_media!== undefined) pageCounts.supporting_media += page.supporting_media? 1 : 0;
      if (page.clarity !== undefined) pageCounts.clarity += page.clarity;

      let pageScore = calcPageScore(page);
      if (emoji?.[pageScore]) {
        $(`.WikiPage_${page.page_id} span.ig-btech-evaluation-score`).html(emoji?.[pageScore]);
      }
    }

    for (let q in quizReviewsData) {
      let quiz = quizReviewsData[q];

      // blooms
      if (quiz.blooms) {
        if (bloomsCounts?.[quiz.blooms] === undefined) bloomsCounts[quiz.blooms] = 0;
        bloomsCounts[quiz.blooms] += 1;
      }


      // // other scores
      if (quiz.includes_outcomes !== undefined) quizCounts.includes_outcomes += quiz.includes_outcomes ? 1 : 0;
      if (quiz.chunked_content !== undefined) quizCounts.chunked_content += quiz.chunked_content ? 1 : 0;
      if (quiz.career_relevance !== undefined) quizCounts.career_relevance += quiz.career_relevance ? 1 : 0;
      if (quiz.provides_feedback !== undefined) quizCounts.provides_feedback += quiz.provides_feedback ? 1 : 0;
      if (quiz.instructions !== undefined) quizCounts.instructions += quiz.instructions ? 1 : 0;
      if (quiz.preparation !== undefined) quizCounts.preparation += quiz.preparation ? 1 : 0;
      if (quiz.clarity !== undefined) quizCounts.clarity += quiz.clarity;

      let quizScore = calcQuizScore(quiz);

      if (emoji?.[quizScore]) {
        $(`.Quiz_${quiz.quiz_id} span.ig-btech-evaluation-score`).html(emoji?.[quizScore]);
      }
    }

    for (let a in assignmentReviewsData) {
      let assignment = assignmentReviewsData[a];

      // blooms
      if (assignment.blooms) {
        if (bloomsCounts?.[assignment.blooms] === undefined) bloomsCounts[assignment.blooms] = 0;
        bloomsCounts[assignment.blooms] += 1;
      }

      // other scores
      if (assignment.includes_outcomes !== undefined) assignmentCounts.includes_outcomes += assignment.includes_outcomes ? 1 : 0;
      if (assignment.chunked_content !== undefined) assignmentCounts.chunked_content += assignment.chunked_content ? 1 : 0;
      if (assignment.career_relevance !== undefined) assignmentCounts.career_relevance += assignment.career_relevance? 1 : 0;
      if (assignment.provides_feedback !== undefined) assignmentCounts.provides_feedback += assignment.provides_feedback? 1 : 0;
      if (assignment.modeling !== undefined) assignmentCounts.modeling += assignment.modeling ? 1 : 0;
      if (assignment.clarity !== undefined) assignmentCounts.clarity += assignment.clarity;

      let assignmentScore = calcAssignmentScore(assignment);
      if (emoji?.[assignmentScore]) {
        $(`.Assignment_${assignment.assignment_id} span.ig-btech-evaluation-score`).html(emoji?.[assignmentScore]);
      }
    }

    return true;
  }

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
          <div class='btech-modal-content-inner'></div>
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
      , objectivesData
      , objectivesCounts
      , assignmentReviewsData
      , assignmentCounts
      , quizReviewsData
      , quizCounts
      , pageReviewsData
      , pageCounts
      , externalContentCounts
      , totalContentCounts
    );
  });

  function calcCoursePageScore(counts, numReviews) {
    console.log(counts);
    let total = counts.clarity 
      + counts.chunked_content 
      + counts.includes_outcomes 
      + counts.career_relevance 
      + counts.supporting_media
    total /= (numReviews * 6);
    return total;
  }

  function calcCourseQuizScore(counts, numReviews) {
    console.log(counts);
    let total = counts.clarity 
      + counts.chunked_content 
      + counts.includes_outcomes 
      + counts.career_relevance 
      + counts.provides_feedback 
      + counts.instructions 
      + counts.preparation;
    total /= (numReviews * 8);
    return total;
  }

  function calcCourseAssignmentScore(counts, numReviews) {
    console.log(counts);
    let total = counts.clarity 
      + counts.chunked_content 
      + counts.includes_outcomes 
      + counts.career_relevance 
      + counts.provides_feedback 
      + counts.modeling;
    total /= (numReviews * 7);
    return total;
  }

  function calcCourseScore() {
    let score = 0;
    let pageScore = calcCoursePageScore(pageCounts, 1);
    let quizScore = calcCourseQuizScore(quizCounts, 1);
    let assignmentScore = calcCourseAssignmentScore(assignmentCounts, 1);
    let totalItems = quizReviewsData.length + assignmentReviewsData.length + pageReviewsData.length;
    score = (quizScore + assignmentScore + pageScore) / totalItems;
    console.log(score);
    return score; 
  }

  await refreshData();
  $(document).ready(function() {
    let courseScore = calcCourseScore();
    let emoji = calcEmoji(courseScore);
    detailedReportButton.html(emoji);
    addButton(detailedReportButton);
  })
})();