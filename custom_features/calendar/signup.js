function formatDate(date) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(date)
}

function showReservation(appointment, signupContainer, signedupContainer) {
  let start = Date.parse(appointment.start_at);
  let formattedDate = formatDate(start);
  signedupContainer.html(`
            <h3>Your Current Lab Booking</h3>
            <p> You have an appointment scheduled for the following time:</p>
            <p>` + formattedDate + `</p>
            <p>If you would like to cancel your appointment, please cancel it through your calendar.</p>`);
  /*
  cancelButton.text(formattedDate);
  cancelUrl = appointment.url;
  */
  signedupContainer.show();
  signupContainer.hide();
}
(async function () {
  //have currently commented out all of the cancel options. If have the time, implement option to cancel appointments on the page as well.
  let signupContainers = $(".btech-appointment-signup");
  if (signupContainers.length > 0) {
    signupContainers.each(async function () {
      let signupContainer = $(this);
      signupContainer.empty();
      signupContainer.append('<h3>Sign Up For a Lab Time Here</h3>');
      let signedupContainer = $('<div class="btech-appointment-signedup"></div>');
      let cancelButton = $('<div class="btn"></div>');
      signedupContainer.append(cancelButton);
      /*
      let cancelUrl = "";
      cancelButton.click(function() {
          $.delete(cancelUrl);
      });
      */
      signupContainer.after(signedupContainer);
      signupContainer.hide();
      signedupContainer.hide();

      let signedup = false;
      let signups = await canvasGet("/api/v1/appointment_groups?context_codes[]=course_" + ENV.COURSE_ID);

      for (let s in signups) {
        let signup = signups[s];
        let signupTitle = signup.title.replace(" - Instructor/Group Lab", ""); //to allow for IT naming convention
        if (ENV.QUIZ.title.includes(signupTitle)) {
          let appointmentGroupData = await canvasGet(signup.url, {
            include: ["appointments"]
          });
          let appointments = appointmentGroupData[0].appointments;
          for (let a in appointments) {
            let appointment = appointments[a];
            let reserved = appointment.reserved;
            let start = Date.parse(appointment.start_at);
            let formattedDate = formatDate(start);
            let signupButton = $('<div class="btn">' + formattedDate + '</div>');
            signupContainer.append('<br>');
            signupContainer.append(signupButton);
            signupButton.click(function () {
              let reserve = confirm("Reserve the following lab time? " + formattedDate);
              if (reserve) {
                showReservation(appointment, signupContainer, signedupContainer);
              }
            });
            if (reserved) {
              signedup = true;
              showReservation(appointment, signupContainer, signedupContainer);
            }
          }
        }
        if (!signedup) signupContainer.show();
        else signedupContainer.show();
      }
    })
  }
})();