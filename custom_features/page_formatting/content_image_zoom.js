(function() {
  $(document).ready(function() {
    $("#content").on("click", "img:not(.btech-zoomed-image-modal-content)", function() {
      if ($("#btech-zoomed-image-modal-img").length > 0) return;
      console.log("CLICKY");
      let src = $(this).attr("src");
      let modal = $(`
        <div style="display: block; text-align: center; position: relative; height: 100vh;" class="btech-zoomed-image-modal">
          <span class="btech-zoomed-image-modal-close" style="position: absolute; top: 10px; right: 10px; cursor: pointer;">×</span>
          <img class="btech-zoomed-image-modal-content" id="btech-zoomed-image-modal-img" src="https://btech.instructure.com/courses/565875/files/108049322/preview" style="margin: auto; display: block;">
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
