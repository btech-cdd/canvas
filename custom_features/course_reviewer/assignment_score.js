(async function () {
  $('#sidebar_content').css({
    'position': 'sticky',
    'top': 0,
    'max-height': '100vh'
  });
  $("#aside").css({
    'height': '90vh'
  });

  //reevaluate button
  let evaluateButton = $(`
    <span 
      id="btech-evaluate-button" 
      style="cursor: pointer; background-color: black; color: white; border-radius: 0.25rem; padding: 0.25rem;"
    >
      Evaluate
    </span>
  `);
  let container = $('<div id="btech-course-reviewer-container"></div>');
  let detailedReportButton = $(`
    <span 
      id="btech-evaluate-button" 
      style="cursor: pointer; background-color: black; color: white; border-radius: 0.25rem; padding: 0.25rem;"
    >
     Detailed Report 
    </span>
  `);

  var courseData, assignmentData, assignmentReviewData, courseReviewData;
  async function refreshData() {
    courseData  = (await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}`))[0];
    assignmentData = (await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}/assignments/${ENV.ASSIGNMENT_ID}`))[0];
    let regex = /^([A-Z]{4} \d{4}).*(\d{4})(?=[A-Z]{2})/;
    let match = courseData.sis_course_id.match(regex);
    if (match) {
      courseCode = match[1];
      year = match[2];
      let description = assignmentData.description;
      let rubric = JSON.stringify(assignmentData.rubric);
      let data = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${courseData.id}/assignments/${assignmentData.id}/evaluate`, reqdata={
          courseCode: courseCode,
          year: year,
          description: description,
          rubric: rubric
      }, type="POST");
      return true;
    } else {
      console.log("NO SIS ID FOUND");
    }
    return false;
  }

  evaluateButton.click(async function() {
    evaluateButton.css({
      'background-color': '#888',
      color: 'white'
    });
    container.html('evaluating...')

    if (await refreshData()) await refreshReport();

    evaluateButton.css({
      'background-color': 'black',
      color: 'white'
    });
  });
  $('#sidebar_content').append(evaluateButton);

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
  $('#sidebar_content').append(detailedReportButton);
  // container for the evaluation itself
  $("#sidebar_content").append(container);
  // do we have a review?
  async function generateDetailedContent(containerEl) {
    container.empty();
    let assignmentReview;
    try {
      assignmentReview = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/assignments/${ENV.ASSIGNMENT_ID}`);
    } catch (err) {
      console.log(err);
    }
    let objectivesQueryString = '';
    for (let o in assignmentReview.objectives) {
      if (o > 0) objectivesQueryString += '&';
      objectivesQueryString += 'objectives[]=' + assignmentReview.objectives[o];
    }

    let relatedAssignments = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/assignments?${objectivesQueryString}`);
    console.log(assignmentReview);
    console.log(relatedAssignments);
    const bloomsColors = {
      'remember': '#a222a2',
      'understand': '#2222a2',
      'apply': '#22a222',
      'analyze': '#a2a222',
      'evaluate': '#a27222',
      'create': '#a22232' 
    }
    const clarityEmoji = [
      '',
      '&#128546',
      '&#128528',
      '&#128512;',
    ]
    if (assignmentReview) {
      let objectives = [];
      let courseData = (await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}`))[0];

      let regex = /^([A-Z]{4} \d{4}).*(\d{4})(?=[A-Z]{2})/;
      let match = courseData.sis_course_id.match(regex);

      if (match) {
        courseCode = match[1];
        year = match[2];
        let objectivesData = [];
        objectivesData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${courseCode}/year/${year}/objectives`);
        for (let o in objectivesData) {
          let objective = objectivesData[o];
          objectives[objective.objective_id] = objective;
        }
      } else {
        console.log("NO SIS ID FOUND");
      }

      let relevantObjectivesString = ``;
      for (let i = 1; i < objectives.length; i++) {
        let objective = objectives[i];
        let isRelevant = assignmentReview.objectives.includes(objective.objective_id);
        relevantObjectivesString += `<div style="${isRelevant ? '' : 'color: #CCC;'}"><span style="width: 1rem; display: inline-block;">${isRelevant ? '&#10003;' : ''}</span>${objective.objective_text}</div>`;
      }
      let relevantObjectivesEl = $(`<div><h2>Relevant Objectives</h2>${relevantObjectivesString}</div>`);
      containerEl.append(relevantObjectivesEl);

      let reviewEl = $(`
        <div style="padding: 8px 0;">
          <h2>Assignment Review</h2>
          <div title="The bloom's taxonomy level of this assignment." style="margin-bottom: 0.5rem; display: inline-block;">
            <span style="background-color: ${bloomsColors?.[assignmentReview.blooms.toLowerCase()] ?? '#000000'}; color: #FFFFFF; padding: 0.5rem; display: inline-block; border-radius: 0.5rem; display: inline-block;">${assignmentReview.blooms}</span>
          </div>
          <div title="Instructions are written clearly and sequentially without lots of extraneous information.">
            <span style="width: 5rem; display: inline-block;">Clarity</span><span>${ clarityEmoji?.[assignmentReview.clarity] ?? ''}</span>
          </div>
          <div title="Content is chunked with headers, call out boxes, lists, etc.">
            <span style="width: 5rem; display: inline-block;">Chunking</span><span>${ assignmentReview.chunked_content ? '&#128512;' : '&#128546;'}</span>
          </div>
          <div title="The purpose of this assignment is clearly stated through its intended learning outcomes.">
            <span style="width: 5rem; display: inline-block;">Outcomes</span><span>${ assignmentReview.includes_outcomes? '&#128512;' : '&#128546;'}</span>
          </div>
          <div title="The assignment explicitly states how this assignment is relevant to what students will do in industry.">
            <span style="width: 5rem; display: inline-block;">Industry</span><span>${ assignmentReview.career_relevance? '&#128512;' : '&#128546;'}</span>
          </div>
          <div title="Additional feedback generated by the AI reviewer" style="margin-top: 0.5rem; display: inline-block;">
            <h2>AI Feedback</h2>
            <p>${assignmentReview.feedback}</p>
          </div>
        </div> 
        `);
      containerEl.append(reviewEl);

      try {
        rubricReview = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/assignments/${ENV.ASSIGNMENT_ID}/rubric`);
      } catch (err) {
        console.log(err);
      }

      if (rubricReview) {
        let rubricReviewEl = $(`
          <div style="padding: 8px 0;">
            <h2>Rubric Review</h2>
            <div title="Criteria are clear and relevant to the rubric.">
              <span style="width: 5rem; display: inline-block;">Criteria</span><span>${ clarityEmoji?.[rubricReview.criteria] ?? ''}</span>
            </div>
            <div title="Criteria are appropriately chunked. There are no overlapping criteria. Complex skills or steps have been broken down into individual criterion.">
              <span style="width: 5rem; display: inline-block;">Granularity</span><span>${ clarityEmoji?.[rubricReview.granularity] ?? ''}</span>
            </div>
            <div title="Grading levels are divided in a logical way that allows students to understand why they got the score they got. It also enagles students to know how to improve.">
              <span style="width: 5rem; display: inline-block;">Scoring</span><span>${ clarityEmoji?.[rubricReview.grading_levels] ?? ''}</span>
            </div>
            <div title="The writing is clear and free from spelling and grammar errors.">
              <span style="width: 5rem; display: inline-block;">Clarity</span><span>${ clarityEmoji?.[rubricReview.writing_quality] ?? ''}</span>
            </div>
            <div title="Additional feedback generated by the AI reviewer" style="margin-top: 0.5rem; display: inline-block;">
              <h2>AI Feedback</h2>
              <p>${rubricReview.feedback}</p>
            </div>
          </div> 

          `);
        containerEl.append(rubricReviewEl);
      }
    }
  }

  async function refreshReport() {
    console.log('refresh');
  }

  await refreshData();
  await refreshReport();
})();