(async function () {
  // do we have a review?
  let assignmentReviews = [];
  try {
    assignmentReviews = await bridgetoolsReq('https://reports.bridgetools.dev/api/courses/586001/assignments/6280836');
  } catch (err) {
    console.log(err);
  }
  const bloomsColors = {
    'remember': '#d222d2',
    'understand': '#2222d2',
    'apply': '#22d222',
    'analyze': '#d2d222',
    'evaluate': '#d28222',
    'create': '#d22232' 
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

    $('#sidebar_content').append(`
      <div style="padding: 8px 0;">
        <h2>Assignment Review</h2>
        <div>
          Blooms Level <span style="background-color: ${bloomsColors?.[assignmentReview.blooms.toLowerCase()] ?? '#FFFFFF'}>${assignmentReview.blooms}</span>
          Chunked Content <span>${ assignmentReview.chunkedContent ? '&#128512;' : '&#128546;'}</span>
        </div>
      </div> 
      `)
  }
})();