<template>
  <div class='btech-modal' style='display: inline-block;'>
    <div class='btech-modal-content'>
      <div class="btech-tabs">
        <ul>
          <li @click="menu='report'">Student Course Report</li>
          <li @click="menu='period'">Grades Between Dates</li>
          <li style='float: right;' v-on:click='close()'>X</li>
        </ul>
      </div>
      <div class='btech-modal-content-inner'>
        <div v-if='loading'>
          <p>Loading...</p>
        </div>
        <div v-else>
          <div v-if="accessDenied">
            <p>
              <b>ERROR:</b> You are not authorized to see all of this student's courses. This often occurs when the
              student
              is not enrolled in any courses in which you have admin rights to View Enrollments.
            </p>
            <p>
              Reach out to your Canvas Administrator if you have received this message in error
            </p>
          </div>

          <div v-else>
            <div v-if="menu=='report'">
              <h5 style='text-align: center;'>Click on column headers to sort by that column.</h5>
              <h5 style='text-align: center;'>Hover over column headers for a description of the information displayed
                in
                that
                column.</h5>
              <div class='btech-report-columns-toggle'>
                <div class='btech-report-column-toggle' style='display: inline-block;' v-for='column in columns'
                  :key='column.name'>
                  <div v-if="column.hideable">
                    <input type="checkbox" v-model="column.visible"><label>{{column.name}}</label>
                  </div>
                </div>
              </div>
              <table class='btech-report-table' border='1'>
                <thead border='1'>
                  <tr>
                    <th v-for='column in visibleColumns' :key='column.name' :class='column.sortable_type'
                      @click="sortColumn(column.name);">{{column.name}}</th>
                  </tr>
                </thead>
                <tbody border='1'>
                  <tr v-if="loading">
                    <td :colspan='visibleColumns.length'>{{loadingMessage}}</td>
                  </tr>
                  <tr v-for='course in courses' :key='course.course_id'>
                    <td v-for='column in visibleColumns' :key='column.name'>
                      <span v-html="getColumnText(column, course)"></span>
                    </td>
                  </tr>
                </tbody>
                <tfoot border='1'>

                </tfoot>
              </table>
            </div>

            <div v-if="menu=='period'">
              <div v-if='loadingAssignments'>{{loadingMessage}}</div>
              <div v-else>
                <div class='btech-report-submission-dates'>
                  <span>Start Date:</span>
                  <input type="date" v-model="submissionDatesStart" @change='calcGradesBetweenDates()'>
                  <span>End Date:</span>
                  <input type="date" v-model="submissionDatesEnd" @change='calcGradesBetweenDates()'>
                </div>
                <table class='btech-report-table' border='1'>
                  <thead border='1'>
                    <tr>
                      <th>Course</th>
                      <th>Term Grades</th>
                      <th>Term Completed</th>
                      <th>Hours Completed</th>
                      <th>Hours Enrolled</th>
                    </tr>
                  </thead>
                  <tbody border='1'>
                    <tr v-if="loading">
                      <td :colspan='visibleColumns.length'>{{loadingMessage}}</td>
                    </tr>
                    <tr v-for='course in courses' :key='course.course_id'>
                      <td>
                        {{course.name}}
                      </td>

                      <td>{{getGradesBetweenDates(course.course_id)}}</td>
                      <td>{{getProgressBetweenDates(course.course_id)}}</td>
                      <td>{{getHoursCompleted(course)}}</td>
                      <td>{{getHoursEnrolled(course.course_id)}}</td>
                    </tr>
                    <tr height="10px"></tr>
                  </tbody>
                  <tfoot border='1'>
                    <tr v-if='showGradeDetails'>
                      <td><b>Weighted Grade To Date</b></td>
                      <td>{{weightedGradeForTerm()}}%</td>
                    </tr>
                    <tr v-if='showGradeDetails'>
                      <td><b>Hours Completed</b></td>
                      <td>{{sumHoursCompleted()}}</td>
                    </tr>
                    <tr v-if='showGradeDetails'>
                      <td><b>Estimated Hours Enrolled</b></td>
                      <td>{{estimatedHoursEnrolled}}</td>
                    </tr>
                    <tr>
                      <td><b>Estimated Hours Required</b></td>
                      <td><input style="padding: 0px 4px; margin: 0px;" v-model="estimatedHoursRequired" type="text">
                      </td>
                    </tr>
                    <tr>
                      <td><b>Weighted Final Grade</b>
                        <div style='float: right;'>
                          <i style='cursor: pointer;' v-if='showGradeDetails' class='icon-minimize'
                            @click='showGradeDetails = false;' title='Hide additional information.'></i>
                          <i style='cursor: pointer;' v-if='!showGradeDetails' class='icon-question'
                            @click='showGradeDetails = true;'
                            title='Click here for more details about how this grade was calculated.'></i>
                        </div>
                      </td>
                      <td>{{weightedFinalGradeForTerm()}}%</td>
                    </tr>
                  </tfoot>
                </table>
                <!--WAIT DON'PUBLISH THIS YET
                  <div v-if='IS_ME' style="text-align: right;">
                    <img style="zoom: 2; image-rendering: pixelated;"
                      src="https://btech-cdd.github.io/media/it-will-all-be-fine.png"
                    >
                  </div>
                -->
                <div v-if='showGradeDetails'>
                  <div v-for='course in includedAssignments' :key='course.name'>
                    <div v-if='checkIncludeCourse(course)'>
                      <h3><a :href="'/courses/' + course.id + '/grades/' + userId">{{course.name}}</a></h3>
                      <div v-for='group in course.groups' :key='group.name'>
                        <div v-if='checkIncludeGroup(group)'>
                          {{group.name}}
                          <div v-for='assignment in group.assignments' :key='assignment.id'>
                            <div v-if='checkIncludeAssignment(assignment)'>
                              -<a :href="'/courses/' + course.id + '/assignments/' + assignment.id + '/submissions/' + assignment.sub">{{assignment.name}}</a> ({{assignment.score}} / {{assignment.points_possible}})
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
    </div>
  </div>
</template>