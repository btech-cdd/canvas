/*
// this should be enough to pull all questions that could possibly appear in the quiz.
// need to probably weight it by the number of questions pulled from each group
//// somehow randomly select some of the questions if it's over x ammount, e.g. pull up to 2x the number of items pulled into the quiz itself.
// then need to pull questions that aren't in a bank separately
*/
(async function () {
  const bloomsColors = {
    'remember': '#F56E74',
    'understand': '#FEB06E',
    'apply': '#FEE06E',
    'analyze': '#B1D983',
    'evaluate': '#88C1E6',
    'create': '#A380C4',
    'n/a': '#C4C4C4'
  }
  const emoji = [
    // '&#128546',
    // '&#128528',
    // '&#128512;',
    '🥉',
    '🥈',
    '🥇'
  ]

  var questionsList = [], quizReviewData = {}, quizData = {};
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      // Generate a random index between 0 and i (inclusive)
      const j = Math.floor(Math.random() * (i + 1));
      // Swap elements array[i] and array[j]
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async function getQuizBankQuestionData() {
    let htmlString = '';
    try {
      htmlString = await $.ajax({
        url: `https://btech.instructure.com/courses/${ENV.COURSE_ID}/quizzes/${ENV.QUIZ.id}/edit`,
        method: 'GET',
        headers: {
          'Accept': 'text/html'
        }
      });
    } catch (err) {
      console.log(err);
    }
    // Regex to match the question bank IDs
    const regexGroupId = /groups\/(\d+)/g;

    // Array to store the question bank IDs
    const questionGroupIds = [];
    let match;

    // Loop through all matches in the string
    while ((match = regexGroupId.exec(htmlString)) !== null) {
      // The captured group contains the question bank ID
        if (!questionGroupIds.includes(match[1])) questionGroupIds.push(match[1]);
    }

    let preProcessedBankQuestions = [];
    for (let i in questionGroupIds) {
        let group = await $.get(`https://btech.instructure.com/api/v1/courses/${ENV.COURSE_ID}/quizzes/${ENV.QUIZ.id}/groups/${questionGroupIds[i]}`);
        let bank = await $.get(`https://btech.instructure.com/courses/${ENV.COURSE_ID}/question_banks/${group.assessment_question_bank_id}/questions?page=1`);
        let questions = shuffleArray(bank.questions).slice(0, group.pick_count);
        preProcessedBankQuestions.push(...questions);
    }

    let bankQuestions = [];
    for (let q in preProcessedBankQuestions) {
      let question = preProcessedBankQuestions[q].assessment_question;
      for (let qd in question.question_data) {
        question[qd] = question.question_data[qd];
      }
      bankQuestions.push(question);
    }
    return bankQuestions;
  }

  async function getQuizQuestionData() {
    let quizQuestions = await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}/quizzes/${ENV.QUIZ.id}/questions`);
    return quizQuestions;
  }

  function processQuestionStatistics() {
    let hasFeedback = 0;
    for (let q in questionsList) {
      let question = questionsList[q];
      if ((question?.correct_comments?.length ?? 0 > 0) || (question?.incorrect_comments?.length ?? 0 > 0)) hasFeedback += 1;
    }
    let percHasFeedback = hasFeedback / questionsList.length;
    return {
      feedback: percHasFeedback
    }
  }

  function genQuizQuestionString() {
    let questionStrings = [];
    for (let q in questionsList) {
      let question = questionsList[q];
      console.log(question);
      let questionSimplified = '';
      questionSimplified += `<question_type>${question.question_type}</question_type>`;
      questionSimplified += `<question_prompt>${question.question_text}</question_prompt>`;
      for (let a = 0; a < question.answers.length; a++) {
        let answer = question.answers[a];
        let isCorrect = answer.weight > 0;
        let questionAnswer = answer?.html ?? answer.text;
        if (isCorrect) {questionSimplified += `<answer_correct>${questionAnswer}</answer_correct>`;}
        else {questionSimplified += `<answer_option>${questionAnswer}</answer_option>`;}
      }
      questionStrings.push(`<quiz_item><quesiton_id>${question.id}</quesiton_id>${questionSimplified}</quiz_item>`);
    }
    questionStrings = shuffleArray(questionStrings).slice(0, 25);
    let questionsString= '';
    for (let q in questionStrings) {
        let questionString = questionStrings[q];
        questionsString += questionString;
    }
    return questionsString;
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
    let statistics = processQuestionStatistics();
    let questionsString = genQuizQuestionString();
    let description = ENV.QUIZ.description;
    await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/quizzes/${ENV.QUIZ.id}/evaluate`, reqdata={
        courseCode: courseCode,
        year: year,
        description: description,
        questions: questionsString,
        statistics: statistics 
    }, type="POST");

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

  async function refreshData() {
    courseData  = (await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}`))[0];
    quizData = (await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}/quizzes/${ENV.QUIZ.id}`))[0];
    let regex = /^([A-Z]{4} \d{4}).*(\d{4})(?=[A-Z]{2})/;
    let match = courseData.sis_course_id.match(regex);
    if (match) {
      courseCode = match[1];
      year = match[2];
    } else {
      courseCode = '';
      year = '';
    }
    try {
      quizReviewData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/quizzes/${ENV.QUIZ.id}`);
    } catch (err) {
      console.log(err);
      return false;
    }

    questionsList = []
    let bankQuestionsList = await getQuizBankQuestionData();
    questionsList.push(...bankQuestionsList);
    let quizQuestionsList = await getQuizQuestionData();
    questionsList.push(...quizQuestionsList);

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
    let averageScore = Math.floor(((
      (data.clarity) // 0-2
      + (data.chunked_content ? 1 : 0)
      + (data.includes_outcomes ? 1 : 0)
      + (data.career_relevance ? 1 : 0)
      + (data.instructions ? 1 : 0)
      + (data.preparation ? 1 : 0)
      + (data.provides_feedback ? 1 : 0)
      + (data.objectives > 0 ? 1 : 0)
    ) / 8) // divide by total points
    * 3) - 1; // multiply by 3 so we can then round it and get a 0 = sad, 1 = mid, 2+ = happy
    if (averageScore > 2) averageScore = 2;
    if (averageScore < 0) averageScore = 0;

    //quiz questions
    let averageQuestionScore = 0;
    if (data?.questions) {
      averageQuestionScore = Math.floor(((
        (data.questions.options_concise) // 0-2
        + (data.questions.options_length)
        + (data.questions.options_quality)
        + (data.questions.options_sentence_completion)
        + (data.questions.prompt_clarity)
        + (data.questions.prompt_complete_sentence)
        + (data.questions.prompt_positive)
      ) / 9) // divide by total points
      * 3) - 1; // multiply by 3 so we can then round it and get a 0 = sad, 1 = mid, 2+ = happy
      if (averageQuestionScore > 2) averageQuestionScore = 2;
      if (averageQuestionScore < 0) averageQuetsionScore = 0;
    }

    let el = $(`
      <div style="padding: 8px 0;">
        <div title="The bloom's taxonomy level of this assignment." style="margin-bottom: 0.5rem; text-align: center;">
          <span style="background-color: ${bloomsColors?.[quizReviewData?.blooms?.toLowerCase()]}; color: #000000; padding: 0.5rem; display: inline-block; border-radius: 0.5rem; display: inline-block;">${quizReviewData.blooms}</span>
        </div>
        <div title="Average score for Quiz review.">
          <h2>Quiz Quality</h2>
          <div style="text-align: center;"><span style="font-size: 2rem;">${ emoji?.[averageScore] ?? ''}</span></div>
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
          <span style="width: 5rem; display: inline-block;">Chunking</span><span>${ quizReviewData.chunked_content ? '&#10004;' : '&#10008;'}</span>
        </div>
        <div title="The purpose of this assignment is clearly stated through its intended learning outcomes.">
          <span style="width: 5rem; display: inline-block;">Outcomes</span><span>${ quizReviewData.includes_outcomes ? '&#10004;' : '&#10008;'}</span>
        </div>
        <div title="The assignment explicitly states how this assignment is relevant to what students will do in industry.">
          <span style="width: 5rem; display: inline-block;">Industry</span><span>${ quizReviewData.career_relevance ? '&#10004;' : '&#10008;'}</span>
        </div>
        <div title="The assignment explicitly states how this students will receive documented feedback.">
          <span style="width: 5rem; display: inline-block;">Clear Instructions</span><span>${ quizReviewData.instructions ? '&#10004;' : '&#10008;'}</span>
        </div>
        <div title="The assignment explicitly states how this students will receive documented feedback.">
          <span style="width: 5rem; display: inline-block;">Preparation</span><span>${ quizReviewData.preparation ? '&#10004;' : '&#10008;'}</span>
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
      console.log(quizReviewData);
      containerEl.append(generateRelevantObjectivesEl());
      containerEl.append(generateDetailedQuizReviewEl());
      // containerEl.append(generateDetailedRubricReviewEl());
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