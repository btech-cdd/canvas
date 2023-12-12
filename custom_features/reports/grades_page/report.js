(async function () {
  class Column {
    constructor(name, description, width, average, sort_type) {
      this.name = name;
      this.description = description;
      this.width = width;
      this.average = average;
      this.sort_type = sort_type; //needs to be a result of typeof, probably mostly going to be string or number
      this.sort_state = 0; //becomes 1 or -1 depending on asc or desc
      this.visible = true;
    }
  }
  async function postLoad() {
    let vueString = '';
    await $.get(SOURCE_URL + '/custom_features/reports/grades_page/template.vue', null, function (html) {
      vueString = html.replace("<template>", "").replace("</template>", "");
    }, 'text');
    let canvasbody = $("#application");
    canvasbody.after('<div id="canvas-grades-report-vue"></div>');
    $("#canvas-grades-report-vue").append(vueString);
    let gen_report_button = $('<a class="Button" id="canvas-grades-report-vue-gen">Report</a>');
    let new_grades = $('div.header-buttons');
    let old_grades = $('div#gradebook-toolbar');
    if (new_grades.length > 0) gen_report_button.appendTo(new_grades);
    if (old_grades.length > 0) gen_report_button.appendTo(old_grades);
    let modal = $('#canvas-grades-report-vue');
    modal.hide();
    gen_report_button.click(function () {
      let modal = $('#canvas-grades-report-vue');
      modal.show();
      $.post("https://tracking.bridgetools.dev/api/hit", {
        "tool": "reports-grades_page",
        "canvasId": ENV.current_user_id
      });
    });
    new Vue({
      el: '#canvas-grades-report-vue',
      mounted: async function () {
        let app = this;
        this.courseId = ENV.context_asset_string.replace("course_", "");
        await this.createGradesReport();
        await app.processStudentsData();
        app.updateStudents();
        await app.processStudentsAssignmentData();
        app.updateStudents();
        this.loading = false;
      },

      data: function () {
        return {
          courseId: null,
          colors: bridgetools.colors,
          students: [],
          columns: [
            new Column('Name', 'The student\'s name as it appears in Canvas.', 10, false, 'string'),
            new Column('Section', 'The section in which the student is enrolled in this course.', 10, false, 'string'),
            new Column('To Date', 'The student\'s grade based on assignments submitted to date.', 3, true, 'number'),
            new Column('Final', 'The student\'s final grade. All unsubmitted assignments are graded as 0. This is their grade if they were to conclude the course right now.', 3, true, 'number'),
            new Column('Progress Estimate', 'This is an estimate of the student\'s progress baed on the cirterion selected above.', 12, true, 'number'),
            new Column('Last Submit', 'The number of days since the student\'s last submission.', 3, true, 'number'),
            new Column('In Course', 'The number of days since the student began the course.', true, 3, 'number')
            // new Column('Ungraded', '', true, 3, 'number')
          ],
          sections: [],
          studentData: [],
          studentsData: {},
          loading: false, //CHANGE: return this to true if this doesn't work
          menu: '',
          progress_method: "points_weighted",
          section_names: ['All'],
          section_filter: 'All'
        }
      },
      computed: {
        visibleColumns: function () {
          return this.columns.filter(function (c) {
            return c.visible;
          })
        }
      },
      methods: {
        updateStudents() {
          let app = this;
          let students = [];
          for (s in app.studentsData) {
            let student = app.studentsData[s];
            students.push(student);
          }
          this.students = students;
        },
        async processStudentsData() {
          let app = this;
          for (let s = 0; s < app.studentData.length; s++) {
            let studentData = app.studentData[s];
            let userId = studentData.id;
            let enrollment = null;

            for (let e = 0; e < studentData.enrollments.length; e++) {
              if (studentData.enrollments[e].type === "StudentEnrollment") {
                enrollment = studentData.enrollments[e];
              }
            }
            if (enrollment !== null) {
              app.studentsData[userId] = app.newStudent(userId, studentData.sortable_name, app.courseId, app);
              app.processEnrollment(app.studentsData[userId], enrollment);
              app.studentsData[userId].section = app.getStudentSection(userId);
            }
          }
        },
        async processStudentsAssignmentData() {
          let app = this;
          for (let s = 0; s < app.studentData.length; s++) {
            let studentData = app.studentData[s];
            let userId = studentData.id;
            let enrollment = null;

            for (let e = 0; e < studentData.enrollments.length; e++) {
              if (studentData.enrollments[e].type === "StudentEnrollment") {
                enrollment = studentData.enrollments[e];
              }
            }
            if (enrollment !== null) {
              await app.getAssignmentData(app.studentsData[userId], enrollment);
            }
          }
        },
        sortColumn(header) {
          let app = this;
          let name;
          if (header === "Progress Estimate") name = this.columnNameToCode(this.progress_method);
          else name = this.columnNameToCode(header);
          let sortState = 1;
          let sortType = '';
          for (let c = 0; c < app.columns.length; c++) {
            if (app.columns[c].name !== header) {
              //reset everything else
              app.columns[c].sort_state = 0;
            } else {
              //if it's the one being sorted, set it to 1 if not 1, or set it to -1 if is already 1
              if (app.columns[c].sort_state !== 1) app.columns[c].sort_state = 1;
              else app.columns[c].sort_state = -1;
              sortState = app.columns[c].sort_state;
              sortType = app.columns[c].sort_type;
            }
          }
          app.students.sort(function (a, b) {
            let aVal = a[name];
            let bVal = b[name];
            //convert strings to upper case to ignore case when sorting
            if (typeof (aVal) === 'string') aVal = aVal.toUpperCase();
            if (typeof (bVal) === 'string') bVal = bVal.toUpperCase();

            //see if not the same type and which one isn't the sort type
            if (typeof (aVal) !== typeof (bVal)) {
              if (typeof (aVal) !== sortType) return -1 * sortState;
              if (typeof (bVal) !== sortType) return 1 * sortState;
            }
            //check if it's a string or int
            let comp = 0;
            if (aVal > bVal) comp = 1;
            else if (aVal < bVal) comp = -1;
            //flip it if reverse sorting;
            comp *= sortState;
            return comp
          })
        },
        newStudent(id, name, course_id) {
          let student = {};
          student.user_id = id;
          student.name = name;
          student.course_id = course_id;
          student.in_course = 0;
          student.last_submit = undefined;
          student.section = "";
          student.to_date = "N/A";
          student.points_weighted = 0;
          student.points_raw = 0;
          student.final = "N/A";
          student.ungraded = 0;
          student.submissions = 0;
          //this will probably be deleted, but keeping for reference on how to format in vue
          student.nameHTML = "<a target='_blank' href='https://btech.instructure.com/courses/" + course_id + "/users/" + id + "'>" + name + "</a> (<a target='_blank' href='https://btech.instructure.com/courses/" + course_id + "/grades/" + id + "'>grades</a>)";
          return student;
        },
        async createGradesReport() {
          let app = this;
          await app.getSectionData();
          let url = "/api/v1/courses/" + this.courseId + "/users?enrollment_state%5B%5D=active";
          url += "&enrollment_state%5B%5D=invited"
          url += "&enrollment_type%5B%5D=student"
          url += "&enrollment_type%5B%5D=student_view";
          url += "&include%5B%5D=avatar_url";
          url += "&include%5B%5D=group_ids";
          url += "&include%5B%5D=enrollments";
          url += "&per_page=100";

          await $.get(url, function (data) {
            app.studentData = data;
          });
        },
        async getSectionData() {
          let app = this;
          let url = "/api/v1/courses/" + app.courseId + "/sections?per_page=100&include[]=students";
          await $.get(url, function (data) {
            app.sections = data;
          });
        },
        getStudentSection(studentId) {
          let app = this;
          if (app.sections.length > 0) {
            for (let i = 0; i < app.sections.length; i++) {
              let section = app.sections[i];
              let studentsData = section.students;
              if(app.section_names.includes(section.name) == false) {
                app.section_names.push(section.name);
              }
              if (studentsData !== null) {
                if (studentsData.length > 0) {
                  for (let j = 0; j < studentsData.length; j++) {
                    let studentData = studentsData[j];
                    if (parseInt(studentId) === studentData.id) {
                      return section.name;
                    }
                  }
                }
              }
            }
          }
          return '';
        },

        checkStudentInSection(studentData, section) {
          let app = this;
          for (let s = 0; s < app.students.length; s++) {
            let student = app.students[s];
            let user_id = parseInt(student.user_id);
            if (studentData.id === user_id) {
              student.section = section.name;
              return;
            }
          }
        },
        columnNameToCode(name) {
          return name.toLowerCase().replace(/ /g, "_");
        },

        processEnrollment(student, enrollment) {
          let start_date = Date.parse(enrollment.created_at);
          let now_date = Date.now();
          let diff_time = Math.abs(now_date - start_date);
          let diff_days = Math.ceil(diff_time / (1000 * 60 * 60 * 24));
          let grades = enrollment.grades;
          let current_score = grades.current_score;
          if (current_score === null) current_score = 0;
          let final_score = grades.final_score;
          if (final_score === null) final_score = 0;

          //update values
          student.in_course = diff_days;
          student.to_date = current_score;
          student.final = final_score;

          //there might need to be a check to see if this is a numbe
          if (student.to_date > 0 && student.to_date != null) {
            student.points_weighted = Math.round(student.final / student.to_date * 100);
          }
        },

        async getAssignmentData(student, enrollment) {
          let user_id = student.user_id;
          let course_id = student.course_id;
          let url = "/api/v1/courses/" + course_id + "/analytics/users/" + user_id + "/assignments?per_page=100";
          try {
            await $.get(url, function (data) {
              let assignments = data;
              let submitted = 0;
              let max_submissions = 0;
              let max_points_raw = 0;
              let points_raw = 0;
              let start_date = Date.parse(enrollment.created_at);
              let now_date = Date.now();
              let diff_time = Math.abs(now_date - start_date);
              let most_recent_time = diff_time;
              let ungraded = 0;

              for (let a = 0; a < assignments.length; a++) {
                let assignment = assignments[a];
                if (assignment.submission !== undefined) {
                  let submitted_at = Date.parse(assignment.submission.submitted_at);
                  if (assignment.points_possible > 0) {

                    max_submissions += 1;
                    max_points_raw += assignment.points_possible;
                    if (assignment.submission.score !== null) {
                      submitted += 1;
                      points_raw += assignment.points_possible;
                    }
                  }
                  if (assignment.submission.score === null && assignment.submission.submitted_at !== null) {
                    ungraded += 1;
                  }
                  if (Math.abs(now_date - submitted_at) < most_recent_time) {
                    most_recent_time = Math.abs(now_date - submitted_at);
                    most_recent = assignment;
                  }
                }
              }

              let most_recent_days = Math.ceil(most_recent_time / (1000 * 60 * 60 * 24));

              student.last_submit = most_recent_days;

              student.ungraded = ungraded;
              let perc_submitted = Math.round((submitted / max_submissions) * 100);
              if (isNaN(perc_submitted)) perc_submitted = 0;
              student.submissions = perc_submitted;


              let perc_points_raw = Math.round((points_raw / max_points_raw) * 100);
              if (isNaN(perc_points_raw)) perc_points_raw = 0;
              student.points_raw = perc_points_raw;
            });
          } catch (e) {
            console.log(e);
          }
        },
        close() {
          $(this.$el).hide();
        }

      }
    })
  }
  function loadCSS(url) {
    var style = document.createElement('link'),
      head = document.head || document.getElementsByTagName('head')[0];
    style.href = url;
    style.type = 'text/css';
    style.rel = "stylesheet";
    style.media = "screen,print";
    head.insertBefore(style, head.firstChild);
  }
  function _init() {
    loadCSS("https://reports.bridgetools.dev/department_report/style/main.css");
    loadCSS("https://reports.bridgetools.dev/style/main.css");
    $.getScript("https://reports.bridgetools.dev/department_report/components/courseProgressBarInd.js").done(() => {
          postLoad();
    });
  }
  _init();
})();