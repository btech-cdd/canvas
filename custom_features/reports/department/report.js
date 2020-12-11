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
          let dept = '' + CURRENT_DEPARTMENT_ID;

          //Load names and create dict
          let usersUrl = '/api/v1/accounts/' + dept + '/users';
          let users = await canvasGet(usersUrl, {
            enrollment_type: 'student'
          });
          for (let i = 0; i < users.length; i++) {
            let user = users[i];
            //If the name hasn't been saved yet
            if (user.sis_user_id !== null) {
              if (!(user.sis_user_id in app.nameDict)) {
                app.nameDict[user.sis_user_id] = user.sortable_name;
              }
            }
          }

          //import json files
          await app.loadJsonFile('progress');
          await app.loadJsonFile('sis_to_canv');
          await app.loadJsonFile('canv_dept_to_jenz');
          await app.loadJsonFile('dept_code_to_name');

          //get list of departments available to this sub account
          let availableDepartments = [];
          for (let i in app.json.canv_dept_to_jenz[dept]) {
            let departmentCode = app.json.canv_dept_to_jenz[dept][i];
            if (departmentCode in app.json.progress) {
              console.log(departmentCode);
              console.log(app.json.progress[departmentCode]);
              availableDepartments.push(departmentCode);
            }
          }

          //Sort departments alphabetically
          availableDepartments.sort(function (a, b) {
            let deptNameA = app.json.dept_code_to_name[a].name;
            let deptNameB = app.json.dept_code_to_name[b].name;
            return deptNameA.localeCompare(deptNameB);
          });
          app.availableDepartments = availableDepartments;
          app.currentDepartment = app.availableDepartments[0];

          app.loadDepartmentUsers();
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
            usersByYear: {},
            currentDepartment: '',
            coreCourses: [],
            electiveCourses: [],
            availableDepartments: [],
            showStudentReport: false,
            svg: null,
            nameDict: {},

            colors: {
              base: '#334',
              noProgress: '#D9534F',
              inProgress: '#F0AD4E',
              complete: '#5CB85C'
            }
          }
        },
        methods: {
          getCourseProgressBarColor(progress) {
            let app = this;
            if (progress <= 0) return app.colors.noProgress;
            if (progress >= 100) return app.colors.complete;
            return app.colors.inProgress;
          },
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
            let usersByYear = {};
            for (let year in app.json['progress'][app.currentDepartment]) {
              let users = app.json['progress'][app.currentDepartment][year];
              let userList = [];
              let base = users['base'];
              for (let id in users) {
                if (id !== "base") {
                  if (id in app.nameDict) {
                    let courses = users[id];
                    let core = [];
                    let elective = [];
                    for (let courseCode in courses) {
                      let course = courses[courseCode];
                      let courseData = {
                        'code': courseCode,
                        'progress': course.progress
                      }
                      if (base[courseCode].type === 'CORE') {
                        core.push(courseData);
                      }
                      if (base[courseCode].type === 'ELECT') {
                        elective.push(courseData);
                      }
                    }
                    userList.push({
                      'name': app.nameDict[id],
                      'id': id,
                      'core': core,
                      'elective': elective
                    });
                  }
                }
              }

              userList.sort(function (a, b) {
                let aName = app.nameDict[a];
                if (aName != undefined) aName = aName.toLowerCase();
                else aName = '';

                let bName = app.nameDict[b];
                if (bName != undefined) bName = bName.toLowerCase();
                else bName = '';

                return aName.localeCompare(bName);
              });

              usersByYear[year] = userList;
            }
            app.usersByYear = usersByYear;
            /*
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
              for (c in deptCourses) {
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
            */
          },

          async openStudentReport(userId) {
            let app = this;
            app.showStudentReport = true;
            SUBMISSIONS_GRAPH_BAR._init(app, userId);
          },

          closeStudentReport() {
            let app = this;
            app.showStudentReport = false;
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

  SUBMISSIONS_GRAPH_BAR = {
    app: {},
    graphSettings: {
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)),
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
    },
    async _init(app, userId) {
      this.app = app;
      let graph = this;
      let graphElId = 'btech-department-report-student-submissions-graph';
      $('#' + graphElId).empty();
      var w = 800;
      var h = 450;


      var width = w - graph.graphSettings.margin.left - graph.graphSettings.margin.right
      var height = h - graph.graphSettings.margin.top - graph.graphSettings.margin.bottom

      let enrollments = await canvasGet("/api/v1/users/" + userId + "/enrollments?type[]=StudentEnrollment");
      let submissionDates = {};
      for (let e = 0; e < enrollments.length; e++) {
        let enrollment = enrollments[e];
        let url = "/api/v1/courses/" + enrollment.course_id + "/students/submissions?student_ids[]=" + userId + "&include=assignment";
        let rawSubmissions = await canvasGet(url);
        rawSubmissions.map(function (submission) {
          let submissionDate = submission.submitted_at;
          if (submissionDate === null) {
            submissionDate = submission.graded_at;
          }
          //check if there's submission data and if it's an assignment worth any points
          if (submissionDate !== null) {
            let date = new Date(submissionDate);
            let day = date.getDay();
            day = Math.floor(day / 7) * 7;
            if (!(date in submissionDates)) {
              submissionDates[date] = {
                date: date,
                count: 0
              }
            }
            submissionDates[date].count += 1;
          }
        });
      }
      let submissions = [];
      for (let date in submissionDates) {
        submissionDate = submissionDates[date];
        submissions.push(submissionDate);
      }

      var x = d3.scaleTime()
        .domain([graph.graphSettings.startDate, graph.graphSettings.endDate])
        .range([0, width]);
      graph.graphSettings.x = x;

      var y = d3.scaleLinear()
        .domain([0, 10])
        .range([height, 0]);

      graph.graphSettings.y = y;


      graph.svg = d3.select('#' + graphElId).append('svg')
        .attr('class', 'chart')
        .attr('width', w)
        .attr('height', h);

      var chart = graph.svg.append('g')
        .classed('graph', true)
        .attr('transform', 'translate(' + graph.graphSettings.margin.left + ',' + graph.graphSettings.margin.top + ')');


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

      graph.svg
        .selectAll("whatever")
        .data(submissions)
        .enter()
        .append("rect")
        .attr("x", function (d) {
          return graph.xPlot(d, x)
        })
        .attr("width", 10)
        .attr("y", function (d) {
          return graph.yPlot(d, y);
        })
        .attr("height", function (d) {
          return height - graph.yPlot(d, y) + graph.graphSettings.margin.top;
        })
        .attr("fill", "#334");

      graph.svg.append("text")
        .attr("transform", "translate(" + (w / 2) + " ," + (h) + ")")
        .style("text-anchor", "middle")
        .text("Date Submitted");

      graph.svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Assignment Grade");
    },

    // Create Event Handlers for mouse
    handleMouseOver(mouse, submission) { // Add interactivity
      let = this.app;
      let graph = this;
      if (submission.id === undefined) {
        submission.id = genId();
      }
      // Use D3 to select element, change color and size
      d3.select(mouse.target)
        .attr("fill", "#1C91A4");

      // Specify where to put label of text
      graph.svg.append("text")
        .attr("id", "t-" + submission.id) // Create an id for text so we can select it later for removing on mouseout
        .attr("x", function () {
          return graph.xPlot(submission, graph.graphSettings.x);
        })
        .attr("y", function () {
          return graph.yPlot(submission, graph.graphSettings.y);
        })
        .text(function () {
          return submission.assignment.name; // Value of the text
        });
    },

    handleMouseOut(mouse, submission) {
      let app = this.app;
      let graph = this;
      // Use D3 to select element, change color back to normal
      d3.select(mouse.target)
        .attr("fill", "#334");

      // Select text by id and then remove
      d3.select("#t-" + submission.id).remove(); // Remove text location
    },

    handleMouseClick(mouse, submission) {
      let app = this.app;
      let graph = this;
      var newWindow = window.open(submission.preview_url);
    },
    xPlot(d, x) {
      let app = this.app;
      let graph = this;
      return x(new Date(d.date)) + graph.graphSettings.margin.left;
    },

    yPlot(d, y) {
      let app = this.app;
      let graph = this;
      return y(d.count) + graph.graphSettings.margin.top;
    },
  }

  SUBMISSIONS_GRAPH_POINTS = {
    app: {},
    graphSettings: {
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)),
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
    },
    async _init(app, userId) {
      this.app = app;
      let graph = this;
      let graphElId = 'btech-department-report-student-submissions-graph';
      $('#' + graphElId).empty();
      var w = 800;
      var h = 450;


      var width = w - graph.graphSettings.margin.left - graph.graphSettings.margin.right
      var height = h - graph.graphSettings.margin.top - graph.graphSettings.margin.bottom

      let enrollments = await canvasGet("/api/v1/users/" + userId + "/enrollments?type[]=StudentEnrollment");
      let submissions = [];
      for (let e = 0; e < enrollments.length; e++) {
        let enrollment = enrollments[e];
        let url = "/api/v1/courses/" + enrollment.course_id + "/students/submissions?student_ids[]=" + userId + "&include=assignment";
        let rawSubmissions = await canvasGet(url);
        rawSubmissions.map(function (submission) {
          let submissionDate = submission.submitted_at;
          if (submissionDate === null) {
            submissionDate = submission.graded_at;
          }
          //check if there's submission data and if it's an assignment worth any points
          if (submissionDate !== null && submission.assignment.points_possible > 0) {
            submissionDate = new Date(submissionDate);
            if (submissionDate > graph.graphSettings.startDate) {
              submission.submissionDate = submissionDate;
              submissions.push(submission);
            }
          }
        });
      }

      var x = d3.scaleTime()
        .domain([graph.graphSettings.startDate, graph.graphSettings.endDate])
        .range([0, width]);
      graph.graphSettings.x = x;

      var y = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);

      graph.graphSettings.y = y;


      graph.svg = d3.select('#' + graphElId).append('svg')
        .attr('class', 'chart')
        .attr('width', w)
        .attr('height', h);

      var chart = graph.svg.append('g')
        .classed('graph', true)
        .attr('transform', 'translate(' + graph.graphSettings.margin.left + ',' + graph.graphSettings.margin.top + ')');


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

      graph.svg
        .selectAll("whatever")
        .data(submissions)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
          return graph.xPlot(d, x)
        })
        .attr("cy", function (d) {
          return graph.yPlot(d, y)
        })
        .attr("r", graph.graphSettings.radius)
        .attr("fill", "#334")
        .attr("stroke", "#000")
        .on("mouseover", graph.handleMouseOver)
        .on("mouseout", graph.handleMouseOut)
        .on("click", graph.handleMouseClick);

      graph.svg.append("text")
        .attr("transform", "translate(" + (w / 2) + " ," + (h) + ")")
        .style("text-anchor", "middle")
        .text("Date Submitted");

      graph.svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Assignment Grade");
    },

    // Create Event Handlers for mouse
    handleMouseOver(mouse, submission) { // Add interactivity
      let = this.app;
      let graph = this;
      if (submission.id === undefined) {
        submission.id = genId();
      }
      // Use D3 to select element, change color and size
      d3.select(mouse.target)
        .attr("fill", "#1C91A4");

      // Specify where to put label of text
      graph.svg.append("text")
        .attr("id", "t-" + submission.id) // Create an id for text so we can select it later for removing on mouseout
        .attr("x", function () {
          return graph.xPlot(submission, graph.graphSettings.x);
        })
        .attr("y", function () {
          return graph.yPlot(submission, graph.graphSettings.y);
        })
        .text(function () {
          return submission.assignment.name; // Value of the text
        });
    },

    handleMouseOut(mouse, submission) {
      let app = this.app;
      let graph = this;
      // Use D3 to select element, change color back to normal
      d3.select(mouse.target)
        .attr("fill", "#334");

      // Select text by id and then remove
      d3.select("#t-" + submission.id).remove(); // Remove text location
    },

    handleMouseClick(mouse, submission) {
      let app = this.app;
      let graph = this;
      var newWindow = window.open(submission.preview_url);
    },
    xPlot(d, x) {
      let app = this.app;
      let graph = this;
      return x(new Date(d.submissionDate)) + graph.graphSettings.margin.left;
    },

    yPlot(d, y) {
      let app = this.app;
      let graph = this;
      return y((d.score / d.assignment.points_possible) * 100) + graph.graphSettings.margin.top;
    },
  }
})();