//observes the side of the page where submission details are displayed and adjusts submission videos to fill the width of that space when the page resizes.
//does not resize the video as soon as it appears. This could be the next step.
//The final version should allow the instructor to just resize the video to whatever they want. Even better would be if it saved settings using Canvas's custom data to remember what size video the instructor prefers.
function resizeContent(frame, el) {
    // Find the video element within the frame
    let videoEl = frame.find("video")[0];

    if (!videoEl) {
        console.log("No video element found.");
        return; // If no video element is found, exit the function
    }

    console.log("Found video element: ", videoEl);

    // Check if the mediaelement.js player has been initialized
    if (videoEl.player) {
        console.log("mediaelement.js player found, resizing...");

        // Use mediaelement.js native functions to resize the player
        videoEl.player.setPlayerSize('100%', 'auto');
        videoEl.player.setControlsSize();

        console.log("Video resized using mediaelement.js.");
    } else {
        console.log("mediaelement.js player not found, initializing...");

        // Initialize the player if not already initialized
        $(videoEl).mediaelementplayer({
            success: function(mediaElement, originalNode) {
                console.log("mediaelement.js player initialized, resizing...");

                // Once the player is ready, set the size
                mediaElement.setPlayerSize('100%', 'auto');
                mediaElement.setControlsSize();

                console.log("Video resized after initialization.");
            },
            error: function() {
                console.log("Failed to initialize mediaelement.js.");
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
    console.log("Resize observed, adjusting video...");
    resizeVideo($("#speedgrader_iframe").contents());
    resizeVideo($("body"));
});

resizeObserver.observe(left);
console.log("LOADED");
