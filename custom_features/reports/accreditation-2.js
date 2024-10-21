(async function () {
    console.log("ACCREDITATION 2.0")
  //FILTER BY SECTION
  //NEW QUIZZES???
  //With assignments make sure to also grab if they did a text submission or other possible submission types
  //get comments if nothing submitted. Might be easiest to instead of attaching comments to rubric, just grab whatever appears on assignment submission and attach them to that. Then attach comments to quizzes, so the content gets all comments and rubrics is just a side thing like uploads.

  //https://bridgetools.dev/accreditation/lti.xml
  if (document.title === "BTECH Accreditation") {
    //abort if this has already been run on the page
    //If you change id name, you'll have to update the css
    if ($('#accreditation').length > 0) return;
    let rCheckInCourse = /^\/courses\/([0-9]+)/;
    if (rCheckInCourse.test(window.location.pathname)) {
      add_javascript_library("https://cdn.jsdelivr.net/npm/vue@2.6.12");
      //Allows printing of an element, may be obsolete
      add_javascript_library("https://cdnjs.cloudflare.com/ajax/libs/printThis/1.15.0/printThis.min.js");
      //convert html to a canvas which can then be converted to a blob...
      add_javascript_library("https://html2canvas.hertzen.com/dist/html2canvas.min.js");
      //and converted to a pdf
      add_javascript_library("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.1.1/jspdf.umd.js");
      //which can then be zipped into a file using this library
      add_javascript_library("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.5.0/jszip.min.js");
      //and then saved
      add_javascript_library("https://cdn.jsdelivr.net/npm/file-saver@2.0.2/dist/FileSaver.min.js");
      let CURRENT_COURSE_ID = parseInt(window.location.pathname.match(rCheckInCourse)[1]);
        await $.put(`https://btech.instructure.com/api/v1/courses/${CURRENT_COURSE_ID}/gradebook_settings`, {
            gradebook_settings: {
                show_concluded_enrollments: true
            }
        });
      //add in a selector for all students with their grade then only show assignments they've submitted so far???
      $("#content").html(`
      <div id='accreditation'>
        <div>
          If the pdf cuts off part of your evidence and you're using Chrome, try changing the layout to Landscape and/or adjusting the Scale (under More Settings) until everything fits.
        </div>
        <div>
          <input type="checkbox" id="checkbox" v-model="anonymous" />
          <label for="checkbox">Anonymize</label>
        </div>
        <div class='date-input'>
          <input type='date' v-model='startDate'>
          <input type='date' v-model='endDate'>
        </div>
        <div class='section-input'>
          <select v-model='section'>
            <option value='' selected>All Sections</option>
            <option v-for='section in sections' :value='section.id'>
              {{section.name}}
            </option>
          </select>
        </div>
        <div>
          <div v-for='group in assignmentGroups'>
            <h2>{{group.name}}</h2>
            <div 
              v-for='assignment in group.assignments'
              :style="{
                'color': getFilteredSubmissions(assignment?.submissions ?? []).length > 0 ? '#000000' : '#888888'
              }"
            >
              <div>
                <a 
                  :style="{
                    'color': getFilteredSubmissions(assignment?.submissions ?? []).length > 0 ? '#000000' : '#888888'
                  }"
                  style='cursor: pointer;' @click='currentGroup = group; console.log(assignment); openModal(assignment)'>{{assignment.name}}</a> (<span>{{getFilteredSubmissions(assignment.submissions).length}}</span><span v-else>...</span>)
              </div>
            </div>
          </div>
        </div>
        <div v-if='preparingDocument' class='btech-modal' style='display: inline-block;'>
          <div class='btech-modal-content'>
            <div class='btech-modal-content-inner'>
              <p>Please wait while content is prepared to print.</p>
            </div>
          </div>
        </div>

        <div v-if='showModal && !preparingDocument' @click="if(!preparingDocument) showModal = false;" class='btech-modal' style='display: inline-block;'>
          <div class='btech-modal-content' @click.stop>
            <div class="icon-container" style='float: right; margin-right: .5rem; margin-top: .5rem;' v-on:click='close()'>
              <i class="icon-end"></i> 
            </div>
            <div class='btech-modal-content-inner'>
              <h2><a target='#' v-bind:href="'/courses/'+courseId+'/assignments/'+currentAssignment.id">{{currentAssignment.name}}</a></h2>
              <div v-if='getFilteredSubmissions(submissions).length > 0'>
                <div
                  class="submission-row"
                >
                  <span>
                  </span>
                  <span>
                  </span>
                  <span>
                    <b>Student Name</b>
                  </span>
                  <span>
                    <b>Enroll Type</b>
                  </span>
                  <span>
                    <b>Score</b>
                  </span>
                  <span>
                    <b>Has Rubric?</b>
                  </span>
                  <span>
                    <b>Has Comments?</b>
                  </span>
                  <span>
                    <b>Date Submitted</b>
                  </span>
                  <span>
                    <b>Campus</b>
                  </span>
                </div>

                <div class="submission-row" v-for='submission in getFilteredSubmissions(submissions)'>
                  <div class='icon-container'>
                    <i class='icon-download' @click='downloadSubmission(currentAssignment, submission)'></i>
                  </div>
                  <div class='icon-container'>
                    <a target='#' v-bind:href="'/courses/'+courseId+'/assignments/'+currentAssignment.id+'/submissions/'+submission.user.id">
                      <i class='icon-student-view'></i>
                    </a>
                  </div>
                  <span>
                    {{anonymous ? ('Anonymous User ' + submission.user.id) : submission.user.name}}
                  </span>
                  <span>
                    {{enrollmentTypes?.[submission.user.id] ?? ''}}
                  </span>
                  <span>
                    {{Math.round(submission.score / currentAssignment.pointsPossible * 1000) / 10}}%
                  </span>
                  <span>
                    <i v-if="submission?.rubric_assessments?.length > 0" class='icon-check'></i>
                  </span>
                  <span>
                    <i v-if="submission?.comments?.length > 0" class='icon-check'></i>
                  </span>
                  <span>
                    {{dateToString(getSubmissionDate(submission))}}
                  </span>
                  <span>
                    {{campuses?.[submission.user.id] ?? 'Loading...'}}
                  </span>
                </div>

                <div v-else>
                  No graded submissions found. There may be submissions pending grading.
                </div>
              </div>
          </div>
        </div>
      </div>`);
      await $.getScript("https://cdn.jsdelivr.net/npm/vue@2.6.12");
      new Vue({
        el: "#accreditation",
        mounted: async function () {
          this.courseId = CURRENT_COURSE_ID;
          let data = await this.getGraphQLData(this.courseId);
          this.courseData = {
            name: data.name,
            course_code: data.course_code
          }
          let courseCode = this.courseData.course_code;
          this.assignmentGroups = data.assignment_groups;

          let sections = await canvasGet("/api/v1/courses/" + this.courseId + "/sections?include[]=students")
          this.sections = sections;

          // Load campus information
          for (let s in sections) {
            let section = sections[s];
            for (let st in section.students) {
              let student = section.students[st];
              let userData = await bridgetools.req(`https://reports.bridgetools.dev/api/students/${student.id}`);
              if (!(student.id in this.enrollmentTypes)) {
                this.enrollmentTypes[student.id] = userData.enrollment_type;
              }
              if (!(student.id in this.campuses)) {
                this.campuses[student.id] = '';
                if (userData.courses?.[courseCode]?.campus) {
                  let campus = userData.courses?.[courseCode]?.campus;
                  if (campus == 'LC') campus = 'Logan Campus';
                  else if (campus == 'BC') campus = 'Brigham City Campus';
                  this.campuses[student.id] = campus;
                }
              }
            }
          }
        },
        data: function () {
          return {
            anonymous: false,
            assignmentGroups: {},
            courseData: {},
            enrollments: [],
            courseId: null,
            currentUser: '',
            showModal: false,
            preparingDocument: false,
            submissions: [],
            currentAssignment: {},
            startDate: null,
            endDate: null,
            sections: [],
            section: '',
            needsToWait: false,
            sortBy: "name",
            campuses: {},
            enrollmentTypes: {}
          }
        },
        methods: {
          getSubmissionDate(submission) {
            let date = submission.submittedAt;
            if (date === null) {
              date = submission.gradedAt;

            }
            return date;
          },

          // a filter to determine which submissions display and which don't
          getFilteredSubmissions(submissions) {
            let app = this;
            let startDate = app.startDate;
            let endDate = app.endDate;
            let sectionId = app.section;
            let selectedSection = null;
            if (sectionId !== '') {
              for (let s = 0; s < app.sections.length; s++) {
                let section = app.sections[s];
                if (section.id === sectionId) {
                  selectedSection = section;
                  break;
                }
              }
            }
            let includedStudents = [];
            if (selectedSection !== null) {
              let sectionStudents = selectedSection.students;
              for (let s = 0; s < sectionStudents.length; s++) {
                includedStudents.push(sectionStudents[s].id);
              }
            }

            let output = [];
            for (let s = 0; s < submissions.length; s++) {
              let submission = submissions[s];
              //date filter
              let checkDate = false;
              let date = app.getSubmissionDate(submission);
              if (date !== null) {
                if ((date >= startDate || startDate === null) && (date <= endDate || endDate === null)) {
                  checkDate = true;
                }
              }

              //section filter
              //begins true for default of include all, but filter if there is a selected section
              let checkSection = true;
              if (selectedSection !== null) {
                checkSection = includedStudents.includes(submission.user_id);
              }

              //check all filters
              if (checkDate && checkSection) {
                output.push(submission);
              }
            }
            return output;
          },

          async getGraphQLData(courseId) {
            let query = `{
              course(id: "${courseId}") {
id
    name
    courseCode
    assignmentGroupsConnection {
      nodes {
        name
        groupWeight
        state
        assignmentsConnection {
          nodes {
            _id
            name
            published
            pointsPossible
            submissionsConnection(
              filter: {includeConcluded: true, includeDeactivated: true, includeUnsubmitted: true}
            ) {
              nodes {
                commentsConnection {
                  nodes {
                    comment
                    _id
                    htmlComment
                    createdAt
                    author {
                      name
                    }
                  }
                }
                user {
                  id
                  name
                  _id
                }
                submissionType
                submissionStatus
                submittedAt
                gradedAt
                postedAt
                updatedAt
                url
                attachments {
                  url
                  updatedAt
                  createdAt
                  displayName
                  contentType
                }
                score
                submissionCommentDownloadUrl
                attempt
                body
                createdAt
                deductedPoints
                enteredGrade
                excused
                extraAttempts
                grade
                late
                previewUrl
                rubricAssessmentsConnection {
                  nodes {
                    score
                    assessmentType
                  }
                }
              }
            }
          }
        }
      }
    }
  } 
            }`;
            try {
              let res = await $.post(`/api/graphql`, {
                  query: query
              });
              let data = res.data.course;
              return {
                id: courseId,
                name: data.name,
                course_code: data.courseCode,
                assignment_groups: data.assignmentGroupsConnection.nodes.filter(group => group.state == 'available').map(group => {
                  group.id = group._id;
                  group.assignments = group.assignmentsConnection.nodes.map( assignment => {
                    assignment.id = assignment._id;
                    assignment.submissions = assignment.submissionsConnection.nodes.map( submission => {
                      submission.comments = submission.commentsConnection.nodes;
                      submission.rubric_assessments = submission?.rubricAssessmentsConnection?.nodes ?? [];
                      submission.user.id = submission.user._id;
                      submission
                      return submission;
                    });
                    return assignment;
                  });
                  return group;
                })
              }
            } catch (err) {
              console.error(err);
              console.log(res);
              return {
                  name: '',
                  assignment_groups: [],
              }
            }
          },
          plainCommentToHTML(comment) {
            // Split the comment by newlines
            const paragraphs = comment.split('\n');
            
            // Filter out any empty paragraphs and wrap each in <p> tags
            const htmlParagraphs = paragraphs
              .filter(paragraph => paragraph.trim() !== "") // Remove any empty lines
              .map(paragraph => `<p>${paragraph}</p>`);     // Wrap each in <p> tags
            
            // Join the array into a single string of HTML
            return htmlParagraphs.join('');
          },
          // api call to load comments for a submission
          getComments(submission) {
            let comments = submission.comments;
            let el = "";
            if (comments.length > 0) {
              console.log(comments);
              el = $("<div style='page-break-before: always;' class='btech-accreditation-comments'></div>")
              el.append("<h2>Comments</h2>")
              for (let i = 0; i < comments.length; i++) {
                let comment = comments[i];
                let commentEl = $(`<div class='btech-accreditation-comment' style='border-bottom: 1px solid #000;'>
                  ${this.plainCommentToHTML(comment.comment)}
                  <p style='text-align: right;'><i>-${comment.author.name}, ${this.dateToString(comment.createdAt)}</i></p>
                </div>`);
                el.append(commentEl);
              }
            }
            return el;
          },

          //THIS IS WHERE EVERYTHING GETS SORTED OUT AND ALL THE DOWNLOADS ARE INITIATED
          async downloadSubmission(assignment, submission) {
            let app = this;
            let type = submission.submissionType;
            console.log(submission);
            app.preparingDocument = true;

            //this needs to be set or it will flip preparing Document to false at the end, IE if it will be pulling up a print screen, set this to true
            app.needsToWait = false;

            //vanilla quizzes
            //need to append comments to this
            if (type == 'online_quiz') {
              let url = '/courses/' + app.courseId + '/assignments/' + assignment.id + '/submissions/' + submission.user.id + '?preview=1';
              await app.createIframe(url, app.downloadQuiz, {
                'submission': submission,
                'assignment': assignment
              });
              app.needsToWait = true;
            }

            //text entry for assignments
            //append comments here and pull them from rubrics. If no text entry, just grab the comments

            //rubrics
            if (submission.rubric_assessments.length > 0) {
              let url = "/courses/" + app.courseId + "/assignments/" + assignment.id + "/submissions/" + submission.user.id;
              await app.createIframe(url, app.downloadRubric, {
                'submission': submission,
                'assignment': assignment
              });
              app.needsToWait = true;
            } else {
              let url = "/courses/" + app.courseId + "/assignments/" + assignment.id + "/submissions/" + submission.user.id;
              app.needsToWait = true;
              await app.createIframe(url, app.downloadComments, {
                'submission': submission,
                'assignment': assignment
              });
            }
            if (submission?.attachments?.length > 0) {
              for (let i = 0; i < submission.attachments.length; i++) {
                let attachment = submission.attachments[i];

                // Create an iframe and set the src to the attachment URL
                let iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = attachment.url + "?download=true"; // Append a query param to indicate download if needed

                // Append the iframe to the DOM
                document.body.appendChild(iframe);

                // Remove the iframe after the download starts
                iframe.onload = function() {
                setTimeout(() => document.body.removeChild(iframe), 1000);
                };
              }
            }

            //check if nothing has been gotten
            if (app.needsToWait === false) {
              app.preparingDocument = false;
            }
          },
          getDiscussionEntries(submission) {
            let returnString = "";
            if (submission.discussion_entries != undefined) {
              returnString += "<div style='page-break-before: always;' class='btech-accreditation-comments'></div>"
              returnString += "<h2>User Discussion Entries</h2>"
              let entries = submission.discussion_entries;
              for (let e in entries) {
                let entry = entries[e];
                if (entry.user_id == submission.user_id) {
                  returnString += `
                  ${entry.message}
                  <p style="float: right;">Created: <i>${entry.created_at}</i></p>
                  <p></p>
                  `
                }
              }
            }
            return returnString;
          },
          checkLTI(submission) {
            let type = submission.submissionType;
            //new quizzes :(
            if (type === 'basic_lti_launch') {
              let url = submission.previewUrl;
              window.open(url, '_blank');
            }
          },
          async downloadComments(iframe, content, data) {
            let app = this;
            let title = data.assignment.name + "-" + (this.anonymous ? ('Anonymous User ' + data.submission.user.id) : data.submission.user.name) + " submission comments"
            let commentEl = app.getComments(data.submission);
            let discussionEl = app.getDiscussionEntries(data.submission);
            /*
            if (commentEl == "") {
              app.preparingDocument = false;
              return; //break if no comments
            }
            */


            //Prepend in reverse order of the order you want it to appear at the top5rp
            content.show();
            content.prepend("<div>Submitted:" + app.getSubmissionDate(data.submission) + "</div>");
            content.prepend("<div>Student:" + (this.anonymous ? ('Anonymous User ' + data.submission.user.id) : data.submission.user.name) + "</div>");
            if (this.campuses?.[data.submission.user.id] ?? '' != '') {
              content.prepend("<div>Campus:" + this.campuses[data.submission.user.id] + "</div>");
            }
            content.prepend("<div>Title:" + data.assignment.name + "</div>");
            content.prepend("<div>Course:" + app.courseData.name + " (" + app.courseData.course_code + ")" + "</div>");

            //content.append(commentEl); //Comments already show up with this download method. Only need to be appended for rubrics
            content.append(discussionEl);
            let ogTitle = $('title').text();
            $('title').text(title);
            content.printThis({
              pageTitle: title,
              afterPrint: function () {
                $('title').text(ogTitle);
                app.preparingDocument = false;
                this.checkLTI(data.submission);
                iframe.remove();
             ;
              }
            });
            return;
          },
          async downloadRubric(iframe, content, data) {
            let app = this;
            let title = data.assignment.name + "-" + (this.anonymous ? ('Anonymous User ' + data.submission.user.id) : data.submission.user.name) + " submission rubric";
        
            // Wait for the iframe to load
            await new Promise(resolve => {
              $(iframe).on('load', function() {
                let iframeContent = $(this).contents();
    
                // Check if #rubric_holder is present
                let rubricHolder = iframeContent.find("#rubric_holder");
                if (rubricHolder.length > 0) {
                  rubricHolder.show();
                  // rubricHolder.prepend(`<div>${data.submission.body}</div>`);
                  rubricHolder.prepend("<div>Submitted:" + data.submission.submitted_at + "</div>");
                  rubricHolder.prepend("<div>Student:" + (this.anonymous ? ('Anonymous User ' + data.submission.user.id) : data.submission.user.name) + "</div>");
                  if (this.campuses?.[data.submission.user.id] ?? '' != '') {
                    content.prepend("<div>Campus:" + this.campuses[data.submission.user.id] + "</div>");
                  }
                  rubricHolder.prepend("<div>Title:" + data.assignment.name + "</div>");
                  let commentEl = app.getComments(data.submission);
                  rubricHolder.append(commentEl);
                  rubricHolder.css({
                    'max-height': '',
                    'overflow': 'visible'
                  });
  
                  // Continue with the rest of your function
                  let ogTitle = $('title').text();
                  $('title').text(title);
                  rubricHolder.printThis({
                    pageTitle: title,
                    afterPrint: function () {
                      $('title').text(ogTitle);
                      app.preparingDocument = false;
                      this.checkLTI(data.submission);
                      iframe.remove();
                    }
                  });
  
                  resolve(); // Resolve the promise once everything is done
                } else {
                  console.error("#rubric_holder not found");
                  resolve(); // Resolve the promise even if #rubric_holder is not found
                }
              });
            });
          },
        
          //Not currently working because of CORS
          async downloadNewQuiz(iframe, content, data) {
            console.log(content);
            console.log("NEW QUIZ");
            let app = this;
            let elId = iframe.attr('id');
            let id = elId.replace('btech-content-', '');
            let title = data.assignment.name + "-" + (this.anonymous ? ('Anonymous User ' + data.submission.user.id) : data.submission.user.name) + " submission"
            let commentEl = app.getComments(data.submission);
            content.prepend("<div>Submitted:" + data.submission.submitted_at + "</div>");
            content.prepend("<div>Student:" + (this.anonymous ? ('Anonymous User ' + data.submission.user.id) : data.submission.user.name) + "</div>");
            if (this.campuses?.[data.submission.user.id] ?? '' != '') {
              content.prepend("<div>Campus:" + this.campuses[data.submission.user.id] + "</div>");
            }
            content.prepend("<div>Title:" + data.assignment.name + "</div>");
            content.append(commentEl);
            let ogTitle = $('title').text();
            $('title').text(title);
            let window = document.getElementById(elId).contentWindow;
            window.onafterprint = (event) => {
              $('title').text(ogTitle);
              app.preparingDocument = false;
              // iframe.remove();
            }
            window.focus();
            window.print();
            return;
          },
          async downloadQuiz(iframe, content, data) {
            let app = this;
            let elId = iframe.attr('id');
            let id = elId.replace('btech-content-', '');
            let title = data.assignment.name + "-" + (this.anonymous ? ('Anonymous User ' + data.submission.user.id) : data.submission.user.name) + " submission"
            let commentEl = app.getComments(data.submission);
            content.prepend("<div>Submitted:" + data.submission.submitted_at + "</div>");
            content.prepend("<div>Student:" + (this.anonymous ? ('Anonymous User ' + data.submission.user.id) : data.submission.user.name) + "</div>");
            if (this.campuses?.[data.submission.user.id] ?? '' != '') {
              content.prepend("<div>Campus:" + this.campuses[data.submission.user.id] + "</div>");
            }
            content.prepend("<div>Title:" + data.assignment.name + "</div>");
            content.append(commentEl);
            let ogTitle = $('title').text();
            $('title').text(title);
            let window = document.getElementById(elId).contentWindow;
            window.onafterprint = (event) => {
              $('title').text(ogTitle);
              app.preparingDocument = false;
              iframe.remove();
            }
            window.focus();
            window.print();
            return;
          },
          async createIframe(url, func = null, data = {}) {
            let id = genId();
            let elId = 'btech-content-' + id
            let iframe = $('<iframe id="' + elId + '" style="width: 1200px;" src="' + url + '"></iframe>');
            // iframe.hide();

            $("#content").append(iframe);
            //This is unused. was for trying to convert an html element to a canvas then to a data url then to image then to pdf, but ran into cors issues.
            // $("#content").append("<div id='btech-export-" + id + "'></div>");
            let window = document.getElementById(elId).contentWindow;
            console.log(url);
            window.onload = function () {
              let content = $(window.document.getElementsByTagName('body')[0]);
              let imgs = content.find('img'); // I believe this was done just to make sure the images were fully loaded. Was running into issues with quizzes where images didn't have a chance to load all the way. 
              console.log(imgs);
              if (func !== null) {
                func(iframe, content, data);
              }
            }
            return iframe;
          },

          async openModal(assignment) {
            let app = this;
            app.showModal = true;
            app.currentAssignment = assignment;
            app.submissions = [];
            // if (assignment.submissions.length == 0) {
            //   await app.getAllSubmissions(assignment.id);
            // }
            app.submissions = assignment.submissions;
          },
          submittedAssignments(submissions) {
            let output = [];
            for (let i = 0; i < submissions.length; i++) {
              let submission = submissions[i];
              if (submission.workflow_state != "unsubmitted") {
                output.push(submission);
              }
            }
            return output;
          },
          dateToString(date) {
            date = new Date(Date.parse(date));
            return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
          },
          close() {
            let app = this;
            app.showModal = false;
          }
        }
      });
      let assignmentData = [];
      for (let i = 0; i < assignmentData.length; i++) {
        let group = assignmentData[i];
        $("#content").append("<h2>" + group.name + " (" + group.group_weight + "%)</h2>");
      }
    }
  }
})();
