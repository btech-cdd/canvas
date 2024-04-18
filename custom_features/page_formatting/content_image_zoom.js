(function() {
  $(document).ready(function() {
    $("#content").on("click", "img:not(.btech-zoomed-image-modal-content)", function() {
      let src = $(this).attr("src");
      let srcs = [];
      $('#content img').each(function () {
        srcs.push($(this).attr('src'));
      });
      let srcIndex = srcs.indexOf(src);
      console.log(srcs);
      console.log(srcIndex);
      if ($("#btech-zoomed-image-modal-img").length > 0) return;
      console.log("CLICKY");
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
