(async function() {
  var observeDOM = (function(){
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    return function( obj, callback ){
      if( !obj || obj.nodeType !== 1 ) return; 

      if( MutationObserver ){
        // define a new observer
        var mutationObserver = new MutationObserver(callback)

        // have the observer observe for changes in children
        mutationObserver.observe( obj, { attributes :true })
        return mutationObserver
      }
      
      // browser support fallback
      else if( window.addEventListener ){
        obj.addEventListener('DOMNodeInserted', callback, false)
        obj.addEventListener('DOMNodeRemoved', callback, false)
      }
    }
  })()
  let picker = $("body").find("input[data-testid='course-pace-picker']")[0];
  observeDOM( picker, function(m){ 
      $($("div[data-testid='coursepace-end-date']")[0]).parent().after(`<span><b>Date Override</b><br><input id="date-override" type="date" value=""></span>`);
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
  });

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

/*
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
})();
*/