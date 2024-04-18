(function() {
  console.log("image click")
  $("#content img").each(() => {
    let img = $(this);
    if (!img.hasClass('btech-zoomed-image-modal-content')) {
      img.click(() => {
        if ($("#btech-zoomed-image-modal-img").length > 0) return;
        console.log("CLICKY");
        let modal = $(`
          <div style="display: block;" class="btech-zoomed-image-modal">
            <span class="btech-zoomed-image-modal-close">&times;</span>
            <img class="btech-zoomed-image-modal-content" id="btech-zoomed-image-modal-img">
          </div>
        `);
        $('#content').append(modal);
        let src = img.attr("src");
        console.log(src);
        $("#btech-zoomed-image-modal-img").attr("src", src);

        $(".btech-zoomed-image-modal-close").click(function(e) {
          console.log("close")
          modal.remove();
          e.stopPropagation(); // Stop the click event from bubbling up
        });
      });
    }
  });
})();
