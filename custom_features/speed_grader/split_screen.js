if (/^\/courses\/[0-9]+\/gradebook\/speed_grader/.test(window.location.pathname)) {
  //Split screen 50/50
  $('div#left_side').css("width", "50%");
  $('div#right_side').css("width", "50%");
}
$(document).ready(function() {
    // Create a MutationObserver to watch for the element's appearance and reappearance
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Check if the #enhanced-rubric-assessment-tray element has been added to the DOM
            const $target = $('#enhanced-rubric-assessment-tray');
            if ($target.length) {
                // Set the width to 200px
                $target.css('width', $("#right_side").css("width"));
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
});
