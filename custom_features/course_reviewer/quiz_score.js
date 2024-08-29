/*
// this should be enough to pull all questions that could possibly appear in the quiz.
// need to probably weight it by the number of questions pulled from each group
//// somehow randomly select some of the questions if it's over x ammount, e.g. pull up to 2x the number of items pulled into the quiz itself.
// then need to pull questions that aren't in a bank separately
*/
(async function () {
  await $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/scripts.js");

  var quizReviewData = {}, quizData = {};



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
    console.log(quizData);
    await evaluateQuiz(ENV.COURSE_ID, courseCode, year, quizData.id, quizData.description)

    if (await refreshData()) await generateContent(container);

    detailedReportButton.show();
    evaluateButton.show();
  });

  //reevaluate button
  let ignoreButton = $(`
    <a class="btn" id="btech-ignore-evaluation-button" rel="nofollow" >
      Ignore 
    </a>
  `);

  ignoreButton.click(async function() {
    ignoreItem(ENV.COURSE_ID, 'quizzes', quizData.id)
  })

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

  async function refreshData() {
    courseData  = (await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}`))[0];
    quizData = (await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}/quizzes/${ENV.QUIZ.id}`))[0];
    let courseCodeYear = getCourseCodeYear(courseData);
    year = courseCodeYear.year;
    courseCode = courseCodeYear.courseCode;
    try {
      quizReviewData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/quizzes/${ENV.QUIZ.id}`);
      console.log(quizReviewData);
    } catch (err) {
      console.log(err);
      return false;
    }

    let objectivesQueryString = '';
    for (let o in quizReviewData.objectives) {
      if (o > 0) objectivesQueryString += '&';
      objectivesQueryString += 'objectives[]=' + quizReviewData.objectives[o];
    }

    try {
      objectivesData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${courseCode}/year/${year}/objectives`);
    } catch (err) {
      objectivesData = [];
      console.log(err);
    }

    return true;

  }
  function generateQuizReviewEl() {
    let data = quizReviewData;
    let averageScore = calcQuizScore(data); 
    
    //quiz questions
    let averageQuestionScore = calcQuizQuestionScore(data);

    let el = $(`
      <div style="padding: 8px 0;">
        <div title="The bloom's taxonomy level of this assignment." style="margin-bottom: 0.5rem; text-align: center;">
          <span style="background-color: ${bloomsColors?.[data?.blooms?.toLowerCase()]}; color: #000000; padding: 0.5rem; display: inline-block; border-radius: 0.5rem; display: inline-block;">${quizReviewData.blooms}</span>
        </div>
        <div title="Average score for Quiz review.">
          <h2>Quiz Quality</h2>
          <div style="text-align: center;"><span id="btech-course-reviewer-item-score" style="font-size: 2rem;">${ data.ignore ? '🚫' : emoji?.[averageScore] ?? ''}</span></div>
        </div>
        <div title="Average score for Quiz Questions review.">
          <h2>Quiz Question Quality</h2>
          <div style="text-align: center;"><span style="font-size: 2rem;">${ emoji?.[averageQuestionScore] ?? ''}</span></div>
        </div>
        <div title="Additional feedback generated by the AI reviewer" style="margin-top: 0.5rem; display: inline-block;">
          <h2>AI Feedback</h2>
          <p>${quizReviewData.feedback}</p>
        </div>
      </div> 
      `);
    let scoreIcon = $(el.find('#btech-course-reviewer-item-score'));
    scoreIcon.click(() => {
      data.ignore = !data.ignore;
      let el = $(this);
      el.html(data.ignore ? '🚫' : emoji?.[averageScore] ?? '');
      ignoreItem(ENV.COURSE_ID, 'quizzes', data.id, data.ignore)
      console.log(data.ignore);
    });
    console.log(scoreIcon);
    return el;
  }

  function generateRelevantObjectivesEl() {
    let objectives = [];
    for (let o in objectivesData) {
      let objective = objectivesData[o];
      objectives[objective.objective_id] = objective;
    }

    let relevantObjectivesString = ``;
    for (let i = 1; i < objectives.length; i++) {
      let objective = objectives[i];
      let isRelevant = quizReviewData.objectives.includes(objective.objective_id);
      relevantObjectivesString += `<div style="${isRelevant ? '' : 'color: #CCC;'}"><span style="width: 1rem; display: inline-block;">${isRelevant ? '&#10003;' : ''}</span>${objective.objective_text}</div>`;
    }
    let relevantObjectivesEl = $(`<div><h2>Relevant Objectives</h2>${relevantObjectivesString}</div>`);
    return relevantObjectivesEl;
  }

  function generateTopicTagsEl() {
    let el = $(`
      <div>
        <h2>Key Topics</h2>
      </div>
    `);
    for (let i in quizReviewData.topic_tags) {
      let topic = quizReviewData.topic_tags[i];
      let topicEl = $(`<span style="padding: 0.25rem; background-color: black; color: white; border-radius: 0.25rem; margin: 0 0.25rem;">${topic}</span>`);
      el.append(topicEl);
    }
    return el
  }

  function generateDetailedQuizReviewEl() {
    let el = $(`
      <div style="padding: 8px 0;">
        <h2>Assignment Review</h2>
        <div title="The bloom's taxonomy level of this quiz." style="margin-bottom: 0.5rem; display: inline-block;">
          <span style="background-color: ${bloomsColors?.[quizReviewData.blooms.toLowerCase()]}; color: #000000; padding: 0.5rem; display: inline-block; border-radius: 0.5rem; display: inline-block;">${quizReviewData.blooms}</span>
        </div>
        <div title="Instructions are written clearly and sequentially without lots of extraneous information.">
          <span style="width: 5rem; display: inline-block;">Clarity</span><span>${ emoji?.[quizReviewData.clarity] ?? ''}</span>
        </div>
        <div title="Content is chunked with headers, call out boxes, lists, etc.">
          <span style="width: 5rem; display: inline-block;">Chunking</span><span>${ quizReviewData.chunked_content ? emojiTF[1] : emojiTF[0]}</span>
        </div>
        <div title="The purpose of this assignment is clearly stated through its intended learning outcomes.">
          <span style="width: 5rem; display: inline-block;">Outcomes</span><span>${ quizReviewData.includes_outcomes ? emojiTF[1] : emojiTF[0]}</span>
        </div>
        <div title="The assignment explicitly states how this assignment is relevant to what students will do in industry.">
          <span style="width: 5rem; display: inline-block;">Industry</span><span>${ quizReviewData.career_relevance ? emojiTF[1] : emojiTF[0]}</span>
        </div>
        <div title="The assignment explicitly states how this students will receive documented feedback.">
          <span style="width: 5rem; display: inline-block;">Instructions</span><span>${ quizReviewData.instructions ? emojiTF[1] : emojiTF[0]}</span>
        </div>
        <div title="The assignment explicitly states how this students will receive documented feedback.">
          <span style="width: 5rem; display: inline-block;">Preparation</span><span>${ quizReviewData.preparation ? emojiTF[1] : emojiTF[0]}</span>
        </div>
        <div title="Additional feedback generated by the AI reviewer" style="margin-top: 0.5rem; display: inline-block;">
          <h2>AI Feedback</h2>
          <p>${quizReviewData.feedback}</p>
        </div>
      </div> 
      `);
    return el;
  }

  function generateDetailedQuizQuestionsReviewEl() {
    let el = $(`
      <div style="padding: 8px 0;">
        <h2>Questions Review</h2>
        <div title="The bloom's taxonomy level of this quiz." style="margin-bottom: 0.5rem; display: inline-block;">
          <span style="background-color: ${bloomsColors?.[quizReviewData.blooms.toLowerCase()]}; color: #000000; padding: 0.5rem; display: inline-block; border-radius: 0.5rem; display: inline-block;">${quizReviewData.blooms}</span>
        </div>
        <div title="Instructions are written clearly and sequentially without lots of extraneous information.">
          <span style="width: 5rem; display: inline-block;">Prompt Quality</span><span>${quizReviewData.questions.prompt_quality}</span>
        </div>
        <div title="Instructions are written clearly and sequentially without lots of extraneous information.">
          <span style="width: 5rem; display: inline-block;">Prompt Clarity</span><span>${quizReviewData.questions.prompt_clarity}</span>
        </div>
        <div title="Content is chunked with headers, call out boxes, lists, etc.">
          <span style="width: 5rem; display: inline-block;">Prompt Complete Sentence</span><span>${quizReviewData.questions.prompt_clarity}</span>
        </div>
        <div title="The purpose of this assignment is clearly stated through its intended learning outcomes.">
          <span style="width: 5rem; display: inline-block;">Prompt Positive Wording</span><span>${quizReviewData.questions.prompt_positive}</span>
        </div>
        <div title="The assignment explicitly states how this assignment is relevant to what students will do in industry.">
          <span style="width: 5rem; display: inline-block;">Options Quality</span><span>${quizReviewData.questions.options_quality}</span>
        </div>
        <div title="The assignment explicitly states how this students will receive documented feedback.">
          <span style="width: 5rem; display: inline-block;">Options Similar Length</span><span>${quizReviewData.questions.options_length}</span>
        </div>
        <div title="The assignment explicitly states how this students will receive documented feedback.">
          <span style="width: 5rem; display: inline-block;">Options Concise</span><span>${quizReviewData.questions.options_concise}</span>
        </div>
        <div title="The assignment explicitly states how this students will receive documented feedback.">
          <span style="width: 5rem; display: inline-block;">Options Logical Sentence Completion</span><span>${quizReviewData.questions.options_sentence_completion}</span>
        </div>
        <div title="Additional feedback generated by the AI reviewer" style="margin-top: 0.5rem; display: inline-block;">
          <h2>AI Feedback</h2>
          <p>${quizReviewData.feedback}</p>
        </div>
      </div> 
      `);
    return el;
  }

  async function generateDetailedContent(containerEl) {
    if (quizReviewData) {
      containerEl.append(generateRelevantObjectivesEl());
      containerEl.append(generateDetailedQuizReviewEl());
      containerEl.append(generateDetailedQuizQuestionsReviewEl());
      containerEl.append(generateTopicTagsEl());
      // containerEl.append(generateRelatedAssignmentsEl());
    }
  }

  async function generateContent(containerEl) {
    containerEl.empty();
    containerEl.append(generateQuizReviewEl());
  }

  let container = $('<div id="btech-course-reviewer-container"></div>');
  await refreshData();
  $('#sidebar_content').append(evaluateButton);
  $("#sidebar_content").append(container);
  $('#sidebar_content').append(detailedReportButton);
  if (quizReviewData?.quiz_id) await generateContent(container);

})();