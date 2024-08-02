/*
// this should be enough to pull all questions that could possibly appear in the quiz.
// need to probably weight it by the number of questions pulled from each group
//// somehow randomly select some of the questions if it's over x ammount, e.g. pull up to 2x the number of items pulled into the quiz itself.
// then need to pull questions that aren't in a bank separately
*/
(async function () {
  var questionsList = [];
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
    let htmlString = await $.get(`https://btech.instructure.com/courses/${ENV.COURSE_ID}/quizzes/${ENV.QUIZ.id}/edit`);
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

    let bankQuestions= [];
    for (let i in questionGroupIds) {
        let group = await $.get(`https://btech.instructure.com/api/v1/courses/${ENV.COURSE_ID}/quizzes/${ENV.QUIZ.id}/groups/${questionGroupIds[i]}`);
        console.log(group);
        let bank = await $.get(`https://btech.instructure.com/courses/${ENV.COURSE_ID}/question_banks/${group.assessment_question_bank_id}/questions?page=1`);
        bankQuestions.concat(shuffleArray(bank.questions).slice(0, group.pick_count));
    }
    return bankQuestions;
  }

  function processQuestionStats() {
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
      let question = bank.questions[q].assessment_question;
      let questionSimplified = '';
      questionSimplified += `<question_type>${question.question_data.question_type}</question_type>`;
      questionSimplified += `<question_prompt>${question.question_data.question_text}</question_prompt>`;
      for (let a = 0; a < question.question_data.answers.length; a++) {
        let answer = question.question_data.answers[a];
        let isCorrect = answer.weight > 0;
        let questionAnswer = answer?.html ?? answer.text;
        if (isCorrect) {questionSimplified += `<answer_correct>${questionAnswer}</answer_correct>`;}
        else {questionSimplified += `<answer_option>${questionAnswer}</answer_option>`;}
      }
      questionStrings.push(`<quiz_item><quesiton_id>${question.id}</quesiton_id>${questionSimplified}</quiz_item>`);
    }
    questionStrings = shuffleArray(questionStrings).slice(0, 25);
    let quizString = '';
    for (let q in questionStrings) {
        let questionString = questionStrings[q];
        quizString += questionString;
    }
    let quizQuestionsString = `<course_id>${ENV.COURSE_ID}</course_id><quiz_id>${ENV.QUIZ.id}</quiz_id><quiz_questions>${quizString}</quiz_questions>`;
    return quizQuestionsString;
  }

  //reevaluate button
  let evaluateButton = $(`
    <a class="btn" id="btech-evaluate-button" rel="nofollow" >
      Run Evaluator 
    </a>
  `);
  //button is added after data refresh
  evaluateButton.click(async function() {
  });

  let detailedReportButton = $(`
    <a class="btn" id="btech-detailed-evaluation-button" rel="nofollow" >
      Detailed Report 
    </a>
  `);
  detailedReportButton.click(async function () {
  });

  async function refreshData() {

  }

  async function generateContent(containerEl) {
    containerEl.empty();
  }

  let container = $('<div id="btech-course-reviewer-container"></div>');
  await refreshData();
  $('#sidebar_content').append(evaluateButton);
  $("#sidebar_content").append(container);
  $('#sidebar_content').append(detailedReportButton);
  if (assignmentReviewData?.assignment_id) await generateContent(container);

})();