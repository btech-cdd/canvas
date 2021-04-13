//observes the side of the page where submission details are displayed and adjusts submission videos to fill the width of that space when the page resizes.
//does not resize the video as soon as it appears. This could be the next step.
//The final version should allow the instructor to just resize the video to whatever they want. Even better would be if it saved settings using Canvas's custom data to remember what size video the instructor prefers.
function resizeVideo(frame) {
    let container = frame.find("#media_recording_box");
    container.width("100%");
    let videoDiv = frame.find(".mejs-video");
    videoDiv.width("100%");
    let width = videoDiv.width();
    videoDiv.height(videoDiv.width() * .66);
    let videoEl = frame.find("video");
    videoEl.width(width);
    videoEl.height(videoEl.width() * .66);
    videoEl.css({
        "width": videoEl.width(),
        "height": videoEl.height()
    });
    let layers = videoDiv.find(".mejs-layer");
    layers.each(function() {
        let el = $(this);
        el.width(width);
        el.height($(this).width() * .66);
        el.css({
            "width": el.width(),
            "height": el.height()
        });
    });
}
let left = $("#left_side")[0];
let resizeObserver = new ResizeObserver(() => { 
    resizeVideo($("#speedgrader_iframe").contents());
    resizeVideo($("body"));
}); 
    
resizeObserver.observe(left);
console.log("LOADED");