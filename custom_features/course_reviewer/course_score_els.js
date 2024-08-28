function generateDetailedPageReviewEl(counts, num) {
  let emojiClarity = calcEmoji(counts.clarity / (num * 2));
  let emojiChunkedContent = calcEmoji(counts.chunked_content / num);
  let emojiIncludesOutcomes = calcEmoji(counts.includes_outcomes / num);
  let emojiCareerRelevance = calcEmoji(counts.career_relevance / num);
  let emojiSupportingMedia = calcEmoji(counts.supporting_media / num);
  let el = $(`
    <div style="padding: 8px 0;">
      <h2>Pages</h2>
      <div title="Instructions are written clearly and sequentially without lots of extraneous information.">
        <span style="width: 6rem; display: inline-block;">Clarity</span><span>${ emojiClarity }</span>
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
        <span style="width: 6rem; display: inline-block;">Media</span><span>${ emojiSupportingMedia }</span>
      </div>
    </div> 
    `);
  return el;
}
function generateDetailedQuizReviewEl(counts, num) {
  let emojiClarity = calcEmoji(counts.clarity / (num * 2));
  let emojiChunkedContent = calcEmoji(counts.chunked_content / num);
  let emojiIncludesOutcomes = calcEmoji(counts.includes_outcomes / num);
  let emojiCareerRelevance = calcEmoji(counts.career_relevance / num);
  let emojiProvidesFeedback = calcEmoji(counts.provides_feedback / num);
  let emojiInstructions = calcEmoji(counts.instructions / num);
  let emojiPreparation = calcEmoji(counts.preparation / num);
  let el = $(`
    <div style="padding: 8px 0;">
      <h2>Quizzes</h2>
      <div title="Instructions are written clearly and sequentially without lots of extraneous information.">
        <span style="width: 6rem; display: inline-block;">Clarity</span><span>${ emojiClarity }</span>
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

function generateDetailedAssignmentReviewEl(counts, num) {
  let emojiClarity = calcEmoji(counts.clarity / (num * 2));
  let emojiChunkedContent = calcEmoji(counts.chunked_content / num);
  let emojiIncludesOutcomes = calcEmoji(counts.includes_outcomes / num);
  let emojiCareerRelevance = calcEmoji(counts.career_relevance / num);
  let emojiProvidesFeedback = calcEmoji(counts.provides_feedback / num);
  let emojiModeling = calcEmoji(counts.modeling / num);
  let el = $(`
    <div style="padding: 8px 0;">
      <h2>Assignments</h2>
      <div title="Instructions are written clearly and sequentially without lots of extraneous information.">
        <span style="width: 6rem; display: inline-block;">Clarity</span><span>${ emojiClarity }</span>
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

function generateObjectivesEl(objectivesData, objectivesCounts, num) {
  let el = $(`
    <div>
      <h2>Objectives</h2>
    </div>
  `);
  for (let o in objectivesData) {
    let objective = objectivesData[o];
    let usage = Math.round((objectivesCounts[objective.objective_id] / (num)) * 1000) / 10;
    let topicEl = $(`<div><span style="display: inline-block; width: 4rem;">${isNaN(usage) ? 0 : usage}%</span><span>${objective.objective_text.trim()}</span></div>`);
    el.append(topicEl);
  }

  // I think it's worth including even if there are 0% with no objectives
  // if (objectivesCounts['n/a'] > 0) {

  // }
  let noObjectives = Math.round((objectivesCounts['n/a'] / num) * 1000) / 10;
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
function generateTopicTagsEl(courseReviewData) {
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
function generateExternalContentEl(externalContentCounts, contentCounts) {
  let el = $(`
    <div>
      <h2>Contracted Courseware</h2>
      <div>3rd Party Items: ${externalContentCounts} Item(s) (${Math.round((externalContentCounts / contentCounts) * 1000) / 10}%)</div>
    </div>
  `);
  return el
}

function updateReviewProgress(data) {
  let color = {
    'quizzes': '#1e65A7',
    'new_quizzes': '#192E5B',
    'assignments': '#25B396',
    'pages': '#70CED0',
    'other': '#00743F',
    'unused_yellow': '#F1A104',
    // temp color
    'processed': '#1e65A7'
  };
  // Set dimensions and radius
  const size = 2.75 * 16; // Convert rem to pixels (assuming 1rem = 16px)
  const radius = 0.9 * size / 2; // Adjust radius to fit within the container

  const svg = d3.select('#btech-detailed-evaluation-button')
      .html('') // Clear any existing content
      .append('svg')
      .attr('class', 'btech-reviewer-progress-circle') // Set the class here
      .attr('width', size)
      .attr('height', size)
      .append('g')
      .attr('transform', `translate(${size / 2},${size / 2}) rotate(0)`); // Center and rotate to start from the top

  // Create an arc generator
  const arc = d3.arc()
      .outerRadius(radius)
      .innerRadius(radius * 0.5); // Adjust this value to control the size of the hole

  // Create a label arc generator
  const labelArc = d3.arc()
      .outerRadius(radius)
      .innerRadius(radius);

  // Create a pie generator
  const pie = d3.pie()
      .sort(null)
      .value(d => d[1]);
  const g = svg.selectAll(".arc")
    .data(pie(Object.entries(data)))
    .enter().append("g")
    .attr("class", "arc");

  // Append path elements for each slice
  g.append("path")
    .attr("d", arc)
    .style("fill", d => color?.[d.data[0]] ?? 'none');
  return svg;
}

async function checkReviewProgress (pageCounts, quizCounts, assignmentCounts) {
  let reviewerProgressData = { processed: 0, remaining: 0};
  try {
    let course = await bridgetools.req(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}`);

    // place holder until more robust data is available
    reviewerProgressData.processed = Math.round((course.current_update_progress ?? 0) * 100); // Example increment
    reviewerProgressData.remaining = 100 - reviewerProgressData.processed; // Example decrement

    updateReviewProgress(reviewerProgressData);

    // Check if progress is 100%
    console.log(course);
    if (course.current_update_progress >= 1 || course.current_update_progress == undefined) {
      let courseScore = calcCourseScore(pageCounts, quizCounts, assignmentCounts);
      let emoji = calcEmoji(courseScore);
      $('#btech-detailed-evaluation-button').html(emoji);
    }
  } catch (error) {
    console.error('Error fetching course data:', error);
  }
  return reviewerProgressData;
}
async function initReviewProgressInterval(pageCounts, quizCounts, assignmentCounts) {
  // Run the updateProgress function every 10 seconds
  let intervalId = setInterval(function () {
    checkReviewProgress(pageCounts, quizCounts, assignmentCounts)
  }, 10000);
}

// do we have a review?
async function generateDetailedContent(
    containerEl
    , courseReviewData
    , courseCode
    , year
    , objectivesData
    , objectivesCounts
    , assignmentReviewsData
    , assignmentCounts
    , rubricReviewsData
    , rubricCounts
    , quizReviewsData
    , quizCounts
    , quizQuestionCounts
    , pageReviewsData
    , pageCounts
    , externalContentCounts
    , totalContentCounts
    , bloomsCounts
  ) {
  containerEl.empty();
  if (courseReviewData) {
    // containerEl.append(generateRelevantObjectivesEl());
    containerEl.append(generateObjectivesEl(objectivesData, objectivesCounts, assignmentReviewsData.length + quizReviewsData.length));
    containerEl.append(generateExternalContentEl(externalContentCounts, totalContentCounts));
    containerEl.append(generateBloomsEl());
    genBloomsChart(bloomsCounts);
    containerEl.append(generateDetailedAssignmentReviewEl(assignmentCounts, assignmentReviewsData.length));
    containerEl.append(generateDetailedQuizReviewEl(quizCounts, quizReviewsData.length));
    // containerEl.append(generateDetailedQuizReviewEl(quizReviewsData, quizQuestionCounts));
    containerEl.append(generateDetailedPageReviewEl(pageCounts, pageReviewsData.length));
    // containerEl.append(generateDetailedRubricReviewEl(rubricReviewsData, rubricCounts));
    // containerEl.append(generateTopicTagsEl(courseReviewData));
    // containerEl.append(generateRelatedAssignmentsEl());
  }

  if (!d3.select('.btech-reviewer-progress-circle').node()) {
    let reevaluateButtonContainer= $("<div></div>");
    let reevaluateButton = $("<button>Score All Items</button>");
    reevaluateButtonContainer.append(reevaluateButton);
    containerEl.append(reevaluateButtonContainer);
    containerEl.append('<div>Put on the kettle and throw on a movie because this will take a while.</div>')

    reevaluateButton.click(async function() {
      let modal = $('body .btech-modal');
      modal.remove();
      $("#btech-detailed-evaluation-button").empty();
   
      updateReviewProgress({processed: 0, remaining: 1});
      await bridgetools.req(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/evaluate_content`, {course_code: courseCode, year: year}, 'POST');
      checkReviewProgress();

      generateDetailedContent(containerEl);
    });
  }
}