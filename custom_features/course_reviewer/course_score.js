(async function () {
  const bloomsColors = {
    'remember': '#a222a2',
    'understand': '#2222a2',
    'apply': '#22a222',
    'analyze': '#a2a222',
    'evaluate': '#a27222',
    'create': '#a22232' 
  }
  const emoji = [
    '&#128546',
    '&#128528',
    '&#128512;',
  ]


  var courseData, assignmentData, assignmentReviewsData, courseReviewData, rubricReviewData, objectivesData, relatedAssignments, courseCode, year;
  async function refreshData() {
    courseData  = (await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}`))[0];
    assignmentData = (await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}/assignments/${ENV.ASSIGNMENT_ID}`))[0];
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
    try {
      assignmentReviewsData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/assignments`);
    } catch (err) {
      console.log(err);
      return false;
    }

    try {
      objectivesData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${courseCode}/year/${year}/objectives`);
    } catch (err) {
      objectivesData = [];
      console.log(err);
    }

    return true;
  }

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
    console.log("Populate modal");
    generateDetailedContent(modalContent);
  });

  // container for the evaluation itself
  let container = $('<div id="btech-course-reviewer-container"></div>');

  function generateRelevantObjectivesEl() {
    let objectives = [];
    for (let o in objectivesData) {
      let objective = objectivesData[o];
      objectives[objective.objective_id] = objective;
    }

    let relevantObjectivesString = ``;
    for (let i = 1; i < objectives.length; i++) {
      let objective = objectives[i];
      let isRelevant = assignmentReviewData.objectives.includes(objective.objective_id);
      relevantObjectivesString += `<div style="${isRelevant ? '' : 'color: #CCC;'}"><span style="width: 1rem; display: inline-block;">${isRelevant ? '&#10003;' : ''}</span>${objective.objective_text}</div>`;
    }
    let relevantObjectivesEl = $(`<div><h2>Relevant Objectives</h2>${relevantObjectivesString}</div>`);
    return relevantObjectivesEl;
  }

  function generateDetailedAssignmentReviewEl() {
    let el = $(`
      <div style="padding: 8px 0;">
        
      </div> 
      `);
    return el;
  }

  function generateDetailedRubricReviewEl() {
    if (rubricReviewData) {
      let el = $(`
        <div style="padding: 8px 0;">
          
        </div> 

      `);
      return el;
    }
    return $('<div></div>')
  }

  function generateRelatedAssignmentsEl() {
    console.log("APPEND!")
    let el = $(`
      <div>
        <h2>Related Assignments</h2>
      </div>
    `);
    for (let i in relatedAssignments) {
      let relatedAssignment = relatedAssignments[i];
      let aTag = $(`<div><a href="/courses/${relatedAssignment.course_id}/assignments/${relatedAssignment.assignment_id}" target="_blank">${relatedAssignment.canvas_data.name}</a></div>`);
      el.append(aTag);
    }
    return el
  }
  function generateTopicTagsEl() {
    let el = $(`
      <div>
        <h2>Key Topics</h2>
      </div>
    `);
    for (let i in courseReviewData.topic_tags) {
      let topic = courseReviewData.topic_tags[i];
      let topicEl = $(`<span style="padding: 0.25rem; background-color: black; color: white; border-radius: 0.25rem; margin: 0 0.25rem;">${topic}</span>`);
      el.append(topicEl);
    }
    return el
  }

  // do we have a review?
  async function generateDetailedContent(containerEl) {
    if (assignmentReviewData) {
      // containerEl.append(generateRelevantObjectivesEl());
      // containerEl.append(generateDetailedAssignmentReviewEl());
      // containerEl.append(generateDetailedRubricReviewEl());
      containerEl.append(generateTopicTagsEl());
      // containerEl.append(generateRelatedAssignmentsEl());
    }
  }

  function generateAssignmentReviewEl() {
    let data = assignmentReviewData;
    let averageScore = Math.round(((
      (data.clarity - 1) // 1-3, so -1 to get to 0-2
      + (data.chunked_content ? 1 : 0)
      + (data.includes_outcomes ? 1 : 0)
      + (data.career_relevance ? 1 : 0)
      + (data.objectives > 0 ? 1 : 0)
      + (data.provides_feedback > 0 ? 1 : 0)
    ) / 7) // divide by total points
    * 3); // multiply by 3 so we can then round it and get a 0 = sad, 1 = mid, 2+ = happy
    if (averageScore > 2) averageScore = 2;

    let rubricScore = undefined;
    if (rubricReviewData) {
      rubricScore = Math.round(
        (
          rubricReviewData.criteria
          + rubricReviewData.granularity
          + rubricReviewData.grading_levels
          + rubricReviewData.writing_quality
        ) / 4
      );
      if (rubricScore > 2) rubricScore = 2;
      console.log(rubricScore)
    }
    let el = $(`
      <div style="padding: 8px 0;">
        <div title="The bloom's taxonomy level of this assignment." style="margin-bottom: 0.5rem; text-align: center;">
          <span style="background-color: ${bloomsColors?.[assignmentReviewData.blooms.toLowerCase()] ?? '#000000'}; color: #FFFFFF; padding: 0.5rem; display: inline-block; border-radius: 0.5rem; display: inline-block;">${assignmentReviewData.blooms}</span>
        </div>
        <div title="Average score for assignment review.">
          <h2>Assignment Quality</h2>
          <div style="text-align: center;"><span style="font-size: 2rem;">${ emoji?.[averageScore] ?? ''}</span></div>
        </div>
        <div title="${rubricScore ? 'Average score for rubric review.' : 'Missing rubric!'}">
          <h2>Rubric Quality</h2>
          <div style="text-align: center;"><span style="font-size: 2rem;">${ emoji?.[rubricScore] ?? '&#128561'}</span></div>
        </div>
        <div title="Additional feedback generated by the AI reviewer" style="margin-top: 0.5rem; display: inline-block;">
          <h2>AI Feedback</h2>
          <p>${assignmentReviewData.feedback}</p>
        </div>
      </div> 
      `);
    return el;
  }


  await refreshData();
  $('#course_show_secondary').append(detailedReportButton);
})();