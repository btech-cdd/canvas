//observes the side of the page where submission details are displayed and adjusts submission videos to fill the width of that space when the page resizes.
//does not resize the video as soon as it appears. This could be the next step.
//The final version should allow the instructor to just resize the video to whatever they want. Even better would be if it saved settings using Canvas's custom data to remember what size video the instructor prefers.
function resizeContent(frame, el) {
    // Ensure container resizes with content
    el.css({
        "width": "100%",
        "height": "auto"
    });

    let videoDiv = frame.find(".mejs-video");
    videoDiv.css({
        "width": "100%",
        "height": "auto"
    });

    let videoEl = frame.find("video");
    videoEl.attr("controls", true);  // Ensure video controls are visible
    videoEl.css({
        "width": "100%",
        "aspect-ratio": "16 / 9",  // Ensure video maintains aspect ratio
        "height": "auto"
    });

    // Ensure the mediaelement.js wrapper resizes correctly
    let mediaElementWrapper = videoEl.closest(".mejs-mediaelement");
    mediaElementWrapper.css({
        "width": "100%",
        "height": "auto"
    });

    // Adjust each layer inside the video container
    let layers = videoDiv.find(".mejs-layer");
    layers.each(function() {
        let el = $(this);
        el.css({
            "width": "100%",
            "aspect-ratio": "16 / 9",
            "height": "auto"
        });
    });

    // Reinitialize mediaelement.js player to ensure controls are not lost
    videoEl.mediaelementplayer();
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
