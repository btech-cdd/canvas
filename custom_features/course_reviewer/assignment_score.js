(async function () {
  $('#sidebar_content').css({
    'position': 'sticky',
    'top': 0,
    'max-height': '100vh'
  });
  $("#aside").css({
    'height': '90vh'
  });

  $('#sidebar_content').append(`
    <div>
      <h2>Assignment Review</h2>
    </div> 
    `)
})();