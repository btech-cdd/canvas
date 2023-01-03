(async function() {
  let addPeopleButton = $("#addUsers");
  let syncButton = $(`
    <a href="#" class="btn btn-primary pull-right icon-plus" style="margin-right: .5rem;" id="syncSectionDates" role="button" title="Add People" aria-label="Add People">Sync Section Dates</a>
  `)
  addPeopleButton.after(syncButton);
  syncButton.click(async function() {
    let sections = await canvasGet("/api/v1/courses/" + CURRENT_COURSE_ID + "/sections", {include: ["students"]});
    for (let s in sections) {
        let section = sections[s];
        if (section.start_at != null) {
            let students = section.students;
            for (let st in students) {
                let student = students[st];
                await $.post("/api/v1/courses/" + CURRENT_COURSE_ID + "/enrollments",
                  {enrollment: {
                        start_at: section.start_at,
                        user_id: student.id,
                        course_section_id: section.id,
                        type: "StudentEnrollment",
                        enrollment_state: "active",
                        notify: false,

                    }}
                );
            }
        }
    }
  })
  /*
  $.post("/api/v1/courses/536725/enrollments", {
    enrollment: {
        start_at: new Date("2022-02-08"),
        user_id: 2052387,
        type: "StudentEnrollment",
        enrollment_state: "active",
        notify: false
    }
  });
*/
})();