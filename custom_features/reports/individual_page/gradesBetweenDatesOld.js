(async function() {
  class Column {
    constructor(name, description, average, sort_type, percent, hideable = true) {
      this.name = name;
      this.description = description;
      this.average = average;
      this.sort_type = sort_type; //needs to be a result of typeof, probably mostly going to be string or number
      this.sort_state = 0; //becomes 1 or -1 depending on asc or desc
      this.visible = true;
      this.percent = percent;
      this.hideable = hideable;
    }
  }
  
  Vue.component('show-grades-between-dates', {
    template: ` 
      <div>
        <div v-if='loadingAssignments'>
          <progress 
            id="load-progress" 
            :value="loadingProgress" 
            max="100"
          ></progress>
          {{loadingMessage}}
        </div>
        <div v-else>
          <div class='btech-report-submission-dates'>
            <select @change='updateDatesToSelectedTerm()' v-model='selectedTermId'>
              <option selected disabled value=''>-select term-</option>
              <option v-for='term in terms' :value='term._id'>{{dateToHTMLDate(term.startDate) + " to " + dateToHTMLDate(term.endDate)}} ({{term.hours}} hrs)</option>
            </select>
            <span>Start Date:</span>
            <input type="date" v-model="submissionDatesStart" @change='getIncludedAssignmentsBetweenDates()'>
            <span>End Date:</span>
            <input type="date" v-model="submissionDatesEnd" @change='getIncludedAssignmentsBetweenDates()'>
          </div>
          <table class='btech-report-table' border='1'>
            <thead border='1'>
              <tr>
                <th>Course</th>
                <th>Term Grades</th>
                <th>Term Completed</th>
                <th>Course Hours</th>
                <th>Hours Completed</th>
              </tr>
            </thead>
            <tbody border='1'>
              <tr v-for='course in courses' :key='course.course_id'>
                <td>
                  <a 
                    :href="\`/courses/\${course.course_id}/grades/\${userId}\`"
                    target="_blank"
                  >
                    {{course.name}}
                  </a>
                </td>

                <td>{{getGradesBetweenDates(course.course_id)}}</td>
                <td>{{getProgressBetweenDates(course.course_id)}}</td>
                <td><input style="padding: 0px 4px; margin: 0px; width: 3rem;" v-model="course.hours" type="text">
                </td>
                <td>{{getHoursCompleted(course)}}</td>
              </tr>
              <tr height="10px"></tr>
            </tbody>
            <tfoot border='1'>
              <tr>
                <td><b>Weighted Final Grade</b>
                </td>
                <td>
                  {{weightedFinalGradeForTerm()}}%
                  <div style='float: right;'>
                    <i style='cursor: pointer;' v-if='showGradeDetails' class='icon-minimize'
                      @click='showGradeDetails = false;' title='Hide additional information.'></i>
                    <i style='cursor: pointer;' v-if='!showGradeDetails' class='icon-question'
                      @click='showGradeDetails = true;'
                      title='Click here for more details about how this grade was calculated.'></i>
                  </div>
                </td>
              </tr>
              <tr height="10px"></tr>
              <tr v-if='showGradeDetails'>
                <td><b>Weighted Grade To Date</b></td>
                <td>{{weightedGradeForTerm()}}%</td>
              </tr>
              <tr v-if='showGradeDetails'>
                <td><b>Hours Completed</b></td>
                <td>{{sumHoursCompleted()}}</td>
              </tr>
              <tr v-if='showGradeDetails'>
                <td><b>Hours Enrolled</b></td>
                <td>{{estimatedHoursEnrolled}}</td>
              </tr>
              <tr>
                <td><b>Estimated Hours Required</b></td>
                <td><input style="padding: 0px 4px; margin: 0px;" v-model="estimatedHoursRequired" type="text">
                </td>
              </tr>
            </tfoot>
          </table>
          <div v-if='showGradeDetails'>
            <!--include a reset button to go back to the default. Probably just rerun the code from on change of date-->
            <div v-for='course in includedAssignments' :key='course.name'>
              <div v-if='checkIncludeCourse(course)'>
                <h3>
                  <input @change="calcGradesFromIncludedAssignments" type="checkbox" :id="course.id + '-checkbox'"
                    v-model="course.include">
                  <a :href="'/courses/' + course.id + '/grades/' + userId" target="_blank">{{course.name}}</a>
                </h3>
                <div v-if='course.include'>
                  <div v-for='group in course.groups' :key='group.name'>
                    <div v-if='checkIncludeGroup(group)'>
                      <h4>
                        <input @change="calcGradesFromIncludedAssignments" type="checkbox"
                          :id="course.id + '-' + group.id + '-checkbox'"
                          v-model="group.include" :disabled="!course.include">
                        <b>{{group.name}} ({{group.group_weight}}%)</b></h4>
                      <div v-if='group.include'>
                        <div v-for='assignment in group.assignments' :key='assignment.id'>
                          <div v-if='checkIncludeAssignment(assignment)'>
                            <div>
                              <input @change="calcGradesFromIncludedAssignments" type="checkbox"
                                :id="course.id + '-' + group.id + '-' + assignment.id + '-checkbox'"
                                v-model="assignment.include" :disabled="!course.include || !group.include">

                              <a style='padding-left: 1em;'
                                :href="'/courses/' + course.id + '/assignments/' + assignment.id + '/submissions/' + assignment.sub"
                                target="_blank"
                                >
                                {{assignment.name}}
                              </a>
                            </div>
                            <div style='padding-left: 1.5em;'>
                              {{assignment.score}} / {{assignment.points_possible}} pts
                              ({{Math.round((assignment.score / assignment.points_possible) * 100)}}%)
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    `,
    props: {
      colors: {
        type: Object,
        default: () => ({})
      },
      IS_TEACHER: false,
      scroll: {
        type: Boolean,
        default: false 
      },
      terms: {
        type: Array,
        default: [] 
      },
      enrollments: {
        type: Object,
        default: () => ({})
      },
      settings: {
        type: Object,
        default: () => ({})
      },
      userId: "",
      user: {
        type: Object,
        default: () => ({})
      },
      studentTree: {
        type: Object,
        default: () => ({
          type: 'someType'
        })
      }
    },
    computed: {},
    data() {
      return {
        selectedTermId: '',
        selectedTerm: {},
        gradesBetweenDates: {},
        progressBetweenDates: {},
        hoursAssignmentData: {},
        hoursBetweenDates: {},
        submissionData: {},
        showGradeDetails: false,
        includedAssignments: {},
        courseTotalPoints: {},
        courseAssignmentGroups: {},
        estimatedHoursEnrolled: 0,
        estimatedHoursRequired: 0,
        submissionDatesStart: undefined,
        submissionDatesEnd: undefined,
        loadingProgress: 0,
        loadingMessage: "Loading...",
        loadingAssignments: true,
        submissionData: {},
        courseAssignmentGroups: {},
        courses: [],
        columns: [
          new Column('Name', '', false, 'string', false, false),
          new Column('State', '', false, 'string', false),
          new Column('Hours', '', false, 'number', false),
          new Column('Grade To Date', '', true, 'number', true),
          new Column('Final Grade', '', true, 'number', true),
          new Column('Points', '', true, 'number', true),
          new Column('Submissions', '', true, 'number', true),
          new Column('Days Since Last Submission', '', true, 'number', false)
        ],
      }
    },
    created: async function () {
      this.loadingProgress = 0;
      this.loadingMessage = "Loading Courses";
      this.courses = await this.getCourseData();

      for (let i = 0; i < this.courses.length; i++) {
        let courseId = this.courses[i].course_id;
        this.loadingMessage = "Loading Submissions for Course " + this.courses[i].course_id;
        this.submissionData[courseId] = await this.getSubmissionData(courseId);
        this.loadingProgress += (50 / this.courses.length) * 0.5;
        //get assignment group data
        this.loadingMessage = "Loading Assignment Groups for Course " + this.courses[i].course_id;
        this.courseAssignmentGroups[this.courses[i].course_id] = await canvasGet("/api/v1/courses/" + this.courses[i].course_id + "/assignment_groups", {
          'include': [
            'assignments'
          ]
        });
        this.loadingProgress += (50 / this.courses.length) * 0.5;
      }
      this.loadingAssignments = false;
      console.log("USER ID" + this.userId);
    },

    methods: {
      dateToString(date) {
        if (typeof date == 'string') {
          if (date == "" || date == "N/A") return "N/A";
          date = new Date(date);
        }
        if (date == null) return "N/A";
        let year = date.getFullYear();
        let month = (1 + date.getMonth()).toString().padStart(2, '0');
        let day = date.getDate().toString().padStart(2, '0');

        return month + '/' + day + '/' + year;
      },
      async getCourseData() {
        let app = this;
        let courses = [];
        let courseList = await this.getCourses();
        if (app.IS_TEACHER) {
          for (let c = 0; c < courseList.length; c++) {
            let courseData = courseList[c];
            this.loadingMessage = "Loading Course Data for Course " + courseData.course_id;
            let course = await app.newCourse(courseData.course_id, courseData.state, courseData.name, courseData.year);
            let gradesData = await app.getCourseGrades(course.course_id);
            this.loadingProgress += (50 / courseList.length) * 0.5;
            course.grade_to_date = gradesData.grade;
            course.final_grade = gradesData.final_grade;
            course.points = gradesData.points;

            this.loadingMessage = "Loading Assignment Data for Course " + courseData.course_id;
            await app.getAssignmentData(course, gradesData.enrollment);
            this.loadingProgress += (50 / courseList.length) * 0.5;
            courses.push(course);
          }
        } else {
          for (let c = 0; c < courseList.length; c++) {
            let courseData = courseList[c];
            this.loadingMessage = "Loading Course Data for Course " + courseData.course_id;
            let course = await app.newCourse(courseData.course_id, courseData.state, courseData.name, courseData.year);
            this.loadingProgress += (50 / courseList.length) * 0.5;
            course.grade_to_date = courseData.enrollment.grades.current_score;
            if (course.grade_to_date == null) course.grade_to_date = "N/A";
            course.final_grade = courseData.enrollment.grades.final_score;
            if (course.final_grade == null) course.final_grade = "N/A";
            course.points = app.calcPointsProgress(course.grade_to_date, courseData.final_grade);
            this.loadingMessage = "Loading Assignment Data for Course " + course.course_id;
            await app.getAssignmentData(course, courseData.enrollment);
            this.loadingProgress += (50 / courseList.length) * 0.5;
            courses.push(course);
          }


        }
        return courses;
      },
      async processCourses() {
        let app = this;
        let list = [];
        let dates = {};
        let enrollments = this.enrollments; 
        let enrollment_data = {};
        for (let e = 0; e < enrollments.length; e++) {
          let enrollment = enrollments[e];
          if (enrollment.role == "StudentEnrollment") {
            let startDate = new Date(enrollment.updated_at);
            let year = startDate.getFullYear();
            let month = startDate.getMonth();
            if (month < 6) year -= 1;
            try {
              let course = await $.get("/api/v1/courses/" + enrollment.course_id);
              dates[enrollment.course_id] = year;
              enrollment_data[enrollment.course_id] = enrollment;
              list.push({
                name: course.name,
                course_id: enrollment.course_id,
                state: enrollment.enrollment_state, //need to fix getting this info
                year: year, //need to fix getting this info
                enrollment: enrollment
              });
            } catch {
              console.log("COULD NOT LOAD COURSE " + enrollment.course_id);
            }
          }
        }
        return list;
      },
      async getCourses() {
        let app = this;
        let list = [];
        list = app.processCourses();
        /*
        if (IS_TEACHER) { //possible change this to just do a check for the .courses class
          let url = window.location.origin + "/users/" + app.userId;
          await $.get(url).done(function (data) {
            list = app.processCoursePageTeacherView(data);
          }).fail(function (e) {
            app.accessDenied = true;
          });
        } else {
          list = app.processCoursePageStudentView();
        }
        */
        return list;
      },

      updateDatesToSelectedTerm() {
        let app = this;
        let term;
        for (let i = 0; i < app.terms.length; i++) {
          if (app.terms[i]._id === app.selectedTermId) {
            term = app.terms[i];
          }
        }
        app.selectedTerm = term;
        app.submissionDatesStart = app.dateToHTMLDate(term.startDate);
        app.submissionDatesEnd = app.dateToHTMLDate(term.endDate);
        app.estimatedHoursEnrolled = term.hours;
        app.getIncludedAssignmentsBetweenDates();
      },
      sumProgressBetweenDates() {
        let sum = 0;
        for (let c in this.courses) {
          let course = this.courses[c];
          let progress = this.progressBetweenDates[course.course_id];
          if (progress > 0) {
            sum += progress;
          }
        }
        let output = sum;
        return output;
      },
      sumHoursCompleted() {
        let sum = 0;
        for (let c in this.courses) {
          let course = this.courses[c];
          let progress = this.progressBetweenDates[course.course_id];
          let hours = course.hours;
          if (hours == "N/A") hours = 0;
          if (progress > 0 && hours > 0) {
            sum += Math.round(progress * hours) * .01;
          }
        }
        let output = parseFloat(sum.toFixed(2));
        if (isNaN(output)) return 0;
        return output;
      },

      weightedGradeForTermPercent() {
        let totalWeightedGrade = 0;
        let totalProgress = this.sumProgressBetweenDates();
        for (let c in this.courses) {
          let course = this.courses[c];
          let progress = this.progressBetweenDates[course.course_id];
          let grade = this.gradesBetweenDates[course.course_id];
          if (progress !== undefined && grade !== undefined && grade != "N/A") {
            let weightedGrade = grade * (progress / totalProgress);
            totalWeightedGrade += weightedGrade;
          }
        }
        let output = parseFloat(totalWeightedGrade.toFixed(2));
        if (isNaN(output)) return 0;
        return output;
      },

      weightedGradeForTermHours() {
        let totalWeightedGrade = 0;
        let totalHoursCompleted = this.sumHoursCompleted();
        for (let c in this.courses) {
          let course = this.courses[c];
          let progress = this.progressBetweenDates[course.course_id];
          let grade = this.gradesBetweenDates[course.course_id];
          if (progress !== undefined && grade !== undefined && grade != "N/A") {
            let hoursCompleted = this.getHoursCompleted(course);
            let weightedGrade = grade;
            //have some check to not = 0 if total hours completed is 0
            weightedGrade *= (hoursCompleted / totalHoursCompleted);
            totalWeightedGrade += weightedGrade;
          }
        }
        let output = parseFloat(totalWeightedGrade.toFixed(2));
        if (isNaN(output)) return 0;
        return output;
      },

      weightedGradeForTerm() {
        let totalHoursCompleted = this.sumHoursCompleted();
        //In some instances there will only be courses that have no hours, such as for HS. For this minority of cases, treat all courses as equal weight and weight score based on percent completed
        if (totalHoursCompleted === 0) {
          return this.weightedGradeForTermPercent();
        } else {
          return this.weightedGradeForTermHours();
        }
      },

      getHoursEnrolled(courseId) {
        let hours = this.hoursBetweenDates[courseId];
        if (hours !== undefined) return hours;
        return "N/A";
      },

      weightedFinalGradeForTerm() {
        let requiredHours = this.estimatedHoursRequired * .67;
        let hoursCompleted = this.sumHoursCompleted();
        let grade = this.weightedGradeForTerm();
        if ((hoursCompleted < requiredHours) && (requiredHours !== 0 && hoursCompleted !== 0)) {
          grade *= (hoursCompleted / requiredHours);
        }
        let output = grade.toFixed(2);
        if (isNaN(output)) return 0;
        return output;
      },

      getProgressBetweenDates(courseId) {
        let progress = this.progressBetweenDates[courseId];
        if (progress !== undefined) return (progress + "%");
        return "";
      },

      getGradesBetweenDates(courseId) {
        let grade = this.gradesBetweenDates[courseId];
        if (grade !== undefined) return (grade + "%");
        return "";
      },

      getHoursCompleted(course) {
        let progress = this.progressBetweenDates[course.course_id];
        let completed = 0;
        if (progress !== undefined) completed = parseFloat((Math.round(progress * course.hours) * .01).toFixed(2));
        if (isNaN(completed)) completed = 0;
        return completed;
      },

      sortColumn(header) {
        let app = this;
        let name = this.columnNameToCode(header);
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
        app.courses.sort(function (a, b) {
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

      async getIncludedAssignmentsBetweenDates() {
        let app = this;
        let includedAssignments = {};
        let startDate = app.parseDate(app.submissionDatesStart);
        let endDate = app.parseDate(app.submissionDatesEnd);
        //break if a date is undefined
        if (startDate === undefined || endDate === undefined) return;

        //otherwise fill in all the progress / grades data for those dates
        for (let i = 0; i < app.courses.length; i++) {
          let course = app.courses[i];
          let courseId = course.course_id;
          includedAssignments[courseId] = {
            name: course.name,
            id: courseId,
            include: true,
            groups: {}
          };
          let subs = this.submissionData[courseId];
          if (subs !== undefined) {
            //get the data for all submissions
            let subData = {};
            for (let s = 0; s < subs.length; s++) {
              let sub = subs[s];
              //if (sub.posted_at != null) { //used to check if posted
              if (sub.score !== null) { //trying out including anything with a score
                subData[sub.assignment_id] = sub;
              }
            }

            let assignmentGroups = this.courseAssignmentGroups[courseId];

            //calc sum weights, if zero, then don't check weights to include
            let sumWeights = 0;
            for (let g = 0; g < assignmentGroups.length; g++) {
              let group = assignmentGroups[g];
              sumWeights += group.group_weight;
            }

            //weight grades based on assignment group weighting and hours completed in the course
            for (let g = 0; g < assignmentGroups.length; g++) {
              let group = assignmentGroups[g]
              includedAssignments[courseId].groups[g] = {
                name: group.name,
                id: group.id,
                group_weight: group.group_weight,
                include: true,
                assignments: {}
              };
              if (group.group_weight > 0 || sumWeights === 0) {
                //check each assignment to see if it was submitted within the date range and get the points earned as well as points possible
                for (let a = 0; a < group.assignments.length; a++) {
                  let assignment = group.assignments[a];
                  if (assignment.published) {
                    if (assignment.id in subData) {
                      let sub = subData[assignment.id];
                      let subDateString = sub.submitted_at;
                      if (subDateString === null) subDateString = sub.graded_at;
                      includedAssignments[courseId].groups[g].assignments[assignment.id] = {
                        include: false,
                        id: assignment.id,
                        name: assignment.name,
                        score: sub.score,
                        points_possible: assignment.points_possible,
                        sub: sub.id,
                        date: subDateString
                      };
                      let subDate = new Date(subDateString);
                      if (subDate >= startDate && subDate <= endDate) {
                        includedAssignments[courseId].groups[g].assignments[assignment.id].include = true;
                      }
                    }
                  }
                }
              }
            }
          }
        }
        app.includedAssignments = JSON.parse(JSON.stringify(includedAssignments));
        app.calcGradesFromIncludedAssignments();
      },

      calcGradesFromIncludedAssignments() {
        let app = this;
        let gradesBetweenDates = {};
        let progressBetweenDates = {};
        let startDate = this.parseDate(this.submissionDatesStart);
        let endDate = this.parseDate(this.submissionDatesEnd);
        let midtermPercentCompleted = 1;
        let currentDate = new Date();
        if (currentDate < endDate) {
          midtermPercentCompleted = (currentDate - startDate) / (endDate - startDate);
        }
        //break if a date is undefined
        if (startDate === undefined || endDate === undefined) return;

        for (let courseId in app.includedAssignments) {
          let course = app.includedAssignments[courseId];
          if (app.checkIncludeCourse(course) && course.include) {
            let currentWeighted = 0;
            let totalWeights = 0; //sum of all weight values for assignment groups
            let totalWeightsSubmitted = 0; //sum of all weight values for assignment groups if at least one submitted assignment
            let totalProgress = 0;
            let totalCurrentPoints = 0; //all points earned in the course
            let totalPossiblePoints = 0; //all points available to have earned from submitted assignments
            let totalTotalPoints = 0; //all points in the course;

            let sumGroupWeights = 0; //used to check if group weights are even used
            for (let groupId in course.groups) {
              let group = course.groups[groupId];
              if (group.include) {
                sumGroupWeights += group.group_weight;
              }
            }

            for (let groupId in course.groups) {
              let group = course.groups[groupId];
              if (app.checkIncludeGroup(group) && group.include) {
                if (group.group_weight > 0 || sumGroupWeights === 0) {
                  let currentPoints = 0; //points earned
                  let possiblePoints = 0; //potential points earned
                  let totalPoints = app.calcCourseGroupPointsPossible(courseId, groupId, sumGroupWeights); //all points in the course
                  totalTotalPoints += totalPoints;
                  //check each assignment to see if it was submitted within the date range and get the points earned as well as points possible
                  for (let assignmentId in group.assignments) {
                    let assignment = group.assignments[assignmentId];
                    if (assignment.include) {
                      currentPoints += assignment.score;
                      totalCurrentPoints += assignment.score;
                      possiblePoints += assignment.points_possible;
                      totalPossiblePoints += assignment.points_possible;
                    }
                  }
                  //update info for the submission/earned points values
                  if (possiblePoints > 0) {
                    let groupScore = currentPoints / possiblePoints;
                    if (sumGroupWeights > 0) {
                      currentWeighted += groupScore * group.group_weight;
                    } else {
                      currentWeighted += groupScore;
                    }
                    totalWeightsSubmitted += group.group_weight;
                  }
                  //update info for total possible points values 
                  if (totalPoints > 0) {
                    let progress = possiblePoints / totalPoints;
                    if (sumGroupWeights > 0) {
                      totalProgress += progress * group.group_weight;
                    } else {
                      totalProgress += progress;
                    }
                    totalWeights += group.group_weight;
                  }
                }
              }
            }
            //if there are any points possible in this course, put out some summary grades data
            if (totalWeights > 0 || sumGroupWeights === 0) {
              let output;
              let weightedGrade;
              //dispaly grade
              if (sumGroupWeights > 0) {
                weightedGrade = Math.round(currentWeighted / totalWeightsSubmitted * 10000) / 100;
              } else {
                weightedGrade = Math.round(totalCurrentPoints / totalPossiblePoints * 10000) / 100;
              }
              output = "";
              if (!isNaN(weightedGrade)) {
                output = weightedGrade;
              }
              gradesBetweenDates[courseId] = output;

              //display progress
              let progress = totalProgress;
              if (totalWeights > 0) {
                progress = Math.round((totalProgress / totalWeights) * 10000) / 100;
              } else {
                progress = Math.round((totalPossiblePoints / totalTotalPoints) * 10000) / 100;
              }
              output = "";
              if (!isNaN(progress)) {
                output = progress;
              }
              progressBetweenDates[courseId] = output;
            }
          }
        }
        app.gradesBetweenDates = JSON.parse(JSON.stringify(gradesBetweenDates));
        app.progressBetweenDates = JSON.parse(JSON.stringify(progressBetweenDates));
        //estimate the hours enrolled from the hours between dates data collected
        //this value can be edited by the instructor
        let count = 0;
        app.estimatedHoursEnrolled = app.selectedTerm.hours;
        let estimatedHoursRequired = Math.floor(app.estimatedHoursEnrolled * midtermPercentCompleted);
        if (isNaN(estimatedHoursRequired)) estimatedHoursRequired = 0;
        this.estimatedHoursRequired = estimatedHoursRequired;
      },

      calcCourseGroupPointsPossible(courseId, groupId, sumGroupWeights) {
        let app = this;
        let assignmentGroups = app.courseAssignmentGroups[courseId];
        let group = assignmentGroups[groupId];
        let totalPoints = 0;
        if (group.group_weight > 0 || sumGroupWeights === 0) {
          //check each assignment to see if it was submitted within the date range and get the points earned as well as points possible
          for (let a = 0; a < group.assignments.length; a++) {
            let assignment = group.assignments[a];
            if (assignment.published) {
              totalPoints += assignment.points_possible;
            }
          }
        }
        return totalPoints;
      },

      parseDate(dateString) {
        if (dateString == undefined) return undefined;
        let pieces = dateString.split("-");
        let year = parseInt(pieces[0]);
        let month = parseInt(pieces[1] - 1);
        let day = parseInt(pieces[2]) + 1;
        let date = new Date(year, month, day);
        return date;

      },
      async getSubmissionData(courseId) {
        let app = this;
        let subs = await canvasGet("/api/v1/courses/" + courseId + "/students/submissions", {
          'student_ids': [app.userId],
          'include': ['assignment']
        })
        return subs;
      },

      async newCourse(id, state, name, year) {
        let app = this;
        let course = {};
        course.course_id = id;
        let url = "/api/v1/courses/" + id;
        let hours = "N/A";
        //get course hours if there's a year
        if (year !== null) {
          await $.get(url).done(function (data) {
            let crsCode = data.course_code;
            hours = COURSE_HOURS?.[crsCode]?.hours ?? 0;
            //Check to see if a previous year can be found if current year doesn't work
            for (let i = 1; i < 5; i++) {
              if (hours == undefined) hours = COURSE_HOURS?.[crsCode].hours;
            }
            if (hours === undefined) hours = 0;
          })
        }
        course.hours = hours;
        course.state = state;
        course.name = name;
        course.days_in_course = 0;
        course.days_since_last_submission = 0;
        course.days_since_last_submission_color = "#fff";
        course.section = "";
        course.grade_to_date = "N/A";
        course.points = 0;
        course.final_grade = "N/A";
        course.section = "";
        course.ungraded = 0;
        course.submissions = 0;
        course.nameHTML = "<a target='_blank' href='" + window.location.origin + "/courses/" + id + "'>" + name + "</a> (<a target='_blank' href='https://btech.instructure.com/courses/" + id + "/grades/" + app.userId + "'>grades</a>)";
        return course;
      },

      

      calcPointsProgress(grade, final_grade) {
        let points = "N/A";
        if (!isNaN(parseInt(grade)) && !isNaN(parseInt(final_grade))) {
          points = Math.round(final_grade / grade * 100);
          if (isNaN(points)) points = 0;
        }
        return points;
      },
      async getCourseGrades(course_id) {
        let output = {
          found: false
        };
        let app = this;
        let user_id = app.userId;
        let url = "/api/v1/courses/" + course_id + "/search_users?user_ids[]=" + user_id + "&include[]=enrollments";
        await $.get(url, function (data) {
          if (data.length > 0) {
            output.found = true;
            let enrollment = data[0].enrollments[0];
            output.enrollment = enrollment;
            let grades = enrollment.grades;
            if (grades !== undefined) {
              let grade = grades.current_score;
              if (grade == null) {
                grade = 0;
              }
              output.grade = grade;

              let final_grade = enrollment.grades.final_score;
              if (final_grade == null) final_grade = 0;
              if (grade == "N/A" && final_grade == 0) final_grade = "N/A";
              output.final_grade = final_grade;

              let points = app.calcPointsProgress(grade, final_grade);

              output.points = points;
            }
          }
        });
        return output;
      },

      columnNameToCode(name) {
        return name.toLowerCase().replace(/ /g, "_");
      },

      getColumnText(column, course) {
        let text = course[this.columnNameToCode(column.name)];
        if (column.name === "Name") {
          text = course.nameHTML;
        }
        if (column.percent && !isNaN(text)) {
          text += "%";
        }
        return text;
      },
      async getAssignmentData(course, enrollment) {
        let app = this;
        let course_id = course.course_id;
        let user_id = app.userId;
        //I think this one works better, but it apparently doesn't work for all students??? Might be related to status. The one it didn't work on was inactive
        // let url = "/api/v1/courses/" + course_id + "/analytics/users/" + user_id + "/assignments";
        let url = "/api/v1/courses/" + course_id + "/students/submissions?student_ids[]=" + user_id + "&include=assignment";
        if (enrollment === undefined) return;
        try {
          let submissions = await canvasGet(url);
          course.assignments = submissions;
          let total_points_possible = 0;
          let current_points_possible = 0;
          let most_recent = {};
          let submitted = 0;
          let max_submissions = 0;
          let progress_per_day = 0;
          let start_date = Date.parse(enrollment.created_at);
          let now_date = Date.now();
          let diff_time = Math.abs(now_date - start_date);
          let diff_days = Math.ceil(diff_time / (1000 * 60 * 60 * 24));
          let most_recent_time = diff_time;
          for (let a = 0; a < submissions.length; a++) {
            let submission = submissions[a];
            let assignment = submission.assignment;
            let points_possible = assignment.points_possible;
            if (submission != undefined) {
              let submitted_at = Date.parse(submission.submitted_at);
              total_points_possible += points_possible;
              if (assignment.points_possible > 0) {
                max_submissions += 1;
                if (submission.score !== null) {
                  current_points_possible += points_possible;
                  submitted += 1;
                }
              }
              if (Math.abs(now_date - submitted_at) < most_recent_time) {
                most_recent_time = Math.abs(now_date - submitted_at);
                most_recent = assignment;
              }
            }
          }
          let perc_submitted = Math.round((submitted / max_submissions) * 100);
          if (isNaN(perc_submitted)) perc_submitted = 0;
          course.submissions = perc_submitted;

          //calc days since last submission from time since last submission
          let most_recent_days = Math.ceil(most_recent_time / (1000 * 60 * 60 * 24));

          //Change output depending on status
          if (course.state === 'Active') {
            course.days_since_last_submission = most_recent_days;
          } else if (course.state == 'Completed') {
            course.days_since_last_submission = "Complete";
            course.points = 100;
          } else {
            course.days_since_last_submission = "N/A";
            course.points = "N/A";
          }
        } catch (e) {
          console.log(e);
        }
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
        student.days_in_course = diff_days;
        student.grade = current_score;
        student.final_grade = final_score;
        //there might need to be a check to see if this is a numbe
        if (student.grade > 0 && student.grade != null) {
          student.points = Math.round(student.final_grade / student.grade * 100);
        }
      },

      checkIncludeCourse(course) {
        let app = this;
        for (let g in course.groups) {
          let group = course.groups[g];
          if (app.checkIncludeGroup(group)) {
            return true;
          }
        }
        return false;
      },

      checkIncludeGroup(group) {
        let app = this;
        if (group.include) return true;
        /*
        for (let a in group.assignments) {
          let assignment = group.assignments[a];
          if (app.checkIncludeAssignment(assignment)) {
            return true;
          }
        }
        */
        return false;
      },

      checkIncludeAssignment(assignment) {
        let app = this;
        return true; //show every assignment for now so people can toggle them on and off
        if (assignment.include === true) {
          return true;
        }
        return false;
      },

      close() {
        $(this.$el).hide();
      },

      dateToHTMLDate(date) {
        date = new Date(date);
        date.setDate(date.getDate() + 1);
        let month = '' + (date.getMonth() + 1);
        if (month.length === 1) month = '0' + month;

        let day = '' + date.getDate();
        if (day.length === 1) day = '0' + day;

        let htmlDate = date.getFullYear() + "-" + month + "-" + day;
        return htmlDate;
      },
      async bridgetoolsReq(url) {
        let reqUrl = "/api/v1/users/" + ENV.current_user_id + "/custom_data/btech-reports?ns=dev.bridgetools.reports";
        let authCode = '';
        await $.get(reqUrl, data => {
          authCode = data.data.auth_code;
        });
        //figure out if any params exist then add autho code depending on set up.
        if (!url.includes("?")) url += "?auth_code=" + authCode + "&requester_id=" + ENV.current_user_id;
        else url += "&auth_code=" + authCode + "&requester_id=" + ENV.current_user_id;
        let output;
        await $.get(url, function (data) {
          output = data;
        });
        return output;
      },
    },

    destroyed: function () {}
  });
})();