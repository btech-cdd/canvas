(async function () {
  await $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/scripts.js");

  var courseData, assignmentData, assignmentReviewData, assignmentCriteria, rubricCriteria, rubricReviewData, objectivesData, relatedAssignments, courseCode, year;
  async function refreshData() {
    courseData  = (await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}`))[0];
    let courseCodeYear = getCourseCodeYear(courseData);
    year = courseCodeYear.year;
    courseCode = courseCodeYear.courseCode;

    //New Quizzes
    if (ENV.ASSIGNMENT.is_quiz_lti_assignment) {
      assignmentData = (await canvasGet(`/api/quiz/v1/courses/${ENV.COURSE_ID}/quizzes/${ENV.ASSIGNMENT.id}`))[0];
      console.log(assignmentData);
      try {
        assignmentReviewData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/quizzes/${ENV.ASSIGNMENT.id}`);
        console.log(assignmentReviewData);
      } catch (err) {
        console.log(err);
        return false;
      }
      assignmentCriteria = await getCriteria('Quizzes');
    } 
    // Regular Assignments
    else {
      assignmentData = (await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}/assignments/${ENV.ASSIGNMENT.id}`))[0];
      assignmentCriteria = await getCriteria('Assignments');
      rubricCriteria = await getCriteria('Rubrics');
      try {
        assignmentReviewData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/assignments/${ENV.ASSIGNMENT.id}`);
      } catch (err) {
        console.log(err);
        return false;
      }
      try {
        rubricReviewData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/assignments/${ENV.ASSIGNMENT_ID}/rubric`);
      } catch (err) {
        rubricReviewData = undefined;
        console.log(err);
      }
    }




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

  //reevaluate button
  let evaluateButton = $(`
    <a class="btn" id="btech-evaluate-button" rel="nofollow" >
      Run Evaluator 
    </a>
  `);
  //button is added after data refresh
  evaluateButton.click(async function() {
    detailedReportButton.hide();
    evaluateButton.hide();
    container.html('evaluating...');

    let assignmentId = assignmentData.id;
    if (ENV.ASSIGNMENT.is_quiz_lti_assignment) {
      let description = assignmentData.instructions;
      await evaluateNewQuiz(ENV.COURSE_ID, courseCode, year, assignmentId, description);
    } else {
      let description = assignmentData.description;
      let rubric = JSON.stringify(assignmentData.rubric);
      await evaluateAssignment(ENV.COURSE_ID, courseCode, year, assignmentId, description, rubric);
    }
    if (await refreshData()) await generateContent(container);

    detailedReportButton.show();
    evaluateButton.show();
  });

  let detailedReportButton = $(`
    <a class="btn" id="btech-detailed-evaluation-button" rel="nofollow" >
      Detailed Report 
    </a>
  `);
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
    generateDetailedContent(modalContent);
  });

  // container for the evaluation itself
  let container = $('<div id="btech-course-reviewer-container"></div>');

  function generateDetailedRubricReviewEl() {
    if (rubricReviewData) {
      let criteriaHTML = generateCriteriaHTML(rubricCriteria, rubricReviewData);
      let el = $(`
        <div style="padding: 8px 0;">
          <h2>Rubric Review</h2>
          ${criteriaHTML}
          <div title="Additional feedback generated by the AI reviewer" style="margin-top: 0.5rem; display: inline-block;">
            <h2>AI Feedback</h2>
            <p>${rubricReviewData.feedback}</p>
          </div>
        </div> 

      `);
      return el;
    }
    return $('<div></div>')
  }

  // do we have a review?
  async function generateDetailedContent(containerEl) {
    if (assignmentReviewData) {
      containerEl.append(generateRelevantObjectivesEl(assignmentReviewData, objectivesData));
      containerEl.append(generateDetailedContentReviewEl('Assignment', assignmentCriteria, assignmentReviewData));
      containerEl.append(generateDetailedRubricReviewEl());
      // containerEl.append(generateTopicTagsEl(assignmentReviewData));
    }
  }

  function generateAssignmentReviewEl() {
    let data = assignmentReviewData;
    let averageScore = calcCriteriaAverageScore(data, assignmentCriteria);

    let rubricScore = calcCriteriaAverageScore(rubricReviewData, rubricCriteria);
    let el = $(`
      <div style="padding: 8px 0;">
        <div title="The bloom's taxonomy level of this assignment." style="margin-bottom: 0.5rem; text-align: center;">
          <span style="background-color: ${bloomsColors?.[data?.blooms?.toLowerCase()]}; color: #000000; padding: 0.5rem; display: inline-block; border-radius: 0.5rem; display: inline-block;">${assignmentReviewData.blooms}</span>
        </div>
        <div title="Average score for assignment review.">
          <h2>Assignment Quality</h2>
          <div style="text-align: center;">
            <span id="btech-course-reviewer-item-score" style="font-size: 2rem; cursor: pointer; user-select: none;">
              ${ data.ignore ? '🚫' : emoji?.[averageScore] ?? ''}
            </span>
          </div>
        </div>
        <div title="${rubricScore ? 'Average score for rubric review.' : 'Missing rubric!'}">
          <h2>Rubric Quality</h2>
          <div style="text-align: center;"><span style="font-size: 2rem;">${ emoji?.[rubricScore] ?? '&#128561'}</span></div>
        </div>
        <div title="Additional feedback generated by the AI reviewer" style="margin-top: 0.5rem; display: inline-block;">
          <h2>AI Feedback</h2>
          <p>${data.feedback}</p>
        </div>
      </div> 
      `);
    let scoreIcon = $(el.find('#btech-course-reviewer-item-score'));
    scoreIcon.click(function () {
      data.ignore = !data.ignore;
      let el = $(this);
      el.html(data.ignore ? '🚫' : emoji?.[averageScore] ?? '');
      ignoreItem(ENV.COURSE_ID, 'assignments', data.assignment_id, data.ignore)
    });
    return el;
  }

  async function generateContent(containerEl) {
    containerEl.empty();
    containerEl.append(generateAssignmentReviewEl());
  }

  await refreshData();
  $('#right-side-wrapper').show();
  $('#right-side').append(evaluateButton);
  $("#right-side").append(container);
  $('#right-side').append(detailedReportButton);
  if (assignmentReviewData?.assignment_id) await generateContent(container);
})();