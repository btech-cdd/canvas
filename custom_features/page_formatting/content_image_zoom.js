(function() {
  $(document).ready(function() {
    $("#content").on("click", "img:not(.btech-zoomed-image-modal-content)", function() {
      let srcs = [];
      $('#content img').each(function () {
        console.log($(this).attr('src'));
      })
      if ($("#btech-zoomed-image-modal-img").length > 0) return;
      console.log("CLICKY");
      let src = $(this).attr("src");
      let modal = $(`
        <div style="display: block;" class="btech-zoomed-image-modal">
          <span class="btech-zoomed-image-modal-close">&times;</span>
          <div style="text-align: center;">
          <img class="btech-zoomed-image-modal-content" id="btech-zoomed-image-modal-img" src="${src}">
          </div>
        </div>
      `);
      $('#content').append(modal);

      $(".btech-zoomed-image-modal-close").click(function(e) {
        console.log("close");
        modal.remove();
        e.stopPropagation();
      });
    });
  });

})();
