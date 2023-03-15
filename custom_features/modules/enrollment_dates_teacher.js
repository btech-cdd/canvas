(async function() {
  $(".more_user_information fieldset").append(`
    <div id="student_last_attended__component">
      <span class="fOyUs_bGBk fOyUs_UeJS" style="margin: 0.75rem 0.5rem;">
        <span class="fOyUs_bGBk fOyUs_UeJS" style="margin: 0.75rem 0px;">
          <span wrap="normal" letter-spacing="normal" class="enRcg_bGBk enRcg_ycrn enRcg_eQnG">
            Last day attended
          </span>
        </span>
        <svg name="IconCalendarMonth" viewBox="0 0 1920 1920" rotate="0" width="1em" height="1em" aria-hidden="true" role="presentation" focusable="false" class="dUOHu_bGBk dUOHu_drOs dUOHu_cRbP cGqzL_bGBk" style="width: 1em; height: 1em;">
          <g role="presentation">
          <path d="M1411.8238,9.99999997e-05 C1442.9948,9.99999997e-05 1468.2938,25.2991 1468.2938,56.4711 L1468.2938,56.4711 L1468.2938,112.9411 L1637.7058,112.9411 C1731.1088,112.9411 1807.1178,188.9511 1807.1178,282.3531 L1807.1178,282.3531 L1807.1178,1920.0001 L112.9998,1920.0001 L112.9998,282.3531 C112.9998,188.9511 189.0088,112.9411 282.4118,112.9411 L282.4118,112.9411 L451.8228,112.9411 L451.8228,56.4711 C451.8228,25.2991 477.1228,9.99999997e-05 508.2938,9.99999997e-05 C539.4658,9.99999997e-05 564.7648,25.2991 564.7648,56.4711 L564.7648,56.4711 L564.7648,112.9411 L1355.3528,112.9411 L1355.3528,56.4711 C1355.3528,25.2991 1380.6518,9.99999997e-05 1411.8238,9.99999997e-05 Z M1694.1758,564.7051 L225.9418,564.7051 L225.9418,1807.0581 L1694.1758,1807.0581 L1694.1758,564.7051 Z M677.706,1242.353 L677.706,1581.177 L338.882,1581.177 L338.882,1242.353 L677.706,1242.353 Z M1129.471,1242.353 L1129.471,1581.177 L790.647,1581.177 L790.647,1242.353 L1129.471,1242.353 Z M1581.235,1242.353 L1581.235,1581.177 L1242.412,1581.177 L1242.412,1242.353 L1581.235,1242.353 Z M564.765,1355.294 L451.824,1355.294 L451.824,1468.235 L564.765,1468.235 L564.765,1355.294 Z M1016.529,1355.294 L903.588,1355.294 L903.588,1468.235 L1016.529,1468.235 L1016.529,1355.294 Z M1468.294,1355.294 L1355.353,1355.294 L1355.353,1468.235 L1468.294,1468.235 L1468.294,1355.294 Z M677.706,790.588 L677.706,1129.412 L338.882,1129.412 L338.882,790.588 L677.706,790.588 Z M1129.471,790.588 L1129.471,1129.412 L790.647,1129.412 L790.647,790.588 L1129.471,790.588 Z M1581.235,790.588 L1581.235,1129.412 L1242.412,1129.412 L1242.412,790.588 L1581.235,790.588 Z M564.765,903.53 L451.824,903.53 L451.824,1016.471 L564.765,1016.471 L564.765,903.53 Z M1016.529,903.53 L903.588,903.53 L903.588,1016.471 L1016.529,1016.471 L1016.529,903.53 Z M1468.294,903.53 L1355.353,903.53 L1355.353,1016.471 L1468.294,1016.471 L1468.294,903.53 Z M451.8228,225.8821 L282.4118,225.8821 C251.3528,225.8821 225.9418,251.1811 225.9418,282.3531 L225.9418,282.3531 L225.9418,451.7651 L1694.1758,451.7651 L1694.1758,282.3531 C1694.1758,251.1811 1668.7648,225.8821 1637.7058,225.8821 L1637.7058,225.8821 L1468.2938,225.8821 L1468.2938,282.3531 C1468.2938,313.5251 1442.9948,338.8241 1411.8238,338.8241 C1380.6518,338.8241 1355.3528,313.5251 1355.3528,282.3531 L1355.3528,282.3531 L1355.3528,225.8821 L564.7648,225.8821 L564.7648,282.3531 C564.7648,313.5251 539.4658,338.8241 508.2938,338.8241 C477.1228,338.8241 451.8228,313.5251 451.8228,282.3531 L451.8228,282.3531 L451.8228,225.8821 Z" fill-rule="evenodd" stroke="none" stroke-width="1">
          </path>
          </g>
        </svg>
        <input id="date-override" type="date" value="">
      </span>
    </div>
  `)
  return

  let dateOverride = document.getElementById("date-override");
  let name = $(picker).val();
  let enrollment = users[name];
  $(dateOverride).change(()=>{
    if (startAt != undefined) {
      let startDate = new Date(dateOverride.value);
      //for...reasons, this is a day off
      startDate.setDate(startDate.getDate() + 1);
      $.post("/api/v1/courses/" + ENV.COURSE_ID + "/enrollments",
        {enrollment: {
          start_at: startDate,
          user_id: enrollment.user.id,
          course_section_id: enrollment.course_section_id,
          type: "StudentEnrollment",
          enrollment_state: "active",
          notify: false,

        }}
      );
    }
  });
  let startAt = enrollment?.start_at;
  if (startAt !== undefined) {
    startAt = new Date(startAt);

    var day = ("0" + startAt.getDate()).slice(-2);
    var month = ("0" + (startAt.getMonth() + 1)).slice(-2);

    startAt = startAt.getFullYear()+"-"+(month)+"-"+(day) ;
    dateOverride.value=startAt;
  }

  let users = {}
  let enrollments = await canvasGet(`/api/v1/courses/${ENV.COURSE_ID}/enrollments`, {state: ['active'], type: ['StudentEnrollment']});
  for (let e in enrollments) {
    let enrollment = enrollments[e];
      if (users?.[enrollment.user.name] == undefined) {
      users[enrollment.user.name] = enrollment;
      } else {
          console.log("DUP");
      }
  }
})();