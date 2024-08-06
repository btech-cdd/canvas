(async function () {
  await $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/scripts.js");



  $(".context_module_item").each(function() {
    let el = $(this);
    let infoEl = el.find('div.ig-info')
    infoEl.before(`<span class="ig-btech-evaluation-score" style="font-size: 1rem;"></span>`)
  });


  var 
    courseData
    , externalContentCount
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
    contentCount = 0;
    externalContentCount = 0;
    $(".context_module_item span.ig-btech-evaluation-score").each(function() {
      let el = $(this);
      el.html(`⚪`);
      contentCount += 1;
    });
    $(".context_external_tool span.ig-btech-evaluation-score").each(function() {
      let el = $(this);
      el.html(`🚫`);
    });
    $(".context_module_sub_header span.ig-btech-evaluation-score").each(function() {
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
      if (el.html() == `🚫`) externalContentCount += 1;
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
    objectivesCounts =  addObjectives(objectivesCounts, pageReviewsData);
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


  function generateDetailedQuizReviewEl() {
    let averageClarity = Math.floor(quizCounts.clarity / quizReviewsData.length)
    if (averageClarity > 2) averageClarity = 2;
    let usageChunkedContent = Math.round((quizCounts.chunked_content / quizReviewsData.length) * 1000) / 10;
    let usageIncludesOutcomes = Math.round((quizCounts.includes_outcomes/ quizReviewsData.length) * 1000) / 10;
    let usageCareerRelevance = Math.round((quizCounts.career_relevance / quizReviewsData.length) * 1000) / 10;
    let usageProvidesFeedback = Math.round((quizCounts.provides_feedback / quizReviewsData.length) * 1000) / 10;
    let usageInstructions = Math.round((quizCounts.instructions / quizReviewsData.length) * 1000) / 10;
    let usagePreparation = Math.round((quizCounts.preparation / quizReviewsData.length) * 1000) / 10;
    let el = $(`
      <div style="padding: 8px 0;">
       <h2>Quiz Review</h2>
        <div title="Instructions are written clearly and sequentially without lots of extraneous information.">
          <span style="width: 5rem; display: inline-block;">Clarity</span><span>${ emoji?.[averageClarity - 1] ?? ''}</span>
        </div>
        <div title="Content is chunked with headers, call out boxes, lists, etc.">
          <span style="width: 5rem; display: inline-block;">Chunking</span><span>${ usageChunkedContent }%</span>
        </div>
        <div title="The purpose of this assignment is clearly stated through its intended learning outcomes.">
          <span style="width: 5rem; display: inline-block;">Outcomes</span><span>${ usageIncludesOutcomes }%</span>
        </div>
        <div title="The assignment explicitly states how this assignment is relevant to what students will do in industry.">
          <span style="width: 5rem; display: inline-block;">Industry</span><span>${ usageCareerRelevance }%</span>
        </div>
        <div title="The assignment explicitly states how this students will receive documented feedback.">
          <span style="width: 5rem; display: inline-block;">Feedback</span><span>${ usageProvidesFeedback }%</span>
        </div>
        <div title="The assignment explicitly states how this students will receive documented feedback.">
          <span style="width: 5rem; display: inline-block;">Instructions</span><span>${ usageInstructions }%</span>
        </div>
        <div title="The assignment explicitly states how this students will receive documented feedback.">
          <span style="width: 5rem; display: inline-block;">Preparation</span><span>${ usagePreparation }%</span>
        </div>
      </div> 
      `);
    return el;
  }

  function generateDetailedAssignmentReviewEl() {
    let averageClarity = Math.floor(assignmentCounts.clarity / assignmentReviewsData.length)
    if (averageClarity > 2) averageClarity = 2;
    let usageChunkedContent = Math.round((assignmentCounts.chunked_content / assignmentReviewsData.length) * 1000) / 10;
    let usageIncludesOutcomes = Math.round((assignmentCounts.includes_outcomes/ assignmentReviewsData.length) * 1000) / 10;
    let usageCareerRelevance = Math.round((assignmentCounts.career_relevance / assignmentReviewsData.length) * 1000) / 10;
    let usageProvidesFeedback = Math.round((assignmentCounts.provides_feedback / assignmentReviewsData.length) * 1000) / 10;
    let el = $(`
      <div style="padding: 8px 0;">
       <h2>Assignment Review</h2>
        <div title="Instructions are written clearly and sequentially without lots of extraneous information.">
          <span style="width: 5rem; display: inline-block;">Clarity</span><span>${ emoji?.[averageClarity - 1] ?? ''}</span>
        </div>
        <div title="Content is chunked with headers, call out boxes, lists, etc.">
          <span style="width: 5rem; display: inline-block;">Chunking</span><span>${ usageChunkedContent }%</span>
        </div>
        <div title="The purpose of this assignment is clearly stated through its intended learning outcomes.">
          <span style="width: 5rem; display: inline-block;">Outcomes</span><span>${ usageIncludesOutcomes }%</span>
        </div>
        <div title="The assignment explicitly states how this assignment is relevant to what students will do in industry.">
          <span style="width: 5rem; display: inline-block;">Industry</span><span>${ usageCareerRelevance }%</span>
        </div>
        <div title="The assignment explicitly states how this students will receive documented feedback.">
          <span style="width: 5rem; display: inline-block;">Feedback</span><span>${ usageProvidesFeedback }%</span>
        </div>
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

  function generateObjectivesEl() {
    let el = $(`
      <div>
        <h2>Objectives</h2>
      </div>
    `);
    for (let o in objectivesData) {
      let objective = objectivesData[o];
      let usage = Math.round((objectivesCounts[objective.objective_id] / assignmentReviewsData.length) * 1000) / 10;
      let topicEl = $(`<div><span style="display: inline-block; width: 4rem;">${usage}%</span><span>${objective.objective_text.trim()}</span></div>`);
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
          for (let r in quizReviewsData) {
            let review = quizReviewsData[r];
            if (review.quiz_id == assignment.quiz_id) {
              let reviewUpdatedAt = new Date(review.last_update);
              if (reviewUpdatedAt < assignmentUpdatedAt) continue; // skip anything reviewed more recently than the last update
            }
          }
          await evaluateQuiz(ENV.COURSE_ID, courseCode, year, assignment.quiz_id, assignment.description);
        }
        // LTIS
        else if (assignment.submission_types.includes('external_tool')) {
          // ltis, possibly could have a database of ltis that have been reviewed manually and put in that score
        }
        // TRADITIONAL ASSIGNMENTS
        else {
          for (let r in assignmentReviewsData) {
            let review = assignmentReviewsData[r];
            if (review.assignment_id == assignment.id) {
              let reviewUpdatedAt = new Date(review.last_update);
              if (reviewUpdatedAt < assignmentUpdatedAt) continue; // skip anything reviewed more recently than the last update
            }
          }
          await evaluateAssignment(ENV.COURSE_ID, courseCode, year, assignment.id, assignment.description, JSON.stringify(assignment.rubric));
        }
        assignmentsEl.html(`${a + 1} / ${assignments.length} Assignments Reviewed`);
      }

      let pagesEl = $('<div></div>');
      containerEl.append(pagesEl);
      pagesEl.html('Loading Pages...');
      let pages = await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}/pages?include[]=body`);
      for (let p in pages) {
        //check if last updated is sooner than last reviewed
        let page = pages[p];
        if (page.published) {
          await evaluatePage(ENV.COURSE_ID, courseCode, year, page.page_id, page.body);
        }
      }
      generateDetailedContent(containerEl);
    });
  }

  await refreshData();
  $(".header-bar-right__buttons").prepend(detailedReportButton);
})();