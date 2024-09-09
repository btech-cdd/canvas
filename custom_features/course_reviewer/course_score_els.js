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
  let fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  let paddingSize = fontSize * 0.25;
  let barSize = 6;
  const size = (2.75 * fontSize) + (paddingSize * 2) + (barSize * 2); // Convert rem to pixels (assuming 1rem = 16px)
  const radius = size / 2; // Adjust radius to fit within the container

  const svg = d3.select('#btech-detailed-evaluation-button')
      .html('') // Clear any existing content
      .append('svg')
      .attr('class', 'btech-reviewer-progress-circle') // Set the class here
      .attr('width', size)
      .attr('height', size)
      .style('margin-left', `-${ paddingSize + barSize }px`) // -4 to cover padding of parent, -
      .style('margin-top', `-${ paddingSize + barSize }px`) // -4 to cover padding of parent, -
      .append('g')
      .attr('transform', `translate(${size / 2},${size / 2}) rotate(0)`); // Center and rotate to start from the top

  // Create an arc generator
  const arc = d3.arc()
      .outerRadius(radius)
      .innerRadius(radius - barSize); // Adjust this value to control the size of the hole

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

async function checkReviewProgress (pageCounts, quizCounts, assignmentCounts, rubricCounts) {
  let reviewerProgressData = { processed: 0, remaining: 0};
  try {
    let course = await bridgetools.req(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}`);

    // place holder until more robust data is available
    reviewerProgressData.processed = Math.round((course.current_update_progress ?? 1) * 100); // Example increment
    reviewerProgressData.remaining = 100 - reviewerProgressData.processed; // Example decrement


    $('#btech-detailed-evaluation-button').html('');
    if (course.current_update_progress <= 1 && reviewerProgressData.remaining > 0) {
      updateReviewProgress(reviewerProgressData);
    }
    let courseScore = calcCourseScore(pageCounts, quizCounts, assignmentCounts, rubricCounts);
    let emoji = calcEmoji(courseScore);
    $('#btech-detailed-evaluation-button').append(  `<span style="padding: 0.25rem; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 2rem; z-index: 1001;">${emoji}</span>`);
  } catch (error) {
    console.error('Error fetching course data:', error);
  }
  return reviewerProgressData;
}
async function initReviewProgressInterval(pageCounts, quizCounts, assignmentCounts, rubricCounts) {
  // Run the updateProgress function every 10 seconds
  let intervalId = setInterval(function () {
    checkReviewProgress(pageCounts, quizCounts, assignmentCounts, rubricCounts)
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
    console.log(containerEl);
  containerEl.empty();
  containerEl.html(`
    <div style="background-color: white; font-weight: bold; font-size: 1.5rem; padding: 0.5rem; border: 1px solid #AAA;">Course Evaluation</div>
    <div v-if="view == 'main'">
      <div class="btech-course-evaluator-content-box">
        <h2>Objectives</h2>
        <div v-for="(objective, o) in objectivesData" :key="o">
          <span style="display: inline-block; width: 4rem;">{{isNaN(objective.usage) ? 0 : objective.usage}}%</span><span>{{objective.objective_text.trim()}}</span>
        </div>
        <div @click="view = 'unaligned'"><span style="display: inline-block; width: 4rem; margin-top: 1rem;">{{Math.round((objectivesCounts['n/a'] / (assignmentReviewsData.length + quizReviewsData.length)) * 1000) / 10}}%</span><span><i>No Objectives</i></span></div>
      </div>
      <div class="btech-course-evaluator-content-box">
        <h2>Contracted Courseware</h2>
        <div>3rd Party Items: {{externalContentCounts}} Item(s) ({{Math.round((externalContentCounts / totalContentCounts) * 1000) / 10}}%)</div>
      </div>
      <div class="btech-course-evaluator-content-box">
        <h2>Blooms</h2>
        <div style="display: flex; align-items: center;" class="blooms-chart-container">
        <svg style="width: 150px; height: 150px; margin-right: 20px;" class="blooms-chart"></svg>
        <div style="display: flex; flex-direction: column; justify-content: center;" class="blooms-chart-key"></div>
        </div>
      </div>
      <div class="btech-course-evaluator-content-box" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
        <div style="padding: 8px 0;">
          <h2>Assignments</h2>
          <div title="Instructions are written clearly and sequentially without lots of extraneous information.">
            <span style="width: 6rem; display: inline-block;">Clarity</span><span>{{ calcEmoji(assignmentCounts.clarity / (assignmentReviewsData.length * 2)) }}</span>
          </div>
          <div title="Content is chunked with headers, call out boxes, lists, etc.">
            <span style="width: 6rem; display: inline-block;">Chunking</span><span>{{ calcEmoji(assignmentCounts.chunked_content / assignmentReviewsData.length) }}</span>
          </div>
          <div title="The purpose of this assignment is clearly stated through its intended learning outcomes.">
            <span style="width: 6rem; display: inline-block;">Outcomes</span><span>{{ calcEmoji(assignmentCounts.includes_outcomes / assignmentReviewsData.length) }}</span>
          </div>
          <div title="The assignment explicitly states how this assignment is relevant to what students will do in industry.">
            <span style="width: 6rem; display: inline-block;">Industry</span><span>{{ calcEmoji(assignmentCounts.career_relevance / assignmentReviewsData.length) }}</span>
          </div>
          <div title="The assignment explicitly states how students will receive documented feedback.">
            <span style="width: 6rem; display: inline-block;">Feedback</span><span>{{ calcEmoji(assignmentCounts.provides_feedback / assignmentReviewsData.length) }}</span>
          </div>
          <div title="The assignment models for students what a well done completed product looks like. This may be done through video, graphics, uploaded files, etc.">
            <span style="width: 6rem; display: inline-block;">Modeling</span><span>{{ calcEmoji(assignmentCounts.modeling / assignmentReviewsData.length) }}</span>
          </div>
        </div>
        <div style="padding: 8px 0;">
          <h2>Quizzes</h2>
          <div title="Content is written clearly and without lots of extraneous information.">
            <span style="width: 6rem; display: inline-block;">Clarity</span><span>{{ calcEmoji(quizCounts.clarity / (quizReviewsData.length * 2)) }}</span>
          </div>
          <div title="Content is chunked with headers, call out boxes, lists, etc.">
            <span style="width: 6rem; display: inline-block;">Chunking</span><span>{{ calcEmoji(quizCounts.chunked_content / quizReviewsData.length) }}</span>
          </div>
          <div title="The purpose of this quiz is clearly stated through its intended learning outcomes.">
            <span style="width: 6rem; display: inline-block;">Outcomes</span><span>{{ calcEmoji(quizCounts.includes_outcomes / quizReviewsData.length) }}</span>
          </div>
          <div title="The quiz explicitly states how this quiz is relevant to what students will do in industry.">
            <span style="width: 6rem; display: inline-block;">Industry</span><span>{{ calcEmoji(quizCounts.career_relevance / quizReviewsData.length) }}</span>
          </div>
          <div title="The quiz gives instructions on what to expect in the quiz (e.g. which chapters are covered, what types of questions, how long to set aside, where the test will be held).">
            <span style="width: 6rem; display: inline-block;">Instructions</span><span>{{ calcEmoji(quizCounts.instructions / quizReviewsData.length) }}</span>
          </div>
          <div title="The quiz gives guidance on how students should prepare before taking the quiz.">
            <span style="width: 6rem; display: inline-block;">Preparation</span><span>{{ calcEmoji(quizCounts.preparation / quizReviewsData.length) }}</span>
          </div>
        </div>
        <div style="padding: 8px 0;">
          <h2>Pages</h2>
          <div title="Content is written clearly without lots of extraneous information.">
            <span style="width: 6rem; display: inline-block;">Clarity</span><span>{{ calcEmoji(pageCounts.clarity / (pageReviewsData.length * 2)) }}</span>
          </div>
          <div title="Content is chunked with headers, call out boxes, lists, etc.">
            <span style="width: 6rem; display: inline-block;">Chunking</span><span>{{ calcEmoji(pageCounts.chunked_content / pageReviewsData.length) }}</span>
          </div>
          <div title="The purpose of this page is clearly stated through its intended learning outcomes.">
            <span style="width: 6rem; display: inline-block;">Outcomes</span><span>{{ calcEmoji(pageCounts.includes_outcomes / pageReviewsData.length) }}</span>
          </div>
          <div title="The page explicitly states how this content is relevant to what students will do in industry.">
            <span style="width: 6rem; display: inline-block;">Industry</span><span>{{ calcEmoji(pageCounts.career_relevance / pageReviewsData.length) }}</span>
          </div>
          <div title="The page includes supporting media such as graphics, videos, or uploaded documents.">
            <span style="width: 6rem; display: inline-block;">Media</span><span>{{ calcEmoji(pageCounts.supporting_media / pageReviewsData.length) }}</span>
          </div>
        </div> 
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          <div style="padding: 8px 0;">
            <h2>Rubrics</h2>
            <div title="The assignment explicitly states how this assignment is relevant to what students will do in industry.">
              <span style="width: 6rem; display: inline-block;">Clarity</span><span>{{ calcEmoji(rubricCounts.writing_quality / (rubricReviewsData.length * 2)) }}</span>
            </div>
            <div title="Instructions are written clearly and sequentially without lots of extraneous information.">
              <span style="width: 6rem; display: inline-block;">Criteria</span><span>{{ calcEmoji(rubricCounts.criteria / (rubricReviewsData.length * 2)) }}</span>
            </div>
            <div title="Content is chunked with headers, call out boxes, lists, etc.">
              <span style="width: 6rem; display: inline-block;">Granularity</span><span>{{ calcEmoji(rubricCounts.granularity / (rubricReviewsData.length * 2)) }}</span>
            </div>
            <div title="The purpose of this assignment is clearly stated through its intended learning outcomes.">
              <span style="width: 6rem; display: inline-block;">Scoring</span><span>{{ calcEmoji(rubricCounts.grading_levels / (rubricReviewsData.length * 2)) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!d3.select('.btech-reviewer-progress-circle').node()">
        <button @click="reevaluate">Score All Items</button>
      </div>
    </div>
    <div v-if="view == 'unaligned'">
      <h2>Unaligned Assignments</h2>
      <div v-for="(assignment, a) in assignmentReviewsData.filter(assignment => (assignment?.objectives ?? []).length == 0 && !assignment.ignore)" :key="a"><a :href="'https://btech.instructure.com/courses/' + assignment.course_id + '/assignments/' + assignment.assignment_id">{{assignment.name}}</a></div>
      <h2>Unaligned Quizzes</h2>
      <div v-for="(quiz, q) in quizReviewsData.filter(quiz => (quiz?.objectives ?? []).length == 0 && !quiz.ignore)" :key="q"><a :href="'https://btech.instructure.com/courses/' + quiz.course_id + '/quizzes/' + quiz.quiz_id">{{quiz.name}}</a></div>
      <h2>Unaligned Pages</h2>
      <div v-for="(page, p) in pageReviewsData.filter(page => (page?.objectives ?? []).length == 0 && !page.ignore)" :key="p"><a :href="'https://btech.instructure.com/courses/' + page.course_id + '/pages/' + page.page_id">{{page.name}}</a></div>
    </div>
  `);
  if (courseReviewData) {
    let APP = new Vue({
      el: '#btech-course-reviewer-detailed-report',
      created: async function () {
        let num = this.assignmentReviewsData.length + this.quizReviewsData.length;
        for (let o in this.objectivesData) {
          let objective = this.objectivesData[o];
          let usage = Math.round((this.objectivesCounts[objective.objective_id] / (num)) * 1000) / 10;
          this.objectivesData[o].usage = usage;
        }
        console.log(this.rubricReviewsData);
      },
      data: function () {
        return {
          view: 'main',
          objectivesData: objectivesData,
          objectivesCounts: objectivesCounts,
          pageReviewsData: pageReviewsData,
          pageCounts: pageCounts,
          assignmentReviewsData: assignmentReviewsData,
          assignmentCounts: assignmentCounts,
          rubricReviewsData: rubricReviewsData,
          rubricCounts: rubricCounts,
          quizReviewsData: quizReviewsData,
          quizCounts: quizCounts,
          externalContentCounts: externalContentCounts,
          totalContentCounts: totalContentCounts
        }
      },
      methods: {
        async reevaluate() {
          let modal = $('body .btech-modal');
          modal.remove();
      
          updateReviewProgress({processed: 0, remaining: 1});
          await bridgetools.req(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/evaluate_content`, {course_code: courseCode, year: year}, 'POST');
          checkReviewProgress(pageCounts, quizCounts, assignmentCounts, rubricCounts);
        }
      }
    });
    genBloomsChart(bloomsCounts);
  }
}