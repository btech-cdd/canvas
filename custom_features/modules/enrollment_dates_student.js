$(".header-bar").append("<div id='end-of-course-date-countdown'></div>");
setInterval(async() => {
  let data = (await $.get(`/api/v1/courses/${ENV.COURSE_ID}/enrollments?user_id=self`))[0];
  if (data.start_at == undefined || data.end_at == undefined) return;
  let endAt = Date.parse(data.end_at);
  // Get today's date and time
  var now = new Date().getTime();
  
  // Find the distance between now and the count down date
  var distance = endAt - now;
  
  // Time calculations for days, hours, minutes and seconds
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
  // Display the result in the element with id="demo"
  if (days < 10) $("#end-of-course-date-countdown").html(days + "d " + hours + "h " + minutes + "m " + seconds + "s ");
  else $("#end-of-course-date-countdown").html(days + "d");
  
  // If the count down is finished, write some text
  if (distance < 0) {
    clearInterval(x);
    document.getElementById("end-of-course-date-countdown").innerHTML = "EXPIRED";
  }
}, 1000);