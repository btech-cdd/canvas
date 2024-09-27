//observes the side of the page where submission details are displayed and adjusts submission videos to fill the width of that space when the page resizes.
//does not resize the video as soon as it appears. This could be the next step.
//The final version should allow the instructor to just resize the video to whatever they want. Even better would be if it saved settings using Canvas's custom data to remember what size video the instructor prefers.
function resizeContent(frame, el) {
    // Find the video element within the frame
    let videoEl = frame.find("video");

    if (videoEl.length === 0) {
        console.log("No video element found in frame.");
        return; // If no video element is found, exit the function
    }

    console.log("Found video element: ", videoEl);

    // Check if the mediaelement.js player has been initialized
    if (videoEl[0].player) {
        console.log("mediaelement.js player found, resizing...");

        // Use mediaelement.js native functions to resize the player
        videoEl[0].player.setPlayerSize('100%', 'auto');
        videoEl[0].player.setControlsSize();

        // Ensure the video itself is set to 100% width
        videoEl.css({
            width: '100%',
            height: 'auto'
        });

        // Force the container of the player to resize
        let playerContainer = videoEl.closest('.mejs-container');
        playerContainer.css({
            width: '100%',
            height: 'auto'
        });

        // Resize the overlay and control layers within the player container
        let overlayLayers = playerContainer.find('.mejs-layer');
        overlayLayers.css({
            width: '100%',
            height: playerContainer.height(), // Make sure the overlay matches the container height
            position: 'absolute',
            top: 0,
            left: 0,
        });

        console.log("Overlay layers resized.");
    } else {
        console.log("mediaelement.js player not found, initializing...");

        // Initialize the player if not already initialized
        videoEl.mediaelementplayer({
            success: function(mediaElement, originalNode) {
                console.log("mediaelement.js player initialized, resizing...");

                // Once the player is ready, set the size
                mediaElement.setPlayerSize('100%', 'auto');
                mediaElement.setControlsSize();

                // Ensure the video tag itself has 100% width
                $(mediaElement).css({
                    width: '100%',
                    height: 'auto'
                });

                // Resize the container
                let playerContainer = $(mediaElement).closest('.mejs-container');
                playerContainer.css({
                    width: '100%',
                    height: 'auto'
                });

                // Resize the layers (controls, overlays) inside the mediaelement.js container
                let overlayLayers = playerContainer.find('.mejs-layer');
                overlayLayers.css({
                    width: '100%',
                    height: playerContainer.height(),
                    position: 'absolute',
                    top: 0,
                    left: 0,
                });

                console.log("Overlay layers resized after initialization.");
            },
            error: function() {
                console.log("Failed to initialize mediaelement.js.");
            }
        });
    }
}

function resizeVideo(iframeContent) {
    // Check and resize content in iframe
    let box = iframeContent.find("#media_recording_box");
    if (box.length === 0) {
        console.log("No media recording box found.");
    } else {
        resizeContent(iframeContent, box);
    }

    let comment = iframeContent.find('.instructure_inline_media_comment').parent();
    if (comment.length === 0) {
        console.log("No media comment found.");
    } else {
        resizeContent(iframeContent, comment);
    }
}

// Ensure iframe is loaded before trying to resize its content
$("#speedgrader_iframe").on('load', function() {
    // Once the iframe is loaded, get its content
    let iframeContent = $("#speedgrader_iframe").contents();
    if (iframeContent.length === 0) {
        console.log("Failed to access iframe content.");
        return;
    }

    console.log("Iframe loaded, adjusting video...");
    resizeVideo(iframeContent);

    // Attach a resize observer to adjust video size when the iframe content is resized
    let left = $("#left_side")[0];
    let resizeObserver = new ResizeObserver(() => {
        console.log("Resize observed, adjusting video...");
        resizeVideo(iframeContent);
    });

    resizeObserver.observe(left);
});

console.log("LOADED");
