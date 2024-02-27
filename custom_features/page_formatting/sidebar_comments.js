/*
  IF THERE ARE ANY SIDEBAR COMMENTS
    REFORMAT THE PAGE SO THERE'S A WIDER PADDING
    MOVE COMMENTS TO THE SIDE
    ADD A ON RESIZE FUNCTION TO ADJUST THE TOP OF THE COMMENT TO THE CONTENT'S HEIGHT

  TO DO
    DOESN'T HANDLE MULTIPLE COMMENTS
*/
(async function() {

  const MARGIN_SIZE = 180;
  // Function to align the callout box with the paragraph
  function alignCallout() {
      var contents = $('.btech-sidebar-content');
      if (contents.length == 0) return;

      // if we actually have something here, then reformat the page
      var container = $('.show-content'); // Get the container

      contents.each(function () {
          let content = $(this);
          var classes = content.attr('class').split(/\s+/); // Split classes into an array
          var contentId;

          // Find the class that matches the pattern
          $.each(classes, function(index, item) {
              if (item.startsWith('btech-sidebar-content-')) {
                  contentId = item.replace('btech-sidebar-content-', ''); // Extract the <id>
                  return false; // Break the loop
              }
          });

          if (contentId) {
              // Move the corresponding comment
              var commentSelector = '.btech-sidebar-comment-' + contentId;
              var comment = $(commentSelector);

              // Calculate the top position relative to the container
              let contentTop = content.offset().top - container.offset().top;
              comment.css({
                'position': 'absolute'
                , 'top': contentTop + 'px'
                , 'left': '0px'
                , 'width': (MARGIN_SIZE - 20) + 'px'
                , 'border': '1px solid red'
                , 'border-radius': '5px'
                , 'padding': '5px'
              })
              comment.css('position', 'absolute'); // Ensure the comment is positioned absolutely within the container
              comment.css('top', contentTop + 'px');
              comment.css('left', '0px');
              comment.css('width', MARGIN_SIZE + 'px');
          }
      });
  }

  //make sure there's actualy a sidebar comment to even work with before adding crap in
  var contents = $('.btech-sidebar-content');
  if (contents.length > 0) {
    // if we actually have something here, then reformat the content box to have padding on the left 
    var container = $('.show-content'); // Get the container
    container.css({
        'position': 'relative'
        , 'padding-left': MARGIN_SIZE + 'px'
    });
    // Align the callout on initial load
    alignCallout();

    // Re-align the callout box on window resize
    $(window).on('resize', alignCallout);
  }
})();