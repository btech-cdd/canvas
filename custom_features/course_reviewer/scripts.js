const emoji = [
    // '&#128546;',
    // '&#128528;',
    // '&#128512;',
    '🥉',
    '🥈',
    '🥇'
];

function criterionNameToVariable(name) {
  return name
    .toLowerCase()                            // Convert to lowercase
    .replace(/[^a-z0-9 ]/g, '')               // Remove non-alphanumeric characters except spaces
    .replace(/\s+/g, '_');                    // Replace spaces with underscores
}

function generateCriteriaHTML(criteria, data) {
  let criteriaHTML = ``;
  for (let name in criteria) {
    let criterion = criteria[name];
    let val = data.criteria[name];
    criteriaHTML += `<div title="${criterion.description}"><span style="width: 5rem; display: inline-block;">${criterion.name}</span>`;
    if (criterion.score_type == 'boolean') criteriaHTML += `<span>${val ? emojiTF[1] : emojiTF[0]}</span>`
    if (criterion.score_type == 'number') criteriaHTML += `<span>${emoji?.[val] ?? ''}</span>`
    criteriaHTML += `</div>`
  }
}

function calcEmoji(perc) {
  if (isNaN(perc)) return '';
  if (perc < 0.5) return emoji[0]; // bronze
  if (perc < 0.8) return emoji[1]; // bronze
  return emoji[2]; // bronze
}

const emojiTF = [
  '❌',
  '✔️'
];

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
        ) / 9) // divide by total points
    * 2); // multiply by 3 so we can then round it and get a 0 = sad, 1 = mid, 2+ = happy
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
      ) / 11) // divide by total points
      * 2); // multiply by 3 so we can then round it and get a 0 = sad, 1 = mid, 2+ = happy
      if (averageQuestionScore > 2) averageQuestionScore = 2;
      if (averageQuestionScore < 0) averageQuestionScore = 0;
    }
}

function calcAssignmentScore(assignment) {
    let assignmentScore = Math.floor(((
        (assignment.clarity) // 0 - 2
        + (assignment.chunked_content ? 1 : 0)
        + (assignment.includes_outcomes ? 1 : 0)
        + (assignment.career_relevance ? 1 : 0)
        + (assignment.provides_feedback ? 1 : 0)
        + (assignment.modeling ? 1 : 0)
        + (assignment.objectives > 0 ? 1 : 0)
        ) / 8) // divide by total points
    * 2); // multiply by 2 so we can then round it and get a 0 = sad, 1 = mid, 2+ = happy
    if (assignmentScore > 2) assignmentScore = 2;
    if (assignmentScore < 0) assignmentScore = 0;
    return assignmentScore;
}

function calcRubricScore(rubric) {
  let rubricScore = 0;
  if (rubric) {
    rubricScore = Math.floor(
      ((
        (rubric.criteria)
        + (rubric.granularity)
        + (rubric.grading_levels)
        + (rubric.writing_quality)
      ) / 4) 
    );
    if (rubricScore > 2) rubricScore = 2;
  }
  return rubricScore;
}

function calcPageScore(page) {
    let pageScore = Math.floor(((
        (page.clarity) // 0-2
        + (page.chunked_content ? 1 : 0)
        + (page.includes_outcomes ? 1 : 0)
        + (page.career_relevance ? 1 : 0)
        + (page.supporting_media ? 1 : 0)
        ) / 6) // divide by total points
    * 2); // multiply by 2 so we can then round it and get a 0 = sad, 1 = mid, 2+ = happy
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
    let objectives = data?.objectives ?? [];
    // objectives 
    if (counts['n/a'] == undefined) counts['n/a'] = 0;
    if (objectives.length > 0) {
        for (let o in objectives) {
            let objective = data.objectives[o];
            if (counts?.[objective] === undefined) counts[objective] = 0;
            counts[objective]  += 1;
        }
    } else {
        counts['n/a'] += 1;
    }
  }
  return counts;
}

function getCourseCodeYear(courseData) {
  let regex = /^([A-Z]{4} \d{4}).*(\d{4})(?=[A-Z]{2})/;
  let match = (courseData?.sis_course_id ?? '').match(regex);
  if (match) {
    courseCode = match[1];
    year = match[2];
  } else {
    console.log("NO SIS ID FOUND");
    match = ((courseData.course_code ?? '') + ' 2024XX').match(regex);
    if (match) {
      courseCode = match[1];
      year = match[2];
    } else {
      console.log("NO COURSE CODE FOUND");
      courseCode = '';
      year = '';
    }
  }
  return {
    courseCode: courseCode,
    year: year
  }
}

async function evaluateAssignment(courseId, courseCode, year, assignmentId, description, rubric) {
  await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${courseId}/assignments/${assignmentId}/evaluate`, reqdata = {
      courseCode: courseCode,
      year: year,
      description: description,
      rubric: rubric
  }, type="POST");
}

function processQuestionStatistics(questionsList) {
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

async function getQuizBankQuestionData(courseId, quizId) {
  let htmlString = '';
  try {
    htmlString = await $.ajax({
      url: `https://btech.instructure.com/courses/${courseId}/quizzes/${quizId}/edit`,
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
    let group = await $.get(`https://btech.instructure.com/api/v1/courses/${courseId}/quizzes/${quizId}/groups/${questionGroupIds[i]}`);
    if (group?.assessment_question_bank_id) {
      let bank = await $.get(`https://btech.instructure.com/courses/${courseId}/question_banks/${group.assessment_question_bank_id}/questions?page=1`);
      let questions = shuffleArray(bank.questions).slice(0, group.pick_count);
      preProcessedBankQuestions.push(...questions);
    }
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

async function getQuizQuestionData(courseId, quizId) {
  let quizQuestions = await canvasGet(`/api/v1/courses/${courseId}/quizzes/${quizId}/questions`);
  return quizQuestions;
}

async function genQuestionsList(courseId, quizId) {
  let questionsList = []
  let bankQuestionsList = await getQuizBankQuestionData(courseId, quizId);
  questionsList.push(...bankQuestionsList);
  let quizQuestionsList = await getQuizQuestionData(courseId, quizId);
  questionsList.push(...quizQuestionsList);
  return questionsList;
}

async function genNewQuizzesQuestionsList(courseId, quizId) {
  return [];
}

async function evaluateNewQuiz(courseId, courseCode, year, quizId, description) {
  let questionsList = await genNewQuizzesQuestionsList(); 
  let statistics = processQuestionStatistics(questionsList);
  await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${courseId}/quizzes/${quizId}/evaluate`, reqdata={
      courseCode: courseCode,
      year: year,
      description: description,
      questions: '<div>Questions Unavailable for Review</div>',
      statistics: statistics 
  }, type="POST");
}

async function evaluateQuiz(courseId, courseCode, year, quizId, description) {
  let questionsList = await genQuestionsList(courseId, quizId);
  let statistics = processQuestionStatistics(questionsList);
  let questionsString = genQuizQuestionString(questionsList);
  await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${courseId}/quizzes/${quizId}/evaluate`, reqdata={
      courseCode: courseCode,
      year: year,
      description: description,
      questions: questionsString,
      statistics: statistics 
  }, type="POST");
}

async function ignoreItem(courseId, itemType, itemId, ignore=true) {
  await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${courseId}/${itemType}/${itemId}`, reqdata={
    ignore: ignore
  }, type="POST");
}

async function evaluatePage(courseId, courseCode, year, pageId, description) {
  await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${courseId}/pages/${pageId}/evaluate`, reqdata={
      courseCode: courseCode,
      year: year,
      description: description,
  }, type="POST");
}