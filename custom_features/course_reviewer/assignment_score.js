(async function () {
  // do we have a review?
  let assignmentReviews = [];
  try {
    assignmentReviews = await bridgetoolsReq('https://reports.bridgetools.dev/api/courses/586001/assignments/6280836');
  } catch (err) {
    console.log(err);
  }
  const bloomsColors = {
    'remember': '#a222a2',
    'understand': '#2222a2',
    'apply': '#22a222',
    'analyze': '#a2a222',
    'evaluate': '#a27222',
    'create': '#a22232' 
  }
  const clarityEmoji = [
    '',
    '&#128546',
    '&#128528',
    '&#128512;',
  ]
  if (assignmentReviews?.length > 0) {
    let assignmentReview = assignmentReviews[0];
    console.log(assignmentReview);    
    $('#sidebar_content').css({
      'position': 'sticky',
      'top': 0,
      'max-height': '100vh'
    });
    $("#aside").css({
      'height': '90vh'
    });

    console.log(assignmentReview.blooms);

    let reviewEl = $(`
      <div style="padding: 8px 0;">
        <h2>Assignment Review</h2>
        <div style="margin-bottom: 0.5rem; display: inline-block;">
          <span style="background-color: ${bloomsColors?.[assignmentReview.blooms.toLowerCase()] ?? '#000000'}; color: #FFFFFF; padding: 0.5rem; display: inline-block; border-radius: 0.5rem; display: inline-block;">${assignmentReview.blooms}</span>
        </div>
        <div title="Instructions are written clearly and sequentially without lots of extraneous information.">
          <span style="width: 5rem; display: inline-block;">Clarity</span><span>${ clarityEmoji?.[assignmentReview.clarity] ?? ''}</span>
        </div>
        <div title="Content is chunked with headers, call out boxes, lists, etc.">
          <span style="width: 5rem; display: inline-block;">Chunking</span><span>${ assignmentReview.chunked_content ? '&#128512;' : '&#128546;'}</span>
        </div>
        <div>
          <span style="width: 5rem; display: inline-block;">Outcomes</span><span>${ assignmentReview.includes_outcomes? '&#128512;' : '&#128546;'}</span>
        </div>
        <div>
          <span style="width: 5rem; display: inline-block;">Industry</span><span>${ assignmentReview.career_relevance? '&#128512;' : '&#128546;'}</span>
        </div>
        <div style="margin-top: 0.5rem; display: inline-block;">
          <h2>AI Feedback</h2>
          <p>${assignmentReview.feedback}</p>
        </div>
      </div> 
      `);
    console.log(reviewEl);
    $('#sidebar_content').append(reviewEl);
  }
})();