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
            <div><span @click='openStudentReport(json.sis_to_canv[user.id].canvas_id);' style='cursor: pointer;'>
                {{user.name}}
              </span>
              (
              <a :href="'/users/' + json.sis_to_canv[user.id].canvas_id" target="_blank">
                profile
              </a>
              )
            </div>

            <!--CORE COURSES-->
            <div v-for='(course, courseCode) in user.courses' :key='courseCode'
              class='btech-course-progress-bar'
              :style="
              {
                'background-color': colors.base 
              }
              "
              >
              <div
                class='btech-course-progress-bar-fill'
                :style="
                  {
                    'background-color': getCourseProgressBarColor(course.progress),
                    width: 100 + '%'
                  }
                ">
              </div>
              <div style='position: relative; white-space: nowrap; padding: 0px 5px; font-size: 0.75em; color: #fff;'>
                {{courseCode}}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if='showStudentReport' class='btech-modal' style='display: inline-block;'>
      <div class='btech-modal-content'>
        <div class="btech-tabs">
          <ul>
            <li @click="menu='report'">Submissions</li>
            <li @click="menu='period'"></li>
            <li style='float: right;' v-on:click='closeStudentReport()'>X</li>
          </ul>
        </div>
        <div class='btech-modal-content-inner'>
          <div id='btech-department-report-student-submissions-graph'></div>
        </div>
      </div>
    </div>
  </div>
</template>