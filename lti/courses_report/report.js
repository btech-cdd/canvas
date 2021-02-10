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
      await app.loadJsonFile('dept_data/3819');
      console.log(app.json.courses_data);
      app.loading = false;
    },

    computed: {
    },

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

      closeCourseReport() {
        let app = this;
        app.showCourse = 'all';
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

    async _init(app, graphElId = 'btech-department-report-student-submissions-graph', w = 800, h = 240) {
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

      let submissions = app.json.courses_data[app.showCourse.name].module_assignments;

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
        .attr("x", 0 - ((height + graph.graphSettings.margin.top) / 2))
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
      let yVal = y(d.count);
      return yVal;
    }
  }

})();