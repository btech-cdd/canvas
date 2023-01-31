console.log("IMG ZOOM");
window.onload = function() {
  $("span").each(function() {
    let el = $(this);
    console.log(el);
    let bgimg = el.css("background-image");
    if (bgimg != "none") {
      console.log(bgimg);
        let hoverimg = $(el.clone());
        hoverimg.css({
            width: "256px",
            height: "256px",
            position: "absolute",
            "margin-left": "-96px",
            "margin-top": "-96px",
            "pointer-events": "none",
            "z-index": 10000000
        });
        el.before(hoverimg);
        hoverimg.hide();
        el.hover(
            function() {
                hoverimg.show();
            },
            function() {
                hoverimg.hide();
            }
        );
    }
  });
}