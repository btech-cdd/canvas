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


  var courseData, assignmentReviewsData, pageReviewsData, courseReviewData, rubricReviewsData, objectivesData, courseCode, year, bloomsCounts, topicTagsCounts, objectivesCounts, assignmentCounts;
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

    // get assignmetn data
    try {
      assignmentReviewsData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/assignments`);
    } catch (err) {
      console.log(err);
      return false;
    }

    try {
      pageReviewsData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/pages`);
    } catch (err) {
      console.log(err);
      return false;
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

      let pageScore = Math.round(((
        (page.clarity - 1) // 1-3, so -1 to get to 0-2
        + (page.chunked_content ? 1 : 0)
        + (page.includes_outcomes ? 1 : 0)
        + (page.career_relevance ? 1 : 0)
        + (page.supporting_media ? 1 : 0)
      ) / 6) // divide by total points
      * 3); // multiply by 3 so we can then round it and get a 0 = sad, 1 = mid, 2+ = happy
      if (pageScore > 2) pageScore = 2;
      if (emoji?.[pageScore]) {
        let pageScoreEl = $(`<span class="ig-assignment-score" style="cursor: pointer; float: right;">${emoji?.[pageScore]}</span>`);
        let itemClass = ".Page" + page.page_id;
        let titleEl = $(itemClass + " div.ig-info");
        titleEl.before(pageScoreEl);
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

      let assignmentScore = Math.round(((
        (assignment.clarity - 1) // 1-3, so -1 to get to 0-2
        + (assignment.chunked_content ? 1 : 0)
        + (assignment.includes_outcomes ? 1 : 0)
        + (assignment.career_relevance ? 1 : 0)
        + (assignment.objectives > 0 ? 1 : 0)
        + (assignment.provides_feedback > 0 ? 1 : 0)
        + (assignment.modeling > 0 ? 1 : 0)
      ) / 8) // divide by total points
      * 3); // multiply by 3 so we can then round it and get a 0 = sad, 1 = mid, 2+ = happy
      if (assignmentScore > 2) assignmentScore = 2;
      if (emoji?.[assignmentScore]) {
        let assignmentScoreEl = $(`<span class="ig-assignment-score" style="cursor: pointer; float: right;">${emoji?.[assignmentScore]}</span>`);
        let itemClass = ".Assignment_" + assignment.assignment_id;
        let titleEl = $(itemClass + " div.ig-info");
        titleEl.before(assignmentScoreEl);
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
    let averageClarity = Math.round(assignmentCounts.clarity / assignmentReviewsData.length)
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
    // for (let blooms in bloomsCounts) {
    //   let count = bloomsCounts[blooms];
    //   let usage = Math.round((count / assignmentReviewsData.length) * 1000) / 10;
    //   let topicEl = $(`<div><span style="display: inline-block; width: 4rem;">${usage}%</span><span>${blooms}</span></div>`);
    //   el.append(topicEl);
    // }
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

  function generateAssignmentReviewEl() {
    let data = assignmentReviewData;
    let averageScore = Math.round(((
      (data.clarity - 1) // 1-3, so -1 to get to 0-2
      + (data.chunked_content ? 1 : 0)
      + (data.includes_outcomes ? 1 : 0)
      + (data.career_relevance ? 1 : 0)
      + (data.objectives > 0 ? 1 : 0)
      + (data.provides_feedback > 0 ? 1 : 0)
    ) / 7) // divide by total points
    * 3); // multiply by 3 so we can then round it and get a 0 = sad, 1 = mid, 2+ = happy
    if (averageScore > 2) averageScore = 2;

    let rubricScore = undefined;
    if (rubricReviewData) {
      rubricScore = Math.round(
        ((
          (rubricReviewData.criteria - 1)
          + (rubricReviewData.granularity - 1)
          + (rubricReviewData.grading_levels - 1)
          + (rubricReviewData.writing_quality - 1)
        ) / 4) 
      );
      if (rubricScore > 2) rubricScore = 2;
      console.log(rubricScore)
    }
    let el = $(`
      <div style="padding: 8px 0;">
        <div title="The bloom's taxonomy level of this assignment." style="margin-bottom: 0.5rem; text-align: center;">
          <span style="background-color: ${bloomsColors?.[assignmentReviewData.blooms.toLowerCase()] ?? '#000000'}; color: #FFFFFF; padding: 0.5rem; display: inline-block; border-radius: 0.5rem; display: inline-block;">${assignmentReviewData.blooms}</span>
        </div>
        <div title="Average score for assignment review.">
          <h2>Assignment Quality</h2>
          <div style="text-align: center;"><span style="font-size: 2rem;">${ emoji?.[averageScore] ?? ''}</span></div>
        </div>
        <div title="${rubricScore ? 'Average score for rubric review.' : 'Missing rubric!'}">
          <h2>Rubric Quality</h2>
          <div style="text-align: center;"><span style="font-size: 2rem;">${ emoji?.[rubricScore] ?? '&#128561'}</span></div>
        </div>
        <div title="Additional feedback generated by the AI reviewer" style="margin-top: 0.5rem; display: inline-block;">
          <h2>AI Feedback</h2>
          <p>${assignmentReviewData.feedback}</p>
        </div>
      </div> 
      `);
    return el;
  }


  await refreshData();
  $(".header-bar-right__buttons").prepend(detailedReportButton);
})();