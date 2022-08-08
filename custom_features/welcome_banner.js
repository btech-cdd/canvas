let main = $("#content-wrapper");
main.prepend(`
  <div
    class="btech-banner-slides-container"
  >
    <div
      class="btech-banner-slide"
    >
      <a href="/courses/480103" target="_blank">
        <img src="` + SOURCE_URL + `/media/small_orientation_banner.png">
      </a>
    </div>
    <div
      class="btech-banner-slide"
    >
      <a href="https://btech.edu/community-resource-page/" target="_blank">
        <img src="` + SOURCE_URL + `/media/student-resources.png">
      </a>
    </div>
  </div>
`);
var slideIndex = 1;
showSlide();

function plusDivs(n) {
  slideIndex += n;
  showSlide();
}

function showDivs() {
  var i;
  var x = document.getElementsByClassName("mySlides");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  if (slideIndex > x.length) {slideIndex = 1}
  x[slideIndex-1].style.display = "block";
  setTimeout(() => { slideIndex += 1; showSlide(); }, 2000); // Change image every 2 seconds
}
