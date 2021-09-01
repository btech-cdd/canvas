(async function () {
  //have currently commented out all of the cancel options. If have the time, implement option to cancel appointments on the page as well.
  let signupContainers = $(".btech-appointment-signup");
  if (signupContainers.length > 0) {
    signupContainers.each(async function () {
      let signupContainer = $(this);
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

      function showReservation(appointment) {
        let start = Date.parse(appointment.start_at);
        let formattedDate = formatDate(start);
        signedupContainer.html(`<p> You have an appointment scheduled for the following time:</p>
          <p>` + formattedDate + `</p>
          <p>If you would like to cancel your appointment, please cancel it through your calendar.</p>`);
        /*
        cancelButton.text(formattedDate);
        cancelUrl = appointment.url;
        */
        signedupContainer.show();
        signupContainer.hide();
      }
      for (let s in signups) {
        let signup = signups[s];
        if (ENV.QUIZ.title.includes(signup.title)) {
          console.log(signup.url);
          let appointmentGroupData = await canvasGet(signup.url, {
            include: ["appointments"]
          });
          let appointments = appointmentGroupData[0].appointments;
          for (let a in appointments) {
            let appointment = appointments[a];
            let reserved = appointment.reserved;
            console.log(reserved);
            let start = Date.parse(appointment.start_at);
            let formattedDate = formatDate(start);
            let signupButton = $('<div class="btn">' + formattedDate + '</div>');
            signupContainer.append('<br>');
            signupContainer.append(signupButton);
            signupButton.click(function () {
              let reserve = confirm("Reserve the following lab time? " + formattedDate);
              if (reserve) {
                $.post(appointment.reserve_url, function (data) {
                  console.log(data);
                });
                showReservation(appointment);
              }
            });
            if (reserved) {
              signedup = true;
              showReservation(appointment);
            }
            console.log(formattedDate);
          }
        }
        if (!signedup) signupContainer.show();
        else signedupContainer.show();
      }
    })
  }
})();