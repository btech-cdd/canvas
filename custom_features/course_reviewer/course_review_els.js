function generateDetailedQuizReviewEl() {
  let averageClarity = Math.floor(quizCounts.clarity / quizReviewsData.length)
  if (averageClarity > 2) averageClarity = 2;
  let emojiChunkedContent = calcEmoji(quizCounts.chunked_content / quizReviewsData.length);
  let emojiIncludesOutcomes = calcEmoji(quizCounts.includes_outcomes / quizReviewsData.length);
  let emojiCareerRelevance = calcEmoji(quizCounts.career_relevance / quizReviewsData.length);
  let emojiProvidesFeedback = calcEmoji(quizCounts.provides_feedback / quizReviewsData.length);
  let emojiInstructions = calcEmoji(quizCounts.instructions / quizReviewsData.length);
  let emojiPreparation = calcEmoji(quizCounts.preparation / quizReviewsData.length);
  let el = $(`
    <div style="padding: 8px 0;">
      <h2>Quiz Review</h2>
      <div title="Instructions are written clearly and sequentially without lots of extraneous information.">
        <span style="width: 6rem; display: inline-block;">Clarity</span><span>${ emoji?.[averageClarity - 1] ?? ''}</span>
      </div>
      <div title="Content is chunked with headers, call out boxes, lists, etc.">
        <span style="width: 6rem; display: inline-block;">Chunking</span><span>${ emojiChunkedContent }</span>
      </div>
      <div title="The purpose of this assignment is clearly stated through its intended learning outcomes.">
        <span style="width: 6rem; display: inline-block;">Outcomes</span><span>${ emojiIncludesOutcomes }</span>
      </div>
      <div title="The assignment explicitly states how this assignment is relevant to what students will do in industry.">
        <span style="width: 6rem; display: inline-block;">Industry</span><span>${ emojiCareerRelevance }</span>
      </div>
      <div title="The assignment explicitly states how this students will receive documented feedback.">
        <span style="width: 6rem; display: inline-block;">Feedback</span><span>${ emojiProvidesFeedback }</span>
      </div>
      <div title="The assignment explicitly states how this students will receive documented feedback.">
        <span style="width: 6rem; display: inline-block;">Instructions</span><span>${ emojiInstructions }</span>
      </div>
      <div title="The assignment explicitly states how this students will receive documented feedback.">
        <span style="width: 6rem; display: inline-block;">Preparation</span><span>${ emojiPreparation }</span>
      </div>
    </div> 
    `);
  return el;
}

function generateDetailedAssignmentReviewEl() {
  let averageClarity = Math.floor(assignmentCounts.clarity / assignmentReviewsData.length)
  if (averageClarity > 2) averageClarity = 2;
  let emojiChunkedContent = calcEmoji(assignmentCounts.chunked_content / assignmentReviewsData.length);
  let emojiIncludesOutcomes = calcEmoji(assignmentCounts.includes_outcomes / assignmentReviewsData.length);
  let emojiCareerRelevance = calcEmoji(assignmentCounts.career_relevance / assignmentReviewsData.length);
  let emojiProvidesFeedback = calcEmoji(assignmentCounts.provides_feedback / assignmentReviewsData.length);
  let emojiModeling = calcEmoji(assignmentCounts.modeling / assignmentReviewsData.length);
  let el = $(`
    <div style="padding: 8px 0;">
      <h2>Assignment Review</h2>
      <div title="Instructions are written clearly and sequentially without lots of extraneous information.">
        <span style="width: 6rem; display: inline-block;">Clarity</span><span>${ emoji?.[averageClarity - 1] ?? ''}</span>
      </div>
      <div title="Content is chunked with headers, call out boxes, lists, etc.">
        <span style="width: 6rem; display: inline-block;">Chunking</span><span>${ emojiChunkedContent }</span>
      </div>
      <div title="The purpose of this assignment is clearly stated through its intended learning outcomes.">
        <span style="width: 6rem; display: inline-block;">Outcomes</span><span>${ emojiIncludesOutcomes }</span>
      </div>
      <div title="The assignment explicitly states how this assignment is relevant to what students will do in industry.">
        <span style="width: 6rem; display: inline-block;">Industry</span><span>${ emojiCareerRelevance }</span>
      </div>
      <div title="The assignment explicitly states how this students will receive documented feedback.">
        <span style="width: 6rem; display: inline-block;">Feedback</span><span>${ emojiProvidesFeedback }</span>
      </div>
      <div title="The assignment explicitly states how this students will receive documented feedback.">
        <span style="width: 6rem; display: inline-block;">Modeling</span><span>${ emojiModeling }</span>
      </div>
    </div> 
    `);
  return el;
}

function generateObjectivesEl() {
  let el = $(`
    <div>
      <h2>Objectives</h2>
    </div>
  `);
  for (let o in objectivesData) {
    let objective = objectivesData[o];
    let usage = Math.round((objectivesCounts[objective.objective_id] / (assignmentReviewsData.length + quizReviewsData.length)) * 1000) / 10;
    let topicEl = $(`<div><span style="display: inline-block; width: 4rem;">${isNaN(usage) ? 0 : usage}%</span><span>${objective.objective_text.trim()}</span></div>`);
    el.append(topicEl);
  }

  // I think it's worth including even if there are 0% with no objectives
  // if (objectivesCounts['n/a'] > 0) {

  // }
  let noObjectives = Math.round((objectivesCounts['n/a'] / assignmentReviewsData.length) * 1000) / 10;
  let noObjectivesEl = $(`
    <div><span style="display: inline-block; width: 4rem; margin-top: 1rem;">${noObjectives}%</span><span><i>No Objectives</i></span></div>
  `);
  el.append(noObjectivesEl)
  return el
}
function generateBloomsEl() {
  let el = $(`
    <div>
      <h2>Blooms</h2>
      <div style="display: flex; align-items: center;" class="blooms-chart-container">
      <svg style="width: 150px; height: 150px; margin-right: 20px;" class="blooms-chart"></svg>
      <div style="display: flex; flex-direction: column; justify-content: center;" class="blooms-chart-key"></div>
      </div>
    </div>
  `);
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
function generateExternalContentEl() {
  let el = $(`
    <div>
      <h2>Contracted Courseware</h2>
      <div>3rd Party Items: ${externalContentCount} Item(s) (${Math.round((externalContentCount / contentCount) * 1000) / 10}%)</div>
    </div>
  `);
  return el
}

// do we have a review?
async function generateDetailedContent(containerEl) {
  containerEl.empty();
  if (courseReviewData) {
    // containerEl.append(generateRelevantObjectivesEl());
    containerEl.append(generateObjectivesEl());
    containerEl.append(generateExternalContentEl());
    containerEl.append(generateBloomsEl());
    genBloomsChart(bloomsCounts);
    containerEl.append(generateDetailedAssignmentReviewEl());
    containerEl.append(generateDetailedQuizReviewEl());
    // containerEl.append(generateDetailedPageReviewEl());
    // containerEl.append(generateDetailedRubricReviewEl());
    containerEl.append(generateTopicTagsEl());
    // containerEl.append(generateRelatedAssignmentsEl());
  }
  let reevaluateButtonContainer= $("<div></div>");
  let reevaluateButton = $("<button>Score All Items</button>");
  reevaluateButtonContainer.append(reevaluateButton);
  containerEl.append(reevaluateButtonContainer);
  containerEl.append('<div>Put on the kettle and throw on a movie because this will take a while.</div>')
  reevaluateButton.click(async function() {
    containerEl.empty();
    let assignmentsEl = $('<div></div>');
    containerEl.append(assignmentsEl);
    assignmentsEl.html('Loading Assignments...');
    let assignments = await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}/assignments`);
    assignmentsEl.html(`0 / ${assignments.length} Assignments Reviewed`);
    for (let a in assignments) {
      assignmentsEl.html(`${parseInt(a)} / ${assignments.length} Assignments Reviewed`);
      let assignment = assignments[a];
      if (!assignment.published || assignment.points_possible <= 0) {
        continue;
      }
      // Used for checking if assignment needs to be reviewed again
      let assignmentUpdatedAt = new Date(assignment.updated_at);

      // NEW QUIZZES
      if (assignment.is_quiz_lti_assignment) {
        // let newQuiz = await $.get(`/api/quiz/v1/courses/${ENV.COURSE_ID}/quizzes/${assignment.id}`);
        // await evaluateNewQuiz(ENV.COURSE_ID, courseCode, year, assignment.id, newQuiz.description);
      }
      // CLASSIC QUIZZES
      else if (assignment.is_quiz_assignment) {
        let skip = false;
        for (let r in quizReviewsData) {
          let review = quizReviewsData[r];
          if (review.quiz_id == assignment.quiz_id) {
            let reviewUpdatedAt = new Date(review.last_update);
            if (reviewUpdatedAt > assignmentUpdatedAt) skip = true; // skip anything reviewed more recently than the last update
          }
        }
        if (skip) continue;
        await evaluateQuiz(ENV.COURSE_ID, courseCode, year, assignment.quiz_id, assignment.description);
      }
      // LTIS
      else if (assignment.submission_types.includes('external_tool')) {
        // ltis, possibly could have a database of ltis that have been reviewed manually and put in that score
      }
      // TRADITIONAL ASSIGNMENTS
      else {
        let skip = false;
        for (let r in assignmentReviewsData) {
          let review = assignmentReviewsData[r];
          if (review.assignment_id == assignment.id) {
            let reviewUpdatedAt = new Date(review.last_update);
            if (reviewUpdatedAt > assignmentUpdatedAt) {
              skip = true; // skip anything reviewed more recently than the last update
            }
          }
        }
        if (skip) continue;
        await evaluateAssignment(ENV.COURSE_ID, courseCode, year, assignment.id, assignment.description, JSON.stringify(assignment.rubric));
      }
    }
    assignmentsEl.html(`${assignments.length} Assignments Reviewed`);

    let pagesEl = $('<div></div>');
    containerEl.append(pagesEl);
    pagesEl.html('Loading Pages...');
    let pages = await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}/pages?include[]=body`);
    pagesEl.html(`0 / ${pages.length} Pages Reviewed`);
    for (let p in pages) {
      let page = pages[p];
      //check if last updated is sooner than last reviewed
      pagesEl.html(`${p} / ${pages.length} Pages Reviewed`);
      if (page.published) {
        let pageUpdatedAt = new Date(page.updated_at);
        let skip = false;
        for (let r in pageReviewsData) {
          let review = pageReviewsData[r];
          if (review.page_id == page.id) {
            let reviewUpdatedAt = new Date(review.last_update);
            if (reviewUpdatedAt > pageUpdatedAt) {
              skip = true; // skip anything reviewed more recently than the last update
            }
          }
        }
        if (skip) continue;
        await evaluatePage(ENV.COURSE_ID, courseCode, year, page.page_id, page.body);
      }
    }
    pagesEl.html(`${pages.length} Pages Reviewed`);

    generateDetailedContent(containerEl);
  });
}