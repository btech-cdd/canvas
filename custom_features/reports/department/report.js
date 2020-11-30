//include a last updated list
(async function () {
  IMPORTED_FEATURE = {};
  IMPORTED_FEATURE = {
    initiated: false,
    async _init(params = {}) {
      let vueString = '';
      $.getScript("https://d3js.org/d3.v6.min.js");
      await $.get(SOURCE_URL + '/custom_features/reports/department/template.vue', null, function (html) {
        vueString = html.replace("<template>", "").replace("</template>", "");
      }, 'text');
      let content = $("#content");
      content.empty();
      content.append('<div id="canvas-department-report-vue"></div>')
      $("#canvas-department-report-vue").append(vueString);
      this.APP = new Vue({
        el: '#canvas-department-report-vue',
        mounted: async function () {
          let app = this;
          let dept = CURRENT_DEPARTMENT_ID;
          await app.loadJsonFile('progress');
          await app.loadJsonFile('departments');
          await app.loadJsonFile('canvas_to_jenz');
          console.log(app.json);
          app.availableDepartments = app.json.canvas_to_jenz[CURRENT_DEPARTMENT_ID];
          app.currentDepartment = app.availableDepartments[0];

          let usersUrl = '/api/v1/accounts/' + dept + '/users';
          let users = await canvasGet(usersUrl, {
            enrollment_type: 'student'
          });
          for (let i = 0; i < users.length; i++) {
            let user = users[i];
            if (user.id in app.json['progress']) {
              app.json['progress'][user.id].name = user.sortable_name;
            }
          }

          app.loadDepartmentUsers();
          /*
          for (let userId in deptUsers) {
            let user = deptUsers[userId];
            let div = $('<div></div>');
            div.append('<span><a href="/users/' + userId + '">' + user.name + '</a></span><br>');
            for (let courseCode in user.courses) {
              let course = user.courses[courseCode][0];
              let progress = course.progress;
              if (progress > 100) progress = 100;
              div.append(`<div style="display: inline-block; border: 1px solid #000; background-color: #334;">
          <div style='box-sizing: border-box; white-space: nowrap; padding: 0px 5px; font-size: 0.75em; background-color: #1C91A4; color: #fff; width: ` + progress + `%;'>` + courseCode + `</div>
        </div>`);
            }
            div.append('<br>')
            content.append(div);
            console.log(user);
          }
          */
          app.loading = false;
        },

        computed: {
          electiveCourses: function () {},
          coreCourses: function () {}
        },

        data: function () {
          return {
            loading: true,
            json: {},
            users: [],
            currentDepartment: '',
            coreCourses: [],
            electiveCourses: [],
            availableDepartments: [],
            showStudentReport: false,
            svg: null,
            graphSettings: {
              startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
              endDate: new Date(),
              radius: 4,
              x: null,
              y: null,
              margin: {
                top: 30,
                bottom: 40,
                left: 50,
                right: 20,
              }
            }
          }
        },
        methods: {
          calcElectiveCourses() {
            let list = [];
            let app = this;
            let courses = app.json['departments'][app.currentDepartment];
            for (let c = 0; c < courses.length; c++) {
              let course = courses[c];
              if (!course.is_core) {
                list.push(course);
              }
            }
            app.electiveCourses = list;
            return list;
          },
          calcCoreCourses() {
            let list = [];
            let app = this;
            let courses = app.json['departments'][app.currentDepartment];
            for (let c = 0; c < courses.length; c++) {
              let course = courses[c];
              if (course.is_core) {
                list.push(course);
              }
            }
            app.coreCourses = list;
            return list;
          },
          loadDepartmentUsers() {
            let app = this;
            console.log(app.currentDepartment);

            //set last activity date
            let users = [];
            let jsonUsers = app.json['progress'];
            let depts = app.json['departments'];
            let deptCourses = depts[app.currentDepartment];
            console.log(deptCourses);
            let coreCourses = app.calcCoreCourses();
            console.log(coreCourses);
            for (userId in jsonUsers) {
              let user = jsonUsers[userId];
              user.id = userId;
              for (c in coreCourses) {
                let course = deptCourses[c];
                if (user.courses[course.code] !== undefined) {
                  users.push(user);
                  break;
                }
              }
            }

            //Alphabetize
            users.sort(function (a, b) {
              let aName = a.name;
              if (aName != undefined) aName = aName.toLowerCase();
              else aName = '';

              let bName = b.name;
              if (bName != undefined) bName = bName.toLowerCase();
              else bName = '';

              return aName.localeCompare(bName);
            });

            console.log(users);
            app.users = users;
            app.calcCoreCourses();
            app.calcElectiveCourses();
          },

          async openStudentReport(user) {
            let app = this;
            app.showStudentReport = true;
            let graphElId = 'btech-department-report-student-submissions-graph';
            $('#' + graphElId).empty();
            let legendKeys = ['score', 'submitted'];

            var w = 800;
            var h = 450;


            var width = w - app.graphSettings.margin.left - app.graphSettings.margin.right
            var height = h - app.graphSettings.margin.top - app.graphSettings.margin.bottom

            var colors = [
              '#FFEBB6', '#FFC400', '#B4EDA0', '#FF4436', '#FF9A00'
            ];
            let enrollments = await canvasGet("/api/v1/users/" + user.id + "/enrollments?type[]=StudentEnrollment");
            let submissions = [];
            for (let e = 0; e < enrollments.length; e++) {
              let enrollment = enrollments[e];
              let url = "/api/v1/courses/" + enrollment.course_id + "/students/submissions?student_ids[]=" + user.id + "&include=assignment";
              let rawSubmissions = await canvasGet(url);
              rawSubmissions.map(function (submission) {
                let submissionDate = submission.submitted_at;
                if (submissionDate === null) {
                  submissionDate = submission.graded_at;
                }
                //check if there's submission data and if it's an assignment worth any points
                if (submissionDate !== null && submission.assignment.points_possible > 0) {
                  submissionDate = new Date(submissionDate);
                  if (submissionDate > app.graphSettings.startDate) {
                    submission.submissionDate = submissionDate;
                    submissions.push(submission);
                  }
                }
              });
            }

            var x = d3.scaleTime()
              .domain([app.graphSettings.startDate, app.graphSettings.endDate])
              .range([0, width]);
            app.graphSettings.x = x;

            var y = d3.scaleLinear()
              .domain([0, 100])
              .range([height, 0]);

            app.graphSettings.y = y;


            app.svg = d3.select('#' + graphElId).append('svg')
              .attr('class', 'chart')
              .attr('width', w)
              .attr('height', h);

            var chart = app.svg.append('g')
              .classed('graph', true)
              .attr('transform', 'translate(' + app.graphSettings.margin.left + ',' + app.graphSettings.margin.top + ')');


            chart.append('g')
              .classed('x axis', true)
              .attr("transform", "translate(0," + height + ")")
              .call(
                d3.axisBottom(x)
                .tickFormat(d3.timeFormat("%Y-%m"))
                .ticks(d3.timeMonth.every(1))
              );

            chart.append('g')
              .classed('y axis', true)
              .call(d3.axisLeft(y)
                .ticks(10));

            app.svg
              .selectAll("whatever")
              .data(submissions)
              .enter()
              .append("circle")
              .attr("cx", function (d) {
                return app.xPlot(d, x)
              })
              .attr("cy", function (d) {
                return app.yPlot(d, y)
              })
              .attr("r", app.graphSettings.radius)
              .attr("fill", "#334")
              .attr("stroke", "#000")
              .on("mouseover", app.handleMouseOver)
              .on("mouseout", app.handleMouseOut)
              .on("click", app.handleMouseClick);
          },
          // Create Event Handlers for mouse
          handleMouseOver(mouse, submission) { // Add interactivity
            let app = this;
            console.log(mouse);
            if (submission.id === undefined) {
              submission.id = genId();
            }
            // Use D3 to select element, change color and size
            d3.select(mouse.target)
              .attr("fill", "#1C91A4");

            // Specify where to put label of text
            app.svg.append("text")
              .attr("id", "t-" + submission.id) // Create an id for text so we can select it later for removing on mouseout
              .attr("x", function () {
                return app.xPlot(submission, app.graphSettings.x);
              })
              .attr("y", function () {
                return app.yPlot(submission, app.graphSettings.y);
              })
              .text(function () {
                return submission.assignment.name; // Value of the text
              });
          },

          handleMouseOut(mouse, submission) {
            let app = this;
            // Use D3 to select element, change color back to normal
            d3.select(mouse.target)
              .attr("fill", "#334");

            // Select text by id and then remove
            d3.select("#t-" + submission.id).remove(); // Remove text location
          },

          handleMouseClick(mouse, submission) {
            let app = this;
            var newWindow = window.open(submission.preview_url);
          },

          closeStudentReport() {
            let app = this;
            app.showStudentReport = false;
          },

          xPlot(d, x) {
            let app = this;
            return x(new Date(d.submissionDate)) + app.graphSettings.margin.left;
          },

          yPlot(d, y) {
            let app = this;
            return y((d.score / d.assignment.points_possible) * 100) + app.graphSettings.margin.top;
          },

          async loadJsonFile(name) {
            let app = this;
            let jsonUrl = 'https://jhveem.xyz/canvas/custom_features/reports/department/' + name + '.json';
            let jsonData = await canvasGet(jsonUrl);
            app.json[name] = jsonData[0];
          }
        }
      })
    }
  }
})();