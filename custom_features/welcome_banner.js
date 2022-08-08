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
showDivs(slideIndex);

function plusDivs(n) {
  showDivs(slideIndex += n);
}

function showDivs(n) {
  var i;
  var x = document.getElementsByClassName("btech-banner-slide");
  if (n > x.length) {slideIndex = 1}
  if (n < 1) {slideIndex = x.length}
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";  
  }
  x[slideIndex-1].style.display = "block";  
}
