//include a last updated list
//SHOW STUDENT STATUS FROM JENZABAR, IE ACTIVE, ON HOLD, DROPPED, GRADUATED, ETC.
//SHOW DATE OF SUBMISSIONS WHEN YOU HOVER OVER SUBMISSION BAR GRAPH BAR. MAYBE ALSO SHOW DAYS SINCE LAST SUBMISSION SOMEWHERE ON THAT REPORT
//SHOW GRADE FROM LAST MONTH (OR SOME OTHER SET PERIOD OF TIME)
//CLICK ON COURSE ID AND LINK TO THAT STUDENT'S GRADE PAGE FOR THAT COURSE
//SAVE COURSE ID IN PREPROCESSED DATA
//HOVER OVER COURSE CODE TO GET THE NAME OF THAT COURSE
//HS VERSION OF REPORT
////MAYBE MAKE IT IT'S OWN DROP DOWN IN ADDITION TO DIFFERENT DEPARTMENTS. NO TREES, JUST WHATEVER THEY'RE IN RIGHT NOW
////OR COULD HAVE THEM ALL IN CURRENT TREE FOR THAT DEPARTMENT
//SETTINGS TAB
////SHOW DOT GRAPH INSTEAD OF BAR
////SHOW ONLY STUDENTS ACTIVE IN A COURSE RIGHT NOW
////SHOW ONLY STUDENTS BEHIND ON SUBMISSIONS
////CHANGE DIFFERENT INDICATORS (SAVE THESE IN USER DATA)
//////IE CHANGE GRADE FLAGS, DAYS IN COURSE FLAGS,A ND DAYS SINCE LAST SUBMISSION FLAGS
////TOGGLE ON THE FEATURE TO PARTIALLY FILL A BAR DEPENDING ON PROGRESS IN THAT COURSE. MAKE BACKGROUND BLACK AND THEN PARTIALLY SHADE, DEFAULT IS OFF THOUGH
////CHANGE NAME TO SORT BY FIRST NAME, ALSO CHANGE TO SHOW FIRST NAME FIRST THEN LAST NAME
(async function () {
  async function delay(ms) {
    // return await for better async stack trace support in case of errors.
    return await new Promise(resolve => setTimeout(resolve, ms));
  }
  async function getElement(selectorText, iframe = "") {
    let element;
    if (iframe === "") {
      element = $(selectorText);
    } else {
      element = $(iframe).contents().find(selectorText);
    }
    if (element.length > 0 && element.html().trim() !== "") {
      return element;
    } else {
      await delay(250);
      return getElement(selectorText, iframe);
    }
  }
  this.APP = new Vue({
    el: '#canvas-department-report-vue',
    mounted: async function () {
      let app = this;
      let dept = '' + CURRENT_DEPARTMENT;

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
        for (let i in userSubmissionDates) {
          let dateString = userSubmissionDates[i];
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
        loadingStudentReport: false,
        courseTypes: ['core', 'elective']
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

      loadDepartmentUsers() {
        let app = this;
        let usersByYear = {};
        for (let year in app.json['progress'][app.currentDepartment]) {
          let users = app.json['progress'][app.currentDepartment][year];
          let userList = [];
          let base = users['base'];
          for (let id in users) {
            if (id !== "base") {
              if (id in app.json['sis_to_canv']) {
                let name = app.json.sis_to_canv[id].name;
                console.log(name)
                let courses = users[id];
                let core = [];
                let elective = [];
                let summary = courses['summary'];
                let deptProgress = 0;
                let enrolledHours = 0;
                let completedHours = 0;
                for (let courseCode in courses) {
                  console.log(courseCode);
                  if (courseCode !== "summary") {
                    let course = courses[courseCode];
                    console.log(course);
                    //THIS NEEDS TO BE CONFIRMED THAT IT IS CONSISTENT WITH HOW THINGS ARE CALCULATED ON THE JENZABAR END
                    if (course.progress >= 100) {
                      enrolledHours += course.hours;
                      completedHours += course.hours;
                    } else {
                      let today = new Date();
                      let totalTime = new Date(course.contract_end) - new Date(course.contract_begin);
                      console.log(totalTime);
                      let completedTime = today - new Date(course.contract_begin);
                      console.log(completedTime);
                      let percTime = completedTime / totalTime;
                      console.log(percTime);
                      let courseEnrolledHours = percTime * course.hours;
                      console.log(courseEnrolledHours);
                      enrolledHours += courseEnrolledHours;
                      let courseCompletedHours = course.hours * course.progress * .01;
                      completedHours += courseCompletedHours;
                    }
                    let courseData = {
                      'code': courseCode,
                      'course_id': course.course_id,
                      'last_activity': course.last_activity,
                      'progress': course.progress,
                      'start': course.start,

                    }
                    if (base[courseCode].type === 'CORE') {
                      core.push(courseData);
                    } else {
                      // if (base[courseCode].type === 'ELECT') {
                      elective.push(courseData);
                    }
                  }
                }
                userList.push({
                  'name': name,
                  'id': id,
                  'core': core,
                  'elective': elective,
                  'summary': summary,
                  'enrolledHours': enrolledHours,
                  'completedHours': completedHours
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
        /*
        let app = this;
        app.showStudentReport = true;
        let graph = new SubmissionsGraphBar();
        graph._init(app, userId, sisId);
        */
      },

      closeStudentReport() {
        let app = this;
        app.showStudentReport = false;
      },

      async loadJsonFile(name) {
        let app = this;
        let jsonUrl = 'https://jhveem.xyz/api/report_data/' + name;
        let jsonData = {};
        await $.get(jsonUrl, function (data) {
          jsonData = data;
        });
        app.json[name] = jsonData;
      },

    }
  })
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
      graph.graphSettings.maxY = 10;
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
      let xVal = x(new Date(d.date)) + graph.graphSettings.margin.left;
      return xVal;
    }

    yPlot(d, y) {
      let app = this.app;
      let graph = this;
      let yVal = y(d.count) + graph.graphSettings.margin.top;
      return yVal;
    }
  }

})();