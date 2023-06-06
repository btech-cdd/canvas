(async function() {
  function dateToString(date) {
      // Get the current year
      const year = date.getUTCFullYear();
      
      // Get the current month (0-indexed, so we add 1)
      const month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
      
      // Get the current day of the month
      const day = ('0' + date.getUTCDate()).slice(-2);
      return `${year}-${month}-${day}`;
  }
  async function calcRecommendedEndDate() {
    let holidays = {};
    let authCode = '';
    await $.get("/api/v1/users/" + ENV.current_user_id + "/custom_data/btech-reports?ns=dev.bridgetools.reports", data => {
        authCode = data.data.auth_code;
    });
    await $.get("https://reports.bridgetools.dev/api/holidays?requester_id=" + ENV.current_user_id + "&auth_code=" + authCode, function (data) {
        for (let d in data) {
        let holiday = data[d];
        holiday.date = new Date(holiday.date);
        holidays[dateToString(holiday.date)] = holiday;
      }
    });
    let user;
    await $.get("/api/v1/users/" + ENV.current_user_id + "/custom_data/btech-reports?ns=dev.bridgetools.reports", data => {
        authCode = data.data.auth_code;
    });
    await $.get("https://reports.bridgetools.dev/api/students/" + ENV.USER_ID + "?requester_id=" + ENV.current_user_id + "&auth_code=" + authCode, function (data) {
        user = data;
    });
    const DAY_TO_NAME = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ]
    //get course code
    //get course hours
    let startingDate = new Date();
    let courseHours = 60;
    let accruedHours = 0;
    let concurrentCourses = 1;
    let days = 0;
    let hasHours = false;
    if (user?.contracted_hours) {
        for (let day in user.contracted_hours) {
            let hours = user.contracted_hours[day];
            if (hours > 0) {
                hasHours = true;
                break;
            }
        }
    }

    if (!hasHours) { // no set hours? assume default of 4 hours / weekday to give an estimate
        for (let d = 1; d < 6; d++) {
            user.contracted_hours[DAY_TO_NAME[d]] = 4;
        }
    }
    count = 0;
    let endDate = startingDate;
    while (accruedHours < courseHours) {
        count++;
        if (count > 100) break;
        endDate.setDate(endDate.getDate() + 1);
        let day = endDate.getDay();
        let dayHours = user.contracted_hours?.[DAY_TO_NAME[day]] ?? 0;
        let dateString = dateToString(endDate);
        let isHoliday = holidays[dateString] !== undefined;
        if (dayHours > 0 && !isHoliday) {
            days += 1;
            accruedHours += dayHours;
        }
    }

    return endDate;
  }
  //add conclude button if hidden for not concluded but not active students
  if ($(".unconclude_enrollment_link_holder").css("display") == "none") $(".conclude_enrollment_link_holder").css("display", "block");

  let suggestedDate = await calcRecommendedEndDate();
  //The actual enrollment bit
  $(".more_user_information fieldset").append(`
    <div id="student_last_attended__component">
      <span style="margin: 0.75rem 0.5rem;">
        <div style="margin: 0.75rem 0px;">
          <span wrap="normal" letter-spacing="normal">
            <b>Set Enrollment End Date</b> 
          </span>
        </div>
        <input id="btech-enrollment-end-date" type="date" value=""> Suggested Date: <span id="btech-enrollment-suggested-date" style="cursor: pointer;">${dateToString(suggestedDate)}</span>
      </span>
    </div>
  `);

  let endAtEl = document.getElementById("btech-enrollment-end-date");
  $("#btech-enrollment-suggested-date").click(() => {
    console.log("UPDATE")
    $("#btech-enrollment-end-date").val(dateToString(endDate));
  });
  let enrollment = (await $.get(`/api/v1/courses/${ENV.COURSE_ID}/enrollments?user_id=${ENV.USER_ID}`))[0];
  let endAt = enrollment?.end_at;
  $(endAtEl).change(()=>{
    let endAtDate = new Date(endAtEl.value);
    //for...reasons, this is a day off
    endAtDate.setDate(endAtDate.getDate() + 1);
    $.post("/api/v1/courses/" + ENV.COURSE_ID + "/enrollments",
      {enrollment: {
        start_at: enrollment.start_at ?? enrollment.created_at ?? new Date(),
        end_at: endAtDate,
        user_id: enrollment.user.id,
        course_section_id: enrollment.course_section_id,
        type: enrollment.type,
        enrollment_state: "active",
        notify: false
      }}
    );
  });
  if (endAt !== undefined && endAt !== null) {
    console.log(endAt);
    endAt = new Date(endAt);

    var day = ("0" + endAt.getDate()).slice(-2);
    var month = ("0" + (endAt.getMonth() + 1)).slice(-2);

    endAt = endAt.getFullYear()+"-"+(month)+"-"+(day) ;
    console.log(endAt);
    endAtEl.value = endAt;
  }
})();