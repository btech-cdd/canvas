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
        <div>
          Blooms Level <span style="background-color: ${bloomsColors?.[assignmentReview.blooms.toLowerCase()] ?? '#000000'}; color: #FFFFFF; padding: 0.5rem;">${assignmentReview.blooms}</span>
        </div>
        <div>
          Chunked Content <span>${ assignmentReview.chunkedContent ? '&#128512;' : '&#128546;'}</span>
        </div>
      </div> 
      `);
    console.log(reviewEl);
    $('#sidebar_content').append(reviewEl);
  }
})();