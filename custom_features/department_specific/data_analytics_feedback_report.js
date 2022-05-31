let button = $(`<button class="btn"></button>`);
$(".header-bar-right__buttons").prepend(button);
button.click(function() {
  let report = $("<div></div>");
  let assignments = await canvasGet(`/api/v1/courses/${ENV.course_id}/assignments`);
  assignments.sort(function(a, b) {
      var textA = a.name.toUpperCase();
      var textB = b.name.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
  });
  for (let a in assignments) {
      let assignment = assignments[a];
      if (assignment.name.match(/Module [0-9]+ Feedback/)) {
          console.log(assignment.name);
          report.append(`<h2>${assignment.name}</h2>`);
          let list = $("<ul></ul>");
          let submissions = await canvasGet(`/api/v1/courses/${ENV.course_id}/assignments/${assignment.id}/submissions`);
          for (let s in submissions) {
              let submission = submissions[s];
              if (submission.body != null) {
                  list.append(`<li>${submission.body}</li>`);
              }
          }
          report.append(list);
      }
  }
  let background = TOOLBAR.addBackground(true);
  background.find("#background-container").append(report.html());
  $("#background-container").css({"overflow-y": "scroll", "height": "90vh", "width": "90vw"});
});