const emoji = [
    // '&#128546;',
    // '&#128528;',
    // '&#128512;',
    '🥉',
    '🥈',
    '🥇'
]

const emojiTF = [

]

const bloomsColors = {
    'remember': '#F56E74',
    'understand': '#FEB06E',
    'apply': '#FEE06E',
    'analyze': '#B1D983',
    'evaluate': '#88C1E6',
    'create': '#A380C4',
    'n/a': '#C4C4C4'
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // Generate a random index between 0 and i (inclusive)
        const j = Math.floor(Math.random() * (i + 1));
        // Swap elements array[i] and array[j]
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
  
function genBloomsChart(data) {
    // Set dimensions and radius
    const width = 150;
    const height = 150;
    const radius = Math.min(width, height) / 2;

    // Create an arc generator
    const arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    // Create a label arc generator
    const labelArc = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    // Create a pie generator
    const pie = d3.pie()
        .sort(null)
        .value(d => d[1]);

    // Select the SVG element and set its dimensions
    const svg = d3.select("svg.blooms-chart")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    // Bind data to the pie chart
    const g = svg.selectAll(".arc")
        .data(pie(Object.entries(data)))
        .enter().append("g")
        .attr("class", "arc");

    // Append path elements for each slice
    g.append("path")
        .attr("d", arc)
        .style("stroke", "white")
        .style("fill", d => bloomsColors[d.data[0]]);

    // Create key for colors
    const key = d3.select(".blooms-chart-key");
    Object.entries(bloomsColors).forEach(([label, color]) => {
        key.append("div")
            .attr("class", "key-item")
            .style("display", "flex")
            .style("align-items", "center")
            .style("line-height", "1rem")
            .style("margin-bottom", "2px")
            .html(`<div class="key-color" style="background-color: ${color}; width: 1rem; height: 1rem; margin-right: 1rem; display: inline-block;"></div><div style="display: inline-block;">${label}</div>`);
    });
}

function calcQuizScore(quiz) {
    let quizScore = Math.floor(((
        (quiz.clarity) // 0-2
        + (quiz.chunked_content ? 1 : 0)
        + (quiz.includes_outcomes ? 1 : 0)
        + (quiz.career_relevance ? 1 : 0)
        + (quiz.instructions ? 1 : 0)
        + (quiz.preparation ? 1 : 0)
        + (quiz.provides_feedback ? 1 : 0)
        + (quiz.objectives > 0 ? 1 : 0)
        ) / 8) // divide by total points
    * 3) - 1; // multiply by 3 so we can then round it and get a 0 = sad, 1 = mid, 2+ = happy
    if (quizScore > 2) quizScore = 2;
    if (quizScore < 0) quizScore = 0;
    return quizScore;
}

function calcQuizQuestionScore(quiz) {
    let averageQuestionScore = 0;
    if (quiz?.questions) {
      averageQuestionScore = Math.floor(((
        (quiz.questions.prompt_quality) // 0-2
        + (quiz.questions.prompt_clarity)
        + (quiz.questions.prompt_positive)
        + (quiz.questions.prompt_complete_sentence)
        + (quiz.questions.options_quality)
        + (quiz.questions.options_clarity)
        + (quiz.questions.options_length)
        + (quiz.questions.options_sentence_completion)
        + (quiz.questions.options_concise)
        + (quiz.questions.incorrect_answer_quality)
      ) / 9) // divide by total points
      * 3) - 1; // multiply by 3 so we can then round it and get a 0 = sad, 1 = mid, 2+ = happy
      if (averageQuestionScore > 2) averageQuestionScore = 2;
      if (averageQuestionScore < 0) averageQuestionScore = 0;
    }
}

function calcAssignmentScore(assignment) {
    let assignmentScore = Math.floor(((
        (assignment.clarity - 1) // 1-3, so -1 to get to 0-2
        + (assignment.chunked_content ? 1 : 0)
        + (assignment.includes_outcomes ? 1 : 0)
        + (assignment.career_relevance ? 1 : 0)
        + (assignment.objectives > 0 ? 1 : 0)
        + (assignment.provides_feedback > 0 ? 1 : 0)
        + (assignment.modeling > 0 ? 1 : 0)
        ) / 8) // divide by total points
    * 3) - 1; // multiply by 3 so we can then round it and get a 0 = sad, 1 = mid, 2+ = happy
    if (assignmentScore > 2) assignmentScore = 2;
    if (assignmentScore < 0) assignmentScore = 0;
    return assignmentScore;
}

function calcPageSCore(page) {
    let pageScore = Math.floor(((
        (page.clarity - 1) // 1-3, so -1 to get to 0-2
        + (page.chunked_content ? 1 : 0)
        + (page.includes_outcomes ? 1 : 0)
        + (page.career_relevance ? 1 : 0)
        + (page.supporting_media ? 1 : 0)
        ) / 6) // divide by total points
    * 3) - 1; // multiply by 3 so we can then round it and get a 0 = sad, 1 = mid, 2+ = happy
    if (pageScore > 2) pageScore = 2;
    if (pageScore < 0) pageScore = 0;
    return pageScore;
}

function addTopics(counts, dataList) {
    for (let i in dataList) {
        let data = dataList[i];
        // topic tags
        if (data.topic_tags) {
            for (let t in data?.topic_tags ?? []) {
                let tag = data.topic_tags[t];
                if (counts?.[tag] === undefined) counts[tag] = 0;
                counts[tag]  += 1;
            }
        }
    }
    return counts;
}

function addObjectives(counts, dataList) {
    for (let i in dataList) {
        let data = dataList[i];
        // objectives 
        if (counts['n/a/'] == undefined) counts['n/a'] = 0;
        if ((data?.objectives ?? []).length > 0) {
            for (let o in data?.objectives?? []) {
                let objective = data.objectives[o];
                if (counts?.[objective] === undefined) counts[objective] = 0;
                counts[objective]  += 1;
            }
        } else {
            counts['n/a/'] += 1;
        }
    }
    return counts;
}


async function evaluateAssignment(courseId, courseCode, year, assignmentId, description, rubric) {
  await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${courseId}/assignments/${assignmentId}/evaluate`, reqdata={
      courseCode: courseCode,
      year: year,
      description: description,
      rubric: rubric
  }, type="POST");
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

function genQuizQuestionString(questionsList) {
  let questionStrings = [];
  for (let q in questionsList) {
    let question = questionsList[q];
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

async function genQuestionsList() {
  let questionsList = []
  let bankQuestionsList = await getQuizBankQuestionData(ENV.COURSE_ID, ENV.QUIZ.id);
  questionsList.push(...bankQuestionsList);
  let quizQuestionsList = await getQuizQuestionData(ENV.COURSE_ID, ENV.QUIZ_ID);
  questionsList.push(...quizQuestionsList);
  return questionsList;
}

async function genNewQuizzesQuestionsList(courseId, quizId) {
  return [];
}

async function evaluateNewQuiz(courseId, courseCode, year, quizId, description) {
  let statistics = processQuestionStatistics();
  let questionsList = await genNewQuizzesQuestionsList(); 
  await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${courseId}/quizzes/${quizId}/evaluate`, reqdata={
      courseCode: courseCode,
      year: year,
      description: description,
      questions: '<div>Questions Unavailable for Review</div>',
      statistics: statistics 
  }, type="POST");
}

async function evaluateQuiz(courseId, courseCode, year, quizId, description) {
  let statistics = processQuestionStatistics();
  let questionsList = await genQuestionsList(courseId, quizId);
  let questionsString = genQuizQuestionString(questionsList);
  await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${courseId}/quizzes/${quizId}/evaluate`, reqdata={
      courseCode: courseCode,
      year: year,
      description: description,
      questions: questionsString,
      statistics: statistics 
  }, type="POST");
}