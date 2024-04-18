(function() {
  $(document).ready(function() {
    $("#content").on("click", "img:not(.btech-zoomed-image-modal-content)", function() {
      let src = $(this).attr("src");
      let srcs = [];
      let srcIndex = 0;
      $('#content img').each(function () {
        let otherSource = $(this).attr('src');
        if (src = otherSource) {
          sourceIndex = srcs.length;
        }
        srcs.push(otherSource);
      });
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
