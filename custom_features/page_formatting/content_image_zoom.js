(function() {
  var showingImage = false;
  console.log("image click")
  $("#content img").each(function() {
    $(this).click(() => {
      if (!showingImage) {
        showingImage = true;
        console.log("CLICKY");
        let modal = $(`
          <div style="display: block;" class="btech-zoomed-image-modal">
            <span class="btech-zoomed-image-modal-close">&times;</span>
            <img class="btech-zoomed-image-modal-content" id="btech-zoomed-image-modal-img">
          </div>
        `);
        $('#content').append(modal);
        let src = $(this).attr("src");
        $("#btech-zoomed-image-modal-img").attr("src", src);

        $(".btech-zoomed-image-modal-close").click(function() {
          console.log("close")
          showingImage = false;
          modal.remove();
        });
      }
    });
  });
})();