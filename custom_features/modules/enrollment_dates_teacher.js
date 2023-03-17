(async function() {
  $(".more_user_information fieldset").append(`
    <div id="student_last_attended__component">
      <span style="margin: 0.75rem 0.5rem;">
        <div style="margin: 0.75rem 0px;">
          <span wrap="normal" letter-spacing="normal">
            <b>Set Enrollment End Date</b> 
          </span>
        </div>
        <input id="enrollment-end-date" type="date" value="">
      </span>
    </div>
  `)

  let endAtEl = document.getElementById("enrollment-end-date");
  let enrollment = (await $.get(`/api/v1/courses/${ENV.COURSE_ID}/enrollments?user_id=${ENV.USER_ID}`))[0];
  let endAt = enrollment?.end_at;
  console.log(endAt);
  $(endAtEl).change(()=>{
    if (endAt != undefined) {
      let endAtDate = new Date(endAtEl.value);
      //for...reasons, this is a day off
      endAtDate.setDate(endAtDate.getDate() + 1);
      $.post("/api/v1/courses/" + ENV.COURSE_ID + "/enrollments",
        {enrollment: {
          start_at: enrollment.start_at ?? new Date(),
          end_at: endAtDate,
          user_id: enrollment.user.id,
          course_section_id: enrollment.course_section_id,
          type: enrollment.type,
          enrollment_state: "active",
          notify: false
        }}
      );
    }
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