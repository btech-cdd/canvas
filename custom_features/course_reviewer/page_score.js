(async function () {
  await $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/scripts.js");
  const emoji = [
    // '&#128546',
    // '&#128528',
    // '&#128512;',
    '🥉',
    '🥈',
    '🥇'
  ]


  var courseData, pageReviewData, courseReviewData, objectivesData, relatedPages, courseCode, year;
  async function refreshData() {
    courseData  = (await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}`))[0];
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
    try {
      pageReviewData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/pages/${ENV.WIKI_PAGE.page_id}`);
    } catch (err) {
      console.log(err);
      return false;
    }

    let objectivesQueryString = '';
    for (let o in pageReviewData.objectives) {
      if (o > 0) objectivesQueryString += '&';
      objectivesQueryString += 'objectives[]=' + pageReviewData.objectives[o];
    }
    try {
      relatedPages = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/pages?${objectivesQueryString}`);
      console.log(relatedPages);
      for (let i in relatedPages) {
        let relatedPage = relatedPages[i];
        let relatedPageData = (await canvasGet(`/api/v1/courses/${relatedPage.course_id}/pages/${relatedPage.page_id}`))[0];
        relatedPage.canvas_data = relatedPageData;
      }
    } catch (err) {
      relatedPages = [];
      console.log(err);
    }

    try {
      objectivesData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${courseCode}/year/${year}/objectives`);
    } catch (err) {
      objectivesData = [];
      console.log(err);
    }
    return true;
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

    await evaluatePage(ENV.COURSE_ID, courseCode, year, ENV.WIKI_PAGE.page_id, ENV.WIKI_PAGE.body);
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

  // container for the evaluation itself
  let container = $('<div id="btech-course-reviewer-container"></div>');

  function generateRelevantObjectivesEl() {
    let objectives = [];
    for (let o in objectivesData) {
      let objective = objectivesData[o];
      objectives[objective.objective_id] = objective;
    }

    let relevantObjectivesString = ``;
    for (let i = 1; i < objectives.length; i++) {
      let objective = objectives[i];
      let isRelevant = pageReviewData.objectives.includes(objective.objective_id);
      relevantObjectivesString += `<div style="${isRelevant ? '' : 'color: #CCC;'}"><span style="width: 1rem; display: inline-block;">${isRelevant ? '&#10003;' : ''}</span>${objective.objective_text}</div>`;
    }
    let relevantObjectivesEl = $(`<div><h2>Relevant Objectives</h2>${relevantObjectivesString}</div>`);
    return relevantObjectivesEl;
  }

  function generateDetailedPageReviewEl() {
    let el = $(`
      <div style="padding: 8px 0;">
        <h2>Page Review</h2>
        <div title="Instructions are written clearly and sequentially without lots of extraneous information.">
          <span style="width: 5rem; display: inline-block;">Clarity</span><span>${ emoji?.[pageReviewData.clarity - 1] ?? ''}</span>
        </div>
        <div title="Content is chunked with headers, call out boxes, lists, etc.">
          <span style="width: 5rem; display: inline-block;">Chunking</span><span>${ pageReviewData.chunked_content ? emojiTF[1] : emojiTF[0]}</span>
        </div>
        <div title="The purpose of this page is clearly stated through its intended learning outcomes.">
          <span style="width: 5rem; display: inline-block;">Outcomes</span><span>${ pageReviewData.includes_outcomes ? emojiTF[1] : emojiTF[0]}</span>
        </div>
        <div title="The page explicitly states how this page is relevant to what students will do in industry.">
          <span style="width: 5rem; display: inline-block;">Industry</span><span>${ pageReviewData.career_relevance ? emojiTF[1] : emojiTF[0]}</span>
        </div>
        <div title="The page includes supporting media such as graphics and/or videos.">
          <span style="width: 5rem; display: inline-block;">Media</span><span>${ pageReviewData.supporting_media? emojiTF[1] : emojiTF[0]}</span>
        </div>
        <div title="Additional feedback generated by the AI reviewer" style="margin-top: 0.5rem; display: inline-block;">
          <h2>AI Feedback</h2>
          <p>${pageReviewData.feedback}</p>
        </div>
      </div> 
      `);
    return el;
  }

  function generateDetailedRubricReviewEl() {
    if (rubricReviewData) {
      let el = $(`
        <div style="padding: 8px 0;">
          <h2>Rubric Review</h2>
          <div title="Criteria are clear and relevant to the rubric.">
            <span style="width: 5rem; display: inline-block;">Criteria</span><span>${ emoji?.[rubricReviewData.criteria - 1] ?? ''}</span>
          </div>
          <div title="Criteria are appropriately chunked. There are no overlapping criteria. Complex skills or steps have been broken down into individual criterion.">
            <span style="width: 5rem; display: inline-block;">Granularity</span><span>${ emoji?.[rubricReviewData.granularity - 1] ?? ''}</span>
          </div>
          <div title="Grading levels are divided in a logical way that allows students to understand why they got the score they got. It also enagles students to know how to improve.">
            <span style="width: 5rem; display: inline-block;">Scoring</span><span>${ emoji?.[rubricReviewData.grading_levels - 1] ?? ''}</span>
          </div>
          <div title="The writing is clear and free from spelling and grammar errors.">
            <span style="width: 5rem; display: inline-block;">Clarity</span><span>${ emoji?.[rubricReviewData.writing_quality - 1] ?? ''}</span>
          </div>
          <div title="Additional feedback generated by the AI reviewer" style="margin-top: 0.5rem; display: inline-block;">
            <h2>AI Feedback</h2>
            <p>${rubricReviewData.feedback}</p>
          </div>
        </div> 

      `);
      return el;
    }
    return $('<div></div>')
  }

  function generateRelatedPagesEl() {
    let el = $(`
      <div>
        <h2>Related Pages</h2>
      </div>
    `);
    for (let i in relatedPages) {
      let relatedPage = relatedPages[i];
      let aTag = $(`<div><a href="/courses/${relatedPage.course_id}/pages/${relatedPage.page_id}" target="_blank">${relatedPage.canvas_data.name}</a></div>`);
      el.append(aTag);
    }
    return el
  }
  function generateTopicTagsEl() {
    let el = $(`
      <div>
        <h2>Key Topics</h2>
      </div>
    `);
    for (let i in pageReviewData.topic_tags) {
      let topic = pageReviewData.topic_tags[i];
      let topicEl = $(`<span style="padding: 0.25rem; background-color: black; color: white; border-radius: 0.25rem; margin: 0 0.25rem;">${topic}</span>`);
      el.append(topicEl);
    }
    return el
  }

  // do we have a review?
  async function generateDetailedContent(containerEl) {
    if (pageReviewData) {
      // containerEl.append(generateRelevantObjectivesEl());
      containerEl.append(generateDetailedPageReviewEl());
      containerEl.append(generateTopicTagsEl());
      // containerEl.append(generateRelatedPagesEl());
    }
  }

  function generatePageReviewEl() {
    let data = pageReviewData;
    let averageScore = calcPageScore(data);

    let el = $(`
      <div style="padding: 8px 0;">
        <div title="Average score for page review.">
          <h2>Page Quality</h2>
          <div style="text-align: center;"><span style="font-size: 2rem;">${ emoji?.[averageScore] ?? ''}</span></div>
        </div>
        <div title="Additional feedback generated by the AI reviewer" style="margin-top: 0.5rem; display: inline-block;">
          <h2>AI Feedback</h2>
          <p>${pageReviewData.feedback}</p>
        </div>
      </div> 
      `);
    return el;
  }

  async function generateContent(containerEl) {
    containerEl.empty();
    containerEl.append(generatePageReviewEl());
  }

  await refreshData();
  $("#right-side-wrapper").css("display", "block");
  $('aside#right-side').append(evaluateButton);
  $("aside#right-side").append(container);
  $('aside#right-side').append(detailedReportButton);
  if (pageReviewData?.page_id) await generateContent(container);
})();