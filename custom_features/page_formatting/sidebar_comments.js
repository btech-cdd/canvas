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
  // if we actually have something here, then reformat the page
  var container = $('.user_content').parent(); // Get the container

  // Function to align the callout box with the paragraph
  function alignCallout() {
      var contents = $('.btech-sidebar-content');
      if (contents.length == 0) return false;

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
              let border = comment.css('border');
              console.log(border);
              let borderColorRegex = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/;;
              let match = border.match(borderColorRegex);
              let highlightColor = "rgba(0, 0, 0, 0.2)";
              if (match) {
                [ , r, g, b]= match.map(Number);
                highlightColor = `rgba(${r}, ${g}, ${b}, 0.2)`
              }

              comment.css({
                'position': 'absolute'
                , 'top': contentTop + 'px'
                , 'right': '0px'
                , 'width': (MARGIN_SIZE - 20) + 'px'
                , 'border': border
                , 'border-radius': '5px'
                , 'padding': '5px'
                , 'background-color': '#F8F8F8' 
              });
              let ogBG = content.css('background-color');
              comment.on( "mouseenter", ()=>{content.css({'background-color': highlightColor})}).on( "mouseleave", ()=>{content.css({'background-color': ogBG})});
          }
      });
    return true;
  }

  // Align the callout on initial load
  if (alignCallout()) {
    container.css({
        'position': 'relative'
        , 'padding-right': MARGIN_SIZE + 'px'
    });
    // Re-align the callout box on window resize
    $(window).on('resize', alignCallout);
  }

})();