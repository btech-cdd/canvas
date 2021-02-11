//need a breakdown of which user ids are active, concluded, and dropped. This will allow a breakdown in the submissions graph to show which assignments aren't being completed by dropped students
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
    el: '#canvas-courses-report-vue',
    mounted: async function () {
      $('#canvas-courses-report-vue').css({
        visibility: 'visible'
      });
      let app = this;
      let dept = '' + CURRENT_DEPARTMENT;
      await app.loadJsonFile('dept_data/3820');
      console.log(app.json.courses_data);
      app.loading = false;
    },

    computed: {},

    updated: function () {},

    data: function () {
      return {
        loading: true,
        json: {},
        showCourse: 'all',
        minEnrollments: 5,
        minProgress: 10,
        colors: {
          base: '#334',
          black: '#000000',
          white: '#ffffff',
          red: 'rgb(217, 83, 79)',
          orange: 'rgb(229, 128, 79)',
          yellow: 'rgb(240, 173, 78)',
          green: 'rgb(92, 184, 92)',
          blue: 'rgb(91, 192, 222)',
          gray: '#E0E0E0',
          noProgress: '#E0E0E0',
          complete: '#5BC0DE',
          badDate: '#D9534F',
          warningDate: '#F0AD4E',
          goodDate: '#5CB85C',
        },
        scrollTop: 0, //used to save the scroll location of the main screen before going into the student report
      }
    },
    methods: {
      async loadJsonFile(name) {
        let app = this;
        let jsonUrl = 'https://jhveem.xyz/lti/report_data/' + name;
        let jsonData = {};
        await $.post(jsonUrl, function (data) {
          jsonData = data;
        });
        if (name.includes('dept_data')) name = 'courses_data'
        app.json[name] = jsonData;
      },

      getBGColor(val, groups) {
        let app = this;
        if (val < groups[0]) return app.colors.red;
        if (val < groups[1]) return app.colors.yellow;
        return app.colors.green;
      },

      openCourseReport() {
        let app = this;
        app.$nextTick(() => {
          let graph = new SubmissionsGraphBar();
          graph._init();
        });
      },

      closeCourseReport() {
        let app = this;
        app.showCourse = 'all';
      },

      formatTime(time) {
        time = Math.round(time);
        let hours = Math.floor(time / 3600)
        time -= (hours * 3600);
        console.log(time);
        let minutes = Math.floor(time / 60);
        console.log(minutes);
        time -= (minutes * 60);
        let seconds = time;
        if (hours < 10) hours = "0" + hours;
        if (minutes < 10) minutes = "0" + minutes;
        if (seconds < 10) seconds = "0" + seconds;
        return hours + ":" + minutes + ":" + seconds;
      },

      calcAverageQuizAlpha(quiz) {
        let questions = quiz.question_statistics;
        let sum = 0;
        let count = 0;
        for (let q = 0; q < questions.length; q++) {
          let stats = questions[q];
          if (stats.alpha !== null && stats.alpha !== undefined) sum += stats.alpha;
          count += 1;
        }
        if (count > 0) return Math.round(sum / count * 100) / 100;
        return "N/A";
      },

      calcAverageQuizDifficulty(quiz) {
        let questions = quiz.question_statistics;
        let sum = 0;
        let count = 0;
        for (let q = 0; q < questions.length; q++) {
          let stats = questions[q];
          if (stats.difficulty_index !== null && stats.difficulty_index !== undefined) sum += stats.difficulty_index;
          count += 1;
        }
        if (count > 0) return Math.round(sum / count * 100) / 100;
        return "N/A";
      },

      sumEnrollments(course) {
        let enrollments = course.enrollments;
        let all = [];
        for (let type in enrollments) {
          let enrollmentGroup = enrollments[type];
          for (let e = 0; e < enrollmentGroup.length; e++) {
            let id = enrollmentGroup[e];
            if (!(id in all)) all.push(id);
          }
        }
        return all.length;
      }
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

    async getData() {
      let app = this.app;
      let moduleAssignments = app.showCourse.module_assignments;
      let moduleItems = [];
      for (let a = 0; a < moduleAssignments.length; a++) {
        let moduleAssignment = moduleAssignments[a];
        let submittedUsers = moduleAssignment.submitted_users;
        let moduleItemData = {
          name: a + '. ' + moduleAssignment.name,
          active: 0,
          completed: 0,
          dropped: 0
        };
        for (let i = 0; i < submittedUsers.length; i++) {
          let userId = submittedUsers[i];
          for (let type in app.showCourse.enrollments) {
            let enrollments = app.showCourse.enrollments[type];
            for (let j = 0; j < enrollments.length; j++) {
              let enrollmentUserId = enrollments[j];
              if (enrollmentUserId === userId) moduleItemData[type] += 1;
            }
          }
        }
        moduleItems.push(
          moduleItemData
        );
      }
      console.log(moduleItems);
      let data = moduleItems;
      return data;
    }

    async _init(app = APP, graphElId = 'btech-department-report-student-submissions-graph', w = 800, h = 240) {
      this.app = app;
      let graph = this;
      // List of subgroups = header of the csv files = soil condition here
      var margin = {
          top: 10,
          right: 30,
          bottom: 20,
          left: 50
        },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

      // append the svg object to the body of the page
      var svg = d3.select("#" + graphElId)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

      let data = graph.getData();
      var subgroups = data.columns.slice(1)
      console.log(data);

      // List of groups = species here = value of the first column called group -> I show them on the X axis
      var groups = d3.map(data, function (d) {
        return (d.group)
      }).keys()
      console.log(groups);
      // Add X axis
      var x = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding([0.2])
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0));

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, 60])
        .range([height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));

      // color palette = one color per subgroup
      var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#e41a1c', '#377eb8', '#4daf4a'])

      //stack the data? --> stack per subgroup
      var stackedData = d3.stack()
        .keys(subgroups)
        (data)

      // Show the bars
      svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter().append("g")
        .attr("fill", function (d) {
          return color(d.key);
        })
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function (d) {
          return d;
        })
        .enter().append("rect")
        .attr("x", function (d) {
          return x(d.data.group);
        })
        .attr("y", function (d) {
          return y(d[1]);
        })
        .attr("height", function (d) {
          return y(d[0]) - y(d[1]);
        })
        .attr("width", x.bandwidth())
    }
    async _initOld(app = APP, graphElId = 'btech-department-report-student-submissions-graph', w = 800, h = 240) {
      this.app = app;
      let graph = this;

      //Set margins
      graph.graphSettings.months = 6;
      graph.graphSettings.startDate = new Date(new Date().setMonth(new Date().getMonth() - graph.graphSettings.months));
      graph.graphSettings.endDate = new Date();
      graph.graphSettings.barWidth = 1;
      graph.graphSettings.maxY = 15;
      graph.graphSettings.margin = {
        top: 30,
        bottom: 40,
        left: 50,
        right: 20,
      };

      console.log(app.showCourse);
      let subgroups = Object.keys(app.showCourse.enrollments);

      let moduleAssignments = app.showCourse.module_assignments;
      let moduleItems = [];
      for (let a = 0; a < moduleAssignments.length; a++) {
        let moduleAssignment = moduleAssignments[a];
        let submittedUsers = moduleAssignment.submitted_users;
        let moduleItemData = {
          name: a + '. ' + moduleAssignment.name,
          active: 0,
          completed: 0,
          dropped: 0
        };
        for (let i = 0; i < submittedUsers.length; i++) {
          let userId = submittedUsers[i];
          for (let type in app.showCourse.enrollments) {
            let enrollments = app.showCourse.enrollments[type];
            for (let j = 0; j < enrollments.length; j++) {
              let enrollmentUserId = enrollments[j];
              if (enrollmentUserId === userId) moduleItemData[type] += 1;
            }
          }
        }
        moduleItems.push(
          moduleItemData
        );
      }
      console.log(moduleItems);
      let data = moduleItems;
      let groups = moduleItems.map(function (d) {
        return d.name;
      });

      //Begin setting up the graph
      let barColor = graph.getBarColor();
      let el = $('#' + graphElId);
      el.empty();

      var width = w - graph.graphSettings.margin.left - graph.graphSettings.margin.right;
      var height = h - graph.graphSettings.margin.top - graph.graphSettings.margin.bottom;

      var x = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding(0.1);
      graph.graphSettings.x = x;

      var y = d3.scaleOrdinal()
        .domain(subgroups)
        .range([height, 0]);

      graph.graphSettings.y = y;


      graph.svg = d3.select('#' + graphElId).append('svg')
        .attr('class', 'chart')
        .attr('width', w + 50)
        .attr('height', h + 150);

      var chart = graph.svg.append('g')
        .classed('graph', true)
        .attr('transform', 'translate(' + graph.graphSettings.margin.left + ',' + graph.graphSettings.margin.top + ')');


      chart.append('g')
        .classed('x axis', true)
        .attr("transform", "translate(0, " + height + ")")
        .call(
          d3.axisBottom(x)
        )
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(75)")
        .style("text-anchor", "start");;


      chart.append('g')
        .classed('y axis', true)
        .call(d3.axisLeft(y)
          .ticks(graph.graphSettings.maxY));

      graph.graphSettings.barWidth = 5;

      let stackedData = d3.stack()
        .keys(subgroups)
        (data);

      graph.svg
        .selectAll("whatever")
        .data(stackedData)
        .enter()
        .append("rect")
        .attr("x", function (d) {
          return graph.xPlot(d, x)
        })
        .attr("width", x.bandwidth())
        .attr("y", function (d) {
          return graph.yPlot(d, y);
        })
        .attr("height", function (d) {
          return height - graph.yPlot(d, y) + graph.graphSettings.margin.top;
        })
        .attr("fill", barColor);

      graph.svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", 0 - ((height + graph.graphSettings.margin.top) / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of Submissions");
    }

    getBarColor() {
      let app = this.app;
      let graph = this;
      let barColor = app.colors.green;
      return barColor;
    }

    xPlot(d, x) {
      let app = this.app;
      let graph = this;
      let xVal = x(d.name) + graph.graphSettings.margin.left;
      return xVal;
    }

    yPlot(d, y) {
      let app = this.app;
      let graph = this;
      let yVal = y(d.submissions) + graph.graphSettings.margin.top;
      return yVal;
    }
  }

})();