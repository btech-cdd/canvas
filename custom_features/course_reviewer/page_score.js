(async function () {
  await Promise.all([
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/scripts.js"),
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/context_menu.js"),
    $.getScript("https://bridgetools.dev/canvas/custom_features/course_reviewer/detailed_report_button.js")
  ]);
  $(document).ready(async function() {
    var courseData, pageReviewData, pageCriteria, objectivesData, courseCode, year;
    async function refreshData() {
      let criteriaData = (await bridgetools.req(`https://reports.bridgetools.dev/api/reviews/criteria/type/Pages`));
      pageCriteria = {};
      for (let c in criteriaData) {
        let criterion = criteriaData[c];
        let name = criterionNameToVariable(criterion.name);
        pageCriteria[name] = criterion;
      }

      courseData  = (await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}`))[0];
      let courseCodeYear = getCourseCodeYear(courseData);
      year = courseCodeYear.year;
      courseCode = courseCodeYear.courseCode;
      try {
        pageReviewData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${ENV.COURSE_ID}/pages/${ENV.WIKI_PAGE.page_id}`);
        console.log(pageReviewData);
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
        objectivesData = await bridgetoolsReq(`https://reports.bridgetools.dev/api/reviews/courses/${courseCode}/year/${year}/objectives`);
      } catch (err) {
        objectivesData = [];
        console.log(err);
      }
      return true;
    }

    // do we have a review?
    async function generateDetailedContent(containerEl) {
      if (pageReviewData) {
        containerEl.append(generateRelevantObjectivesEl(pageReviewData, objectivesData));
        containerEl.append(generateDetailedContentReviewEl('Page', pageCriteria, pageReviewData));
        // containerEl.append(generateTopicTagsEl(pageReviewData));
        // containerEl.append(generateRelatedPagesEl());
      }
    }

    await refreshData();
   // Function to create and position the custom context menu
   // Function to create and position the custom context menu

    if (pageReviewData?.page_id == undefined) return;
    let $detailedReportButton = addDetailedReportButton(function ($modalContent) {
      generateDetailedContent($modalContent);
      }
    );
    addContextMenu($detailedReportButton, [
        { id: 'reevaluate', text: 'Reevaluate', func: async function () {
          await evaluatePage(ENV.COURSE_ID, courseCode, year, ENV.WIKI_PAGE.page_id, ENV.WIKI_PAGE.body);
          await refreshData();
          let averageScore = calcCriteriaAverageScore(data, pageCriteria);
          let emoji = data.ignore ? '🚫' : calcEmoji(averageScore);
          $detailedReportButton.append(emoji);
        }},
        { id: 'disable', text: 'Toggle Ignore', func: async function () {
          console.log('disable');
        }},
        // { id: 'clearReview', text: 'Clear Review', func: () => {}}
      ]);
    let data = pageReviewData;
    let averageScore = calcCriteriaAverageScore(data, pageCriteria);
    console.log(averageScore);
    let emoji = data.ignore ? '🚫' : calcEmoji(averageScore);
    console.log(emoji);
    $detailedReportButton.append(emoji);
  })
})();