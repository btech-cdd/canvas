//observes the side of the page where submission details are displayed and adjusts submission videos to fill the width of that space when the page resizes.
//does not resize the video as soon as it appears. This could be the next step.
//The final version should allow the instructor to just resize the video to whatever they want. Even better would be if it saved settings using Canvas's custom data to remember what size video the instructor prefers.
function resizeContent(frame, el) {
    // Find the video element within the frame
    let videoEl = frame.find("video")[0];

    // Ensure the video has been initialized by mediaelement.js
    if (videoEl) {
        // Initialize the player if not already initialized
        $(videoEl).mediaelementplayer({
            success: function(mediaElement, originalNode) {
                // Once the player is ready, set the size
                mediaElement.setPlayerSize('100%', 'auto');
                mediaElement.setControlsSize();
            }
        });
    }
}

function resizeVideo(frame) {
    let box = frame.find("#media_recording_box");
    resizeContent(frame, box);
    let comment = frame.find('.instructure_inline_media_comment').parent();
    resizeContent(frame, comment);
}

// Observe left-side resizing and adjust video accordingly
let left = $("#left_side")[0];
let resizeObserver = new ResizeObserver(() => {
    resizeVideo($("#speedgrader_iframe").contents());
    resizeVideo($("body"));
});

resizeObserver.observe(left);
console.log("LOADED");
