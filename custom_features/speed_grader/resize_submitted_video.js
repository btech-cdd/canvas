//observes the side of the page where submission details are displayed and adjusts submission videos to fill the width of that space when the page resizes.
//does not resize the video as soon as it appears. This could be the next step.
//The final version should allow the instructor to just resize the video to whatever they want. Even better would be if it saved settings using Canvas's custom data to remember what size video the instructor prefers.
function resizeContent(frame, el) {
    // Set the container to fill width and adjust height to auto
    el.css({
        "width": "100%",
        "height": "auto" // Allow container to automatically adjust based on content
    });

    // Find the video wrapper and set it to fill the width
    let videoDiv = frame.find(".mejs-video");
    videoDiv.css({
        "width": "100%",
        "height": "auto" // Let it adjust height as per content
    });

    // Set the aspect ratio of the video element to maintain 16:9 or similar
    let videoEl = frame.find("video");
    videoEl.css({
        "width": "100%", // Let the video take full width
        "aspect-ratio": "16 / 9", // Maintain aspect ratio automatically
        "height": "auto" // Let height be auto-adjusted
    });

    // Ensure the layers inside the video container match the video dimensions
    let layers = videoDiv.find(".mejs-layer");
    layers.each(function() {
        let el = $(this);
        el.css({
            "width": "100%",
            "aspect-ratio": "16 / 9", // Ensure all layers maintain aspect ratio
            "height": "auto"
        });
    });
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
