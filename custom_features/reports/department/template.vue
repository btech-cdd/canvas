<template>
  <div>
    <select @change='loadDepartmentUsers' v-model='currentDepartment'>
      <option v-for='department in availableDepartments' :value='department'>{{json.dept_code_to_name[department].name + "(" + json.dept_code_to_name[department].first_year + "-" + json.dept_code_to_name[department].last_year + ")"}}</option>
    </select>
    <div v-for='(users, year) in usersByYear' :key='year'>
      <div v-for='(user, userId) in users' :key='userId'>
        <div v-if='userId !== "base"'>
          <div style='padding-bottom: .5em;'>
            <div><span @click='openStudentReport(json.sis_to_canv[userId].canvas_id);' style='cursor: pointer;'>{{userId}}</span> (<a
                :href="'/users/' + json.sis_to_canv[userId].canvas_id"
                target="_blank"
                >profile</a>)
            </div>

            <!--CORE COURSES-->
            <div v-for='(course, courseCode) in user' :key='courseCode'
              style="position: relative; display: inline-block; border: 1px solid #000; background-color: #334;">
              <div
                style='position: absolute; box-sizing: border-box; height: 100%; font-size: 0.75em; background-color: #1C91A4;'
                :style="
                  {
                    width: course.progress + '%'
                  }
                "
              >
              </div>
              <div
                style='position: relative; white-space: nowrap; padding: 0px 5px; font-size: 0.75em; color: #fff;'
              >
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