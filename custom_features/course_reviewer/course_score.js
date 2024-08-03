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

  const emoji = [
    // '&#128546;',
    // '&#128528;',
    // '&#128512;',
    '🥉',
    '🥈',
    '🥇'
  ]

  $(".context_module_item").each(function() {
    let el = $(this);
    let infoEl = el.find('div.ig-info')
    infoEl.before(`<span class="ig-btech-evaluation-score" style="font-size: 1rem;">⚪</span>`)
  });

  var courseData, assignmentReviewsData, pageReviewsData, quizReviewsData, courseReviewData, rubricReviewsData, objectivesData, courseCode, year, bloomsCounts, topicTagsCounts, objectivesCounts, assignmentCounts;
  async function refreshData() {
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

    // get assignmetn data
    try {
      assignmentReviewsData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/assignments`);
    } catch (err) {
      console.log(err);
    }

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
    for (let o in pageReviewsData) {
      let page = pageReviewsData[o];
      // topic tags
      if (page.topic_tags) {
        for (let t in page?.topic_tags ?? []) {
          let tag = page.topic_tags[t];
          if (topicTagsCounts?.[tag] === undefined) topicTagsCounts[tag] = 0;
          topicTagsCounts[tag]  += 1;
        }
      }

      // other scores
      if (page.includes_outcomes !== undefined) pageCounts.includes_outcomes += page.includes_outcomes ? 1 : 0;
      if (page.chunked_content !== undefined) pageCounts.chunked_content += page.chunked_content ? 1 : 0;
      if (page.career_relevance !== undefined) pageCounts.career_relevance += page.career_relevance? 1 : 0;
      if (page.supporting_media!== undefined) pageCounts.supporting_media += page.supporting_media? 1 : 0;
      if (page.clarity !== undefined) pageCounts.clarity += page.clarity;

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
      console.log(page)
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

      // topic tags
      if (quiz.topic_tags) {
        for (let t in quiz?.topic_tags ?? []) {
          let tag = quiz.topic_tags[t];
          if (topicTagsCounts?.[tag] === undefined) topicTagsCounts[tag] = 0;
          topicTagsCounts[tag]  += 1;
        }
      }

      // objectives 
      objectivesCounts['n/a'] = 0; // slot for no objectives
      if ((quiz?.objectives ?? []).length > 0) {
        for (let o in quiz?.objectives?? []) {
          let objective = quiz.objectives[o];
          if (objectivesCounts?.[objective] === undefined) objectivesCounts[objective] = 0;
          objectivesCounts[objective]  += 1;
        }
      } else {
        objectivesCounts['n/a/'] += 1;
      }

      // // other scores
      console.log(quiz);
      if (quiz.includes_outcomes !== undefined) quizCounts.includes_outcomes += quiz.includes_outcomes ? 1 : 0;
      if (quiz.chunked_content !== undefined) quizCounts.chunked_content += quiz.chunked_content ? 1 : 0;
      if (quiz.career_relevance !== undefined) quizCounts.career_relevance += quiz.career_relevance ? 1 : 0;
      if (quiz.provides_feedback !== undefined) quizCounts.provides_feedback += quiz.provides_feedback ? 1 : 0;
      if (quiz.instructions !== undefined) quizCounts.instructions += quiz.instructions ? 1 : 0;
      if (quiz.preparation !== undefined) quizCounts.preparation += quiz.preparation ? 1 : 0;
      if (quiz.clarity !== undefined) quizCounts.clarity += quiz.clarity;

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

      // topic tags
      if (assignment.topic_tags) {
        for (let t in assignment?.topic_tags ?? []) {
          let tag = assignment.topic_tags[t];
          if (topicTagsCounts?.[tag] === undefined) topicTagsCounts[tag] = 0;
          topicTagsCounts[tag]  += 1;
        }
      }

      // objectives 
      objectivesCounts['n/a'] = 0; // slot for no objectives
      if ((assignment?.objectives ?? []).length > 0) {
        for (let o in assignment?.objectives?? []) {
          let objective = assignment.objectives[o];
          if (objectivesCounts?.[objective] === undefined) objectivesCounts[objective] = 0;
          objectivesCounts[objective]  += 1;
        }
      } else {
        objectivesCounts['n/a/'] += 1;
      }

      // other scores
      if (assignment.includes_outcomes !== undefined) assignmentCounts.includes_outcomes += assignment.includes_outcomes ? 1 : 0;
      if (assignment.chunked_content !== undefined) assignmentCounts.chunked_content += assignment.chunked_content ? 1 : 0;
      if (assignment.career_relevance !== undefined) assignmentCounts.career_relevance += assignment.career_relevance? 1 : 0;
      if (assignment.provides_feedback !== undefined) assignmentCounts.provides_feedback += assignment.provides_feedback? 1 : 0;
      if (assignment.modeling !== undefined) assignmentCounts.modeling += assignment.modeling ? 1 : 0;
      if (assignment.clarity !== undefined) assignmentCounts.clarity += assignment.clarity;

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

  function generateDetailedAssignmentReviewEl() {
    let averageClarity = Math.floor(assignmentCounts.clarity / assignmentReviewsData.length)
    if (averageClarity > 2) averageClarity = 2;
    console.log(averageClarity);
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
      console.log(objective);
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
    console.log("GEN")
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
    if (courseReviewData) {
      // containerEl.append(generateRelevantObjectivesEl());
      containerEl.append(generateObjectivesEl());
      containerEl.append(generateBloomsEl());
      genBloomsChart(bloomsCounts);
      containerEl.append(generateDetailedAssignmentReviewEl());
      // containerEl.append(generateDetailedRubricReviewEl());
      containerEl.append(generateTopicTagsEl());
      // containerEl.append(generateRelatedAssignmentsEl());
    }
  }

  await refreshData();
  $(".header-bar-right__buttons").prepend(detailedReportButton);
})();