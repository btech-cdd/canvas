(async function () {
  async function getComment(courseId, assignmentId, studentId) {
    let url = "/api/v1/courses/" + courseId + "/assignments/" + assignmentId + "/submissions/" + studentId;
    let comments = [];
    let data = await canvasGet(url, {
      include: [
        'submission_comments'
      ]
    });
    let stars;
    if (rAssignment.test(window.location.pathname)) {
      stars = $('table .ratings .rating .icon-star');
    } else if (rSpeedgrader.test(window.location.pathname + window.location.search)) {
      stars = $('table .rating-tier .icon-star');
    }
    stars.each(function () {
      let star = $(this);
      star.remove();
    });
    comments = data[0].submission_comments;
    for (let c = 0; c < comments.length; c++) {
      let comment = comments[c];
      if (comment.comment.includes("#SELF EVALUATION#")) {
        if (comment !== null) {
          let lines = comment.comment.match(/_[0-9]+: .+?$/gm);
          for (let l = 0; l < lines.length; l++) {
            let line = lines[l];
            let parts = line.match(/(_[0-9]+): (.+?)$/);
            let id = parts[1];
            let val = parts[2];
            savedCriteria[id] = val;
            let row = $('#criterion_' + id);
            let ratings;
            if (rAssignment.test(window.location.pathname)) {
              ratings = row.find('.ratings .rating');
            } else if (rSpeedgrader.test(window.location.pathname + window.location.search)) {
              ratings = row.find('.rating-tier');
            }
            ratings.each(function () {
              let rating = $(this);
              rating.css({
                'position': 'relative'
              });
              let description;
              if (rAssignment.test(window.location.pathname)) {
                description = rating.find('.rating_description_value').text();
              } else if (rSpeedgrader.test(window.location.pathname + window.location.search)) {
                description = rating.find('.rating-description').text();
              }
              if (description == val) {
                rating.append(`<i class="icon-star" style="position:absolute; right: 0.5em; bottom: 0.5em;"></i>`);
              }
            });

          }
        }
        return comment;
      }
    }
    return null;
  }

  async function updateComment(criterionId, criterionValue, courseId, assignmentId, studentId) {
    savedCriteria[criterionId] = criterionValue;
    //Add in a try on the delete, if it fails break, wait, and then rerun the function a second later, rinse repeat
    if (selfEvaluation !== null) {
      await $.delete(window.location.origin + "/submission_comments/" + selfEvaluation.id);
    }
    let comment = "#SELF EVALUATION#\n";
    for (let id in savedCriteria) {
      let value = savedCriteria[id];
      comment += (id + ": " + value + "\n");
    }
    let url = "/api/v1/courses/" + courseId + "/assignments/" + assignmentId + "/submissions/" + studentId;
    await $.put(url, {
      comment: {
        text_comment: comment
      }
    });
    selfEvaluation = await getComment(courseId, assignmentId, studentId);
    return;
  }
  let rAssignment = /courses\/([0-9]+)\/assignments\/([0-9]+)/;
  let rSpeedgrader = /courses\/([0-9]+)\/gradebook\/speed_grader\?assignment_id=([0-9]+)&student_id=([0-9]+)/;
  let savedCriteria = {};
  let selfEvaluation;
  if (rAssignment.test(window.location.pathname)) {
    let urlData = window.location.pathname.match(rAssignment);
    let courseId = urlData[1];
    let assignmentId = urlData[2];
    let studentId = ENV.current_user_id;
    selfEvaluation = await getComment(courseId, assignmentId, studentId);
    let criteria = $('.rubric_table tr.criterion');
    criteria.each(function () {
      let id = $(this).attr('id').replace('criterion_', '');
      let ratings = $(this).find('.ratings .rating');
      ratings.each(function () {
        let rating = $(this);
        rating.css({
          'cursor': 'pointer',
          'position': 'relative'
        });
        let description = rating.find('.rating_description_value').text();
        rating.click(function () {
          updateComment(id, description, courseId, assignmentId, studentId);
        });
      });
    });
  } else if (rSpeedgrader.test(window.location.pathname + window.location.search)) {
    let urlData = (window.location.pathname + window.location.search).match(rSpeedgrader);
    let courseId = urlData[1];
    let assignmentId = urlData[2];
    let studentId = urlData[3];
    console.log(studentId);
    let btn = await getElement('button.toggle_full_rubric');
    console.log('found');
    btn.click(function () {
      console.log("CLICK");
      let rubric = ENV.rubric.criteria;
      $(".for_grading table tr").each(function () {
        let row = $(this);
        let description = $(row.find('th')[0]).text();
        console.log(description);
        for (let r = 0; r < rubric.length; r++) {
          let criterion = rubric[r];
          if (criterion.description == description) {
            row.attr('id', 'criterion_' + criterion.id);
          }
        }
      });
      console.log("GET");
      getComment(courseId, assignmentId, studentId);
    });
  }
})()