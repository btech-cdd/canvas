(function () {
  console.log("HIDE");
  let imgs = $(".btech-graphic-image");
  imgs.each(function () {
    let img = $(this);
    let wrapper = $("<div class='btech-graphic-image-wrapper'></div>");
    img.wrap(wrapper);
    let button = $("<div class='btech-graphic-image-button'>Reveal</div>")
    img.after(button);
    button.click(function() {
      button.remove();
      img.unwrap();
      img.removeClass('btech-graphic-image');
    })
  });
})();