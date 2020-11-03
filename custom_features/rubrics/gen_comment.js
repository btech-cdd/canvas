//change this to have the comment not include any HTML
(function () {
  IMPORTED_FEATURE = {};
  let rWindowSpeedGrader = /^\/courses\/[0-9]+\/gradebook\/speed_grader/;
  let rWindowVanilla = /^\/courses\/[0-9]+\/assignments\/[0-9]+\/submissions\/[0-9]+/;
  if (rWindowSpeedGrader.test(window.location.pathname) || rWindowVanilla.test(window.location.pathname)) {
    IMPORTED_FEATURE = {
      courseId: null,
      assignmentId: null,
      studentId: null,
      initiated: false,
      _init() {
        let feature = this;
        feature.getData();
        $(".save_rubric_button").on("click", function () {
          feature.genRubricComment("div#rubric_full", 2);
        });
        feature.parseCommentHTML();
      },

      async parseCommentHTML() {
        let feature = this;
        let element = await getElement("div.comment span, tr.comments");
        element.each(function () {
          var html = $(this).html();
          html = html.replace(/&lt;(\/{0,1}.+?)&gt;/g, "<$1>");
          $(this).html(html);

          let collapses = $(this).find('div.btech-comment-collapse');
          //go through each comment
          collapses.each(function () {
            let parent = $(this).parent();
            if (parent.find("h4.btech-toggler").length === 0) {
              //make sure there's not already a toggler for this comment
              let criteria_id = "criteria_" + genId();
              let toggleHeader = '<br><h4 class="element_toggler btech-toggler" role="button" aria-controls="' + criteria_id + '" aria-expanded="false" aria-label="Toggler toggle list visibility"><i class="fal fa-comments" aria-hidden="true"></i><strong>Individual Criteria</strong></h4><br>';
              $(this).attr("id", criteria_id);
              $(this).css("display", "none");
              $(toggleHeader).insertBefore(this);
            }
          });
        });
      },

      async createObserver() {
        let feature = this;
        let selector;
        if (rWindowSpeedGrader.test(window.location.pathname)) {
          selector = "div#comments";
        }
        if (rWindowVanilla.test(window.location.pathname)) {
          selector = "div.comment_list";
        }
        let element = await getElement(selector);
        let observer = new MutationObserver(function (mutations) {
          feature.parseCommentHTML();
          observer.disconnect();
        });
        let config = {
          childList: true,
          subtree: true
        };
        observer.observe(element[0], config);
      },

      getData() {
        let feature = this;
        if (rWindowSpeedGrader.test(window.location.pathname)) {
          feature.courseId = parseInt(ENV.course_id);
          feature.studentId = ENV.RUBRIC_ASSESSMENT.assessment_user_id;
          feature.assignmentId = ENV.assignment_id;
        }

        if (rWindowVanilla.test(window.location.pathname)) {
          let rPieces = /^\/courses\/([0-9]+)\/assignments\/([0-9]+)\/submissions\/([0-9]+)/;
          let pieces = window.location.pathname.match(rPieces);
          feature.courseId = parseInt(pieces[1]);
          feature.studentId = parseInt(pieces[3]);
          feature.assignmentId = parseInt(pieces[2]);
        }
      },
      checkTimeDif(submissionData) {
        comments = submissionData[0].submission_comments;
        let checkTimeDif = (feature.setTime == null);
        for (let c = 0; c < comments.length; c++) {
          let comment = comments[c];
          if (comment.comment.includes("RUBRIC")) {
            feature.attempts += 1;
          }
          if (feature.setTime !== null) {
            let timeDif = feature.setTime - new Date(comment.created_at);
            if (timeDif < 10000) {
              checkTimeDif = true;
            }
          }
        }
        return checkTimeDif;
      },

      async genRubricComment(rubricSelector, offset = 1) {
        let feature = this;
        feature.getData(); //must come first since it sets the course, student, and assignment ids
        let submissions = await canvasGet('/api/v1/courses/' + feature.courseId + '/assignments/' + feature.assignmentId + '/submissions/' + feature.studentId + '?include[]=rubric_assessment')
        let checkTimeDif = feature.checkTimeDif(submissions);
        if (checkTimeDif === false) {
          feature.genRubricComment(rubricSelector, offset);
        } else {
          console.log(submissions);
          let comment = "";
          let header = "<h2><b>RUBRIC</b></h2>";
          let totalMax = 0;
          let totalCrit = 0;
          header += ($("#rubric_holder").find("[data-selenium='rubric_total']").text() + "\n");
          console.log('test');

          $(rubricSelector).find("tr.rubric-criterion").each(function () {
            let description = $(this).find("th.description-header").find("div.description").text();
            console.log(description);
            let points_val = $(this).find("td.criterion_points").find("div.graded-points").find("input").val();
            let points = $(this).find("td.criterion_points").find("div.graded-points").text();
            points = points.replace("/", "").replace(" pts", "").replace("Points", "");
            totalCrit += 1;
            points = ("" + points).trim();
            points_val = ("" + points_val).trim();
            if (points === points_val) {
              totalMax += 1;
            }
            description = description.replace("This criterion is linked to a Learning Outcome", "");
            comment += (description + "\n" + points_val + "/" + points + "\n");
          });
          header += ("Total Criteria at Full Points: " + totalMax + "/" + totalCrit);
          comment = header + '\n<div class="btech-comment-collapse">\n' + comment + '\n</div>';
          let url = "/api/v1/courses/" + feature.courseId + "/assignments/" + feature.assignmentId + "/submissions/" + feature.studentId;
          $.put(url, {
            comment: {
              text_comment: comment
            }
          });
          feature.createObserver();
        }
      }
    }
  }
})();