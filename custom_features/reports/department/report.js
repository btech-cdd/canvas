//include a last updated list
//GET THE STUDENT'S AVERAGE GRADE WEIGHTED BY COURSE HOURS
//SHOW STUDENT STATUS FROM JENZABAR, IE ACTIVE, ON HOLD, DROPPED, GRADUATED, ETC.
//SHOW DATE OF SUBMISSIONS WHEN YOU HOVER OVER SUBMISSION BAR GRAPH BAR. MAYBE ALSO SHOW DAYS SINCE LAST SUBMISSION SOMEWHERE ON THAT REPORT
//SHOW GRADE FROM LAST MONTH (OR SOME OTHER SET PERIOD OF TIME)
//CLICK ON COURSE ID AND LINK TO THAT STUDENT'S GRADE PAGE FOR THAT COURSE
//HOVER OVER COURSE CODE TO GET THE NAME OF THAT COURSE
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
          await app.loadJsonFile('submissions');
          for (let userId in app.json.submissions) {
            let submissions = {};
            app.userSubmissionDates[userId] = {
              'list': [],
              'last': null
            };
            let userSubmissionDates = app.json.submissions[userId];
            for (let dateString in userSubmissionDates) {
              let longDate = new Date(dateString);
              let date = new Date(longDate.getFullYear(), longDate.getMonth(), longDate.getDate());
              if (app.userSubmissionDates[userId]['last'] === null) {
                app.userSubmissionDates[userId]['last'] = date;
              } else if (app.userSubmissionDates[userId]['last'] < date) {
                app.userSubmissionDates[userId]['last'] = date;
              }
              if (!(date in submissions)) {
                submissions[date] = 0;
              }
              submissions[date] += 1;
            }
            for (let dateString in submissions) {
              let count = submissions[dateString];
              app.userSubmissionDates[userId]['list'].push({
                'date': dateString,
                'count': count
              })
            }
          }

          //get list of departments available to this sub account
          let availableDepartments = [];
          for (let i in app.json.canv_dept_to_jenz[dept]) {
            let departmentCode = app.json.canv_dept_to_jenz[dept][i];
            if (departmentCode in app.json.progress) {
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
            loadingStudentSubmissionsInProgress: false,
            json: {},
            usersByYear: {},
            userSubmissionDates: {},
            currentDepartment: '',
            coreCourses: [],
            electiveCourses: [],
            availableDepartments: [],
            showStudentReport: false,
            svg: null,
            nameDict: {},
            enrollments: {}, //or submission data or student data or somewhere else to hold all of the data pulling from canvas and saving it for reuse.
            colors: {
              base: '#334',
              red: 'rgb(217, 83, 79)',
              orange: 'rgb(229, 128, 79)',
              yellow: 'rgb(240, 173, 78)',
              green: 'rgb(92, 184, 92)',
              gray: '#E0E0E0',
              noProgress: '#E0E0E0',
              complete: '#5BC0DE',
              badDate: '#D9534F',
              warningDate: '#F0AD4E',
              goodDate: '#5CB85C',
            },
            loadingStudentReport: false
          }
        },
        methods: {
          getCourseProgressBarColor(course) {
            let progress = course.progress;
            let start = course.start;
            let app = this;
            if (progress <= 0) return app.colors.noProgress;
            if (progress >= 100) return app.colors.complete;

            let diffDays = Math.floor((new Date() - new Date(course.start)) / (1000 * 60 * 60 * 24));
            if (diffDays < 60) return app.colors.green;
            if (diffDays < 120) return app.colors.yellow; //yellow
            if (diffDays < 180) return app.colors.orange; //orange
            return app.colors.red; //red
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
                    let summary = courses['summary'];
                    for (let courseCode in courses) {
                      if (courseCode !== "summary") {
                        let course = courses[courseCode];
                        let courseData = {
                          'code': courseCode,
                          'progress': course.progress,
                          'start': course.start
                        }
                        if (base[courseCode].type === 'CORE') {
                          core.push(courseData);
                        }
                        if (base[courseCode].type === 'ELECT') {
                          elective.push(courseData);
                        }
                      }
                    }
                    userList.push({
                      'name': app.nameDict[id],
                      'id': id,
                      'core': core,
                      'elective': elective,
                      'summary': summary
                    });
                  }
                }
              }

              userList.sort(function (a, b) {
                let aName = a.name;
                if (aName != undefined) aName = aName.toLowerCase();
                else aName = '';

                let bName = b.name;
                if (bName != undefined) bName = bName.toLowerCase();
                else bName = '';

                return aName.localeCompare(bName);
              });

              usersByYear[year] = userList;
            }
            app.usersByYear = usersByYear;

            //Don't want to start multiple of these
            if (app.loadingStudentSubmissionsInProgress === false) {
              // app.loadNextStudentSubmissionData();
            }
            app.initGraphs();
          },

          calcDepartmentScoreText(user) {
            if (user.summary === undefined) return "N/A";
            if (user.summary.average_score === undefined) return "N/A";
            return Math.round(user.summary.average_score * 100) + "%";
          },

          calcDepartmentScoreColorBg(user) {
            let app = this;
            if (user.summary === undefined) return app.colors.gray;
            if (user.summary.average_score === undefined) return app.colors.gray;
            let score = Math.round(user.summary.average_score * 100);
            if (score < 60) return app.colors.red;
            if (score < 80) return app.colors.orange;
            if (score < 90) return app.colors.yellow;
            return app.colors.green;
          },

          calcDepartmentScoreColorFont(user) {
            let app = this;
            if (user.summary === undefined) return "#000000";
            if (user.summary.average_score === undefined) return "#000000";
            return "#FFFFFF";
          },

          //Specifically set up to be used when a new section is selected.
          //Cycles through all users, sees if any info has been loaded and a graph doesn't exist, if yes, create the graph for it.
          initGraphs() {
            let app = this;
            app.loadingStudentSubmissionsInProgress = true;
            let usersByYear = app.usersByYear;
            for (let year in usersByYear) {
              let users = usersByYear[year];
              for (let i in users) {
                let user = users[i];
                let sisId = user.id;
                let userId = app.json.sis_to_canv[sisId].canvas_id;
                if (app.userSubmissionDates[sisId] != undefined) {
                  let graph = new SubmissionsGraphBar();
                  graph._initSmall(app, userId, sisId, "btech-user-submission-summary-" + userId);
                }
              }
            }
          },


          async openStudentReport(userId, sisId) {
            let app = this;
            app.showStudentReport = true;
            let graph = new SubmissionsGraphBar();
            graph._init(app, userId, sisId);
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
          },

        }
      })
    }
  }
  class SubmissionsGraphBar {
    constructor() {
      let graph = this;
      graph.app = {};
      graph.graphSettings = {
        months: 6,
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        endDate: new Date(),
        x: null,
        y: null,
        barWidth: 1,
        maxY: 25,
        margin: {}
      }
    }
    async _initSmall(app, userId, sisId, graphElId, w = 240, h = 24) {
      this.app = app;
      let graph = this;
      graph.userId = userId;
      graph.sisId = sisId;

      //set graph settings 
      graph.graphSettings.months = 6;
      graph.graphSettings.startDate = new Date(new Date().setMonth(new Date().getMonth() - graph.graphSettings.months));
      graph.graphSettings.endDate = new Date();
      graph.graphSettings.barWidth = 1;
      graph.graphSettings.maxY = 5;
      graph.graphSettings.margin = {
        top: 1,
        bottom: 1,
        left: 1,
        right: 1,
      };

      let submissions = app.userSubmissionDates[sisId]['list'].filter(date => new Date(date.date) >= graph.graphSettings.startDate);
      app.loadingStudentReport = false;

      //Begin setting up the graph
      let barColor = graph.getBarColor();
      let el = await getElement("#" + graphElId);
      el.empty();
      h = d3.select('#' + graphElId).node().parentNode.getBoundingClientRect().height;

      var width = w - graph.graphSettings.margin.left - graph.graphSettings.margin.right;
      var height = h - graph.graphSettings.margin.top - graph.graphSettings.margin.bottom;

      var x = d3.scaleTime()
        .domain([graph.graphSettings.startDate, graph.graphSettings.endDate])
        .range([0, width]);
      graph.graphSettings.x = x;

      var y = d3.scaleLinear()
        .domain([0, graph.graphSettings.maxY])
        .range([height, 0]);

      graph.graphSettings.y = y;


      graph.svg = d3.select('#' + graphElId).append('svg')
        .attr('class', 'chart')
        .attr("style", "vertical-align: top;")
        .attr('width', w)
        .attr('height', h);


      var chart = graph.svg.append('g')
        .classed('graph', true)
        .attr('transform', 'translate(' + graph.graphSettings.margin.left + ',' + graph.graphSettings.margin.top + ')');



      chart.append('g')
        .classed('x axis', true)
        .attr("transform", "translate(0, " + height + ")")
        .call(
          d3.axisBottom(x)
          .tickFormat("")
          .tickSize(0)
          .ticks(d3.timeMonth.every(1))
        );

      chart.append('g')
        .classed('y axis', true)
        .call(d3.axisLeft(y)
          .tickFormat("")
          .tickSize(0)
          .ticks(graph.graphSettings.maxY)
        );

      graph.graphSettings.barWidth = Math.floor(w / (graph.graphSettings.months * 30)) + 1;

      graph.svg
        .selectAll("whatever")
        .data(submissions)
        .enter()
        .append("rect")
        .attr("x", function (d) {
          return graph.xPlot(d, x)
        })
        .attr("width", graph.graphSettings.barWidth)
        .attr("y", function (d) {
          return graph.yPlot(d, y);
        })
        .attr("height", function (d) {
          return height - graph.yPlot(d, y) + graph.graphSettings.margin.top;
        })
        .attr("fill", barColor);

      return;
    }

    async _init(app, userId, sisId, graphElId = 'btech-department-report-student-submissions-graph', w = 800, h = 450) {
      this.app = app;
      let graph = this;
      graph.userId = userId;
      graph.sisId = sisId;
      //Set margins
      graph.graphSettings.months = 6;
      graph.graphSettings.startDate = new Date(new Date().setMonth(new Date().getMonth() - graph.graphSettings.months));
      graph.graphSettings.endDate = new Date();
      graph.graphSettings.barWidth = 1;
      graph.graphSettings.maxY = 25;
      graph.graphSettings.margin = {
        top: 30,
        bottom: 40,
        left: 50,
        right: 20,
      };

      let submissions = app.userSubmissionDates[sisId]['list'].filter(date => new Date(date.date) >= graph.graphSettings.startDate);
      app.loadingStudentReport = false;

      //Begin setting up the graph
      let barColor = graph.getBarColor();
      let el = $('#' + graphElId);
      console.log("TEST");
      el.empty();

      var width = w - graph.graphSettings.margin.left - graph.graphSettings.margin.right;
      var height = h - graph.graphSettings.margin.top - graph.graphSettings.margin.bottom;

      var x = d3.scaleTime()
        .domain([graph.graphSettings.startDate, graph.graphSettings.endDate])
        .range([0, width]);
      graph.graphSettings.x = x;

      var y = d3.scaleLinear()
        .domain([0, graph.graphSettings.maxY])
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
        .attr("transform", "translate(0, " + height + ")")
        .call(
          d3.axisBottom(x)
          .tickFormat(d3.timeFormat("%Y-%m"))
          .ticks(d3.timeMonth.every(1))
        );

      chart.append('g')
        .classed('y axis', true)
        .call(d3.axisLeft(y)
          .ticks(graph.graphSettings.maxY));

      graph.graphSettings.barWidth = Math.floor(w / (graph.graphSettings.months * 30)) + 1;

      graph.svg
        .selectAll("whatever")
        .data(submissions)
        .enter()
        .append("rect")
        .attr("x", function (d) {
          return graph.xPlot(d, x)
        })
        .attr("width", graph.graphSettings.barWidth)
        .attr("y", function (d) {
          return graph.yPlot(d, y);
        })
        .attr("height", function (d) {
          return height - graph.yPlot(d, y) + graph.graphSettings.margin.top;
        })
        .attr("fill", barColor);

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
        .text("Number of Submissions");
    }

    getBarColor() {
      let app = this.app;
      let graph = this;
      let userId = graph.userId;
      let sisId = graph.sisId;
      let barColor = app.colors.green;
      let daysSinceLastSubmission = Math.floor((new Date() - new Date(app.userSubmissionDates[sisId]['last'])) / (1000 * 60 * 60 * 24));
      if (daysSinceLastSubmission >= 7) barColor = app.colors.yellow;
      if (daysSinceLastSubmission >= 10) barColor = app.colors.red;
      return barColor;
    }

    // Create Event Handlers for mouse
    handleMouseOver(mouse, submission) { // Add interactivity
      let app = this.app;
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
    }

    handleMouseOut(mouse, submission) {
      let app = this.app;
      let graph = this;
      // Use D3 to select element, change color back to normal
      d3.select(mouse.target)
        .attr("fill", app.colors.complete);

      // Select text by id and then remove
      d3.select("#t-" + submission.id).remove(); // Remove text location
    }

    handleMouseClick(mouse, submission) {
      let app = this.app;
      let graph = this;
      var newWindow = window.open(submission.preview_url);
    }
    xPlot(d, x) {
      let app = this.app;
      let graph = this;
      return x(new Date(d.date)) + graph.graphSettings.margin.left;
    }

    yPlot(d, y) {
      let app = this.app;
      let graph = this;
      return y(d.count) + graph.graphSettings.margin.top;
    }
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