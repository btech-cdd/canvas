(async function () {
  await $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/scripts.js");
  await $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/components/course_content.js");
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

  // add button
  let $detailedReportButton = $('<div></div>').attr('id', 'btech-detailed-evaluation-button');
  function addButton($detailedReportButton) {
    // Create the icon element

    // Apply inline styles
    $detailedReportButton.css({
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
    $('body').append($detailedReportButton);

    // Smooth bounce animation using jQuery
    $detailedReportButton.animate({bottom: '50px'}, 200, 'easeInOutQuad', function() {
        $detailedReportButton.animate({bottom: '15px'}, 220, 'easeInOutQuad', function() {
            $detailedReportButton.animate({bottom: '40px'}, 180, 'easeInOutQuad', function() {
                $detailedReportButton.animate({bottom: '20px'}, 200, 'easeInOutQuad', function() {    
                    $detailedReportButton.animate({bottom: '25px'}, 100, 'easeInOutQuad', function() {
                    });
                });
            });
        });
    });

    // Ensure the icon stays in the bottom right corner on scroll
    $(window).scroll(function() {
        $detailedReportButton.css({
            'bottom': '25px',
            'right': '20px'
        });
    });

  }

  $detailedReportButton.click(async function () {
    $("body").append(`
      <div class='btech-modal' style='display: inline-block;'>
        <!-- ERASE THE DISPLAY PIECE BEFORE GOING LIVE -->
        <div id="btech-course-reviewer-detailed-report" class='btech-modal-content' style='max-width: 800px; border-radius: 0.25rem; background-color: #EEE;'>
        </div>
      </div>
    `);
    let modal = $('body .btech-modal');
    modal.on("click", function(event) {
      if ($(event.target).is(modal)) {
          modal.remove();
      }
    });

    let modalContent = $('body #btech-course-reviewer-detailed-report');
    generateDetailedContent(
      modalContent
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
  });

  

  await refreshData();
  $(document).ready(async function() {
   // Function to create and position the custom context menu
    function createCustomMenu(x, y) {
      // Remove any existing custom menu
      $('#customMenu').remove();

      // Create a new context menu element
      const $customMenu = $('<ul>', {
        id: 'customMenu',
        css: {
          position: 'absolute',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          width: '150px',
          listStyle: 'none',
          padding: '0',
          margin: '0'
        }
      });

      // Add custom menu options
      const menuItems = [
        { id: 'rerunReport', text: 'Rerun Report' },
        { id: 'disableItem', text: 'Disable Item' },
        { id: 'clearReview', text: 'Clear Review' }
      ];

      // Append each menu item to the custom menu
      menuItems.forEach(item => {
        $('<li>', {
          id: item.id,
          text: item.text,
          css: {
            padding: '10px',
            cursor: 'pointer'
          },
          hover: function() {
            $(this).css('background-color', '#f0f0f0');
          },
          mouseout: function() {
            $(this).css('background-color', 'white');
          },
          click: function() {
            alert(item.text + ' clicked!');
            $customMenu.remove(); // Hide menu after clicking an option
          }
        }).appendTo($customMenu);
      });

      // Append the custom menu to the body
      $('body').append($customMenu);

      // Get the menu dimensions after it's added to the DOM
      const menuWidth = $customMenu.outerWidth();
      const menuHeight = $customMenu.outerHeight();

      // Get the viewport (window) dimensions
      const windowWidth = $(window).width();
      const windowHeight = $(window).height();

      // Calculate new position to prevent overflow
      let posX = x;
      let posY = y;

      // Check if the menu goes beyond the right edge of the viewport
      if (x + menuWidth > windowWidth) {
        posX = windowWidth - menuWidth - 10; // Adjust X to keep it inside
      }

      // Check if the menu goes beyond the bottom edge of the viewport
      if (y + menuHeight > windowHeight) {
        posY = windowHeight - menuHeight - 10; // Adjust Y to keep it inside
      }

      // Apply the final position
      $customMenu.css({
        top: posY + 'px',
        left: posX + 'px'
      });
  } 

    addButton($detailedReportButton);
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

    // Disable default context menu and show custom menu on right-click
    $detailedReportButton.on('contextmenu', function(e) {
      e.preventDefault();
      
      // Dynamically create and show the custom menu
      createCustomMenu(e.pageX, e.pageY);
    });

    // Hide the menu if clicking outside or pressing Esc
    $(document).on('click', function() {
      $('#customMenu').remove(); // Remove the custom menu if clicked elsewhere
    });
  })
})();