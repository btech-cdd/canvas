<template>
  <div v-if="loading">
    <span>Loading...</span>
  </div>
  <div v-else>
    <select @change='loadDepartmentUsers' v-model='currentDepartment'>
      <option v-for='department in availableDepartments' :value='department'>
        {{json.dept_code_to_name[department].name + " (" + json.dept_code_to_name[department].first_year + "-" + json.dept_code_to_name[department].last_year + ")"}}
      </option>
    </select>
    <div v-for='(users, year) in usersByYear' :key='year'>
      <div v-if='users.length > 0'>
        <h2>{{year}} {{currentDepartment}} Tree</h2>
        <div v-for='user in users' :key='user.id'>
          <div style='padding-bottom: .5em;'>
            <div>
              <div style='width: 180px; display: inline-block;'>
                <a :href="'/users/' + json.sis_to_canv[user.id].canvas_id" target="_blank">
                  {{user.name}}
                </a>
              </div>
              <div style='display: inline-block; width: 4rem;'>
                <span :style="{
                'background-color': calcDepartmentScoreColorBg(user),
                'color': calcDepartmentScoreColorFont(user),
                'padding': '4px',
                'border-radius': '10px',
              }">
                  {{calcDepartmentScoreText(user)}}
                </span>
              </div>
              <div :id="'btech-user-submission-summary-' + json.sis_to_canv[user.id].canvas_id"
                style="display: inline-block; cursor: pointer;"
                @click='openStudentReport(json.sis_to_canv[user.id].canvas_id, user.id);'>
                . . .
              </div>
            </div>

            <!--CORE COURSES-->
            <div v-for='courseType in courseTypes'>
              <div v-if='user[courseType].length > 0'>
                <div 
                  v-for='(course) in user[courseType]' 
                  class='btech-course-progress-bar' 
                  :title="app.json['progress'][department]['base'][course.code].name"
                  :key='course.code' 
                  :style="
                    {
                      'background-color': colors.base,
                    }
                  ">
                  <a :href="'/courses/' + course.course_id" target="_blank">
                    <div class='btech-course-progress-bar-fill' :style="
                      {
                        'background-color': getCourseProgressBarColor(course),
                        width: 100 + '%'
                      }
                    ">
                    </div>
                    <div v-if="course.progress > 0" style="color: #FFFFFF" class='btech-course-progress-bar-text'>
                      {{course.code}}
                    </div>
                    <div v-else style="color: #000000" class='btech-course-progress-bar-text'>
                      {{course.code}}
                    </div>
                  </a>
                </div>
                <div style='border-bottom: solid 1px #000;'></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-show='showStudentReport' class='btech-modal' style='display: inline-block;'>
      <div class='btech-modal-content'>
        <div class="btech-tabs">
          <ul>
            <li @click="menu='report'">Submissions</li>
            <li @click="menu='period'"></li>
            <li style='float: right;' v-on:click='closeStudentReport()'>X</li>
          </ul>
        </div>
        <div class='btech-modal-content-inner'>
          <div id='btech-department-report-student-submissions-graph'>Loading...</div>
        </div>
      </div>
    </div>
  </div>
</template>