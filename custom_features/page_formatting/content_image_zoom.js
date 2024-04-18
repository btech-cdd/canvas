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
          <span class="btech-zoomed-image-modal-content-scroll-left" style="position: absolute; left: 10px; top: 50%; cursor: pointer; user-select: none;">&#9664;</span>
          <div style="text-align: center; position: relative;">
            <img class="btech-zoomed-image-modal-content" id="btech-zoomed-image-modal-img" src="${src}">
          </div>
          <span class="btech-zoomed-image-modal-content-scroll-right" style="position: absolute; right: 10px; top: 50%; cursor: pointer; user-select: none;">&#9654;</span>
        </div>
      `);
      
      $('#content').append(modal);

      $('.btech-zoomed-image-modal-content-scroll-left').click(function(e) {
        e.preventDefault();
        srcIndex -= 1;
        if (srcIndex < 0) srcIndex = srcs.length - 1;
        $('#btech-zoomed-image-modal-img').attr('src', srcs[srcIndex]);
        e.stopPropagation();
      });

      $('.btech-zoomed-image-modal-content-scroll-right').click(function(e) {
        e.preventDefault();
        srcIndex += 1;
        if (srcIndex >= srcs.length) srcIndex = 0;
        $('#btech-zoomed-image-modal-img').attr('src', srcs[srcIndex]);
        e.stopPropagation();
      });

      $(".btech-zoomed-image-modal-close").click(function(e) {
        modal.remove();
        e.stopPropagation();
      });
    });
  });
})();
