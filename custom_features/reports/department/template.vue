<template>
  <div>
    <select @change='loadDepartmentUsers' v-model='currentDepartment'>
      <option v-for='department in availableDepartments' :value='department'>{{department}}</option>
    </select>
    <div v-for='user in users' :key='user.id'>
      <div v-if='user.name != undefined' style='padding-bottom: .5em;'>
        <div><span @click='openStudentData(user);'>{{user.name}}</span><a :href="'/users/' + user.id">(profile)</a>
        </div>

        <!--CORE COURSES-->
        <div v-for='course in coreCourses' :key='course.code'
          style="display: inline-block; border: 1px solid #000; background-color: #334;">
          <div
            style='box-sizing: border-box; white-space: nowrap; padding: 0px 5px; font-size: 0.75em; background-color: #1C91A4; color: #fff;'
            v-if='user.courses[course.code] !== undefined' :style="
            {
              width: user.courses[course.code][0].progress + '%'
            }
          ">
            {{course.code}}
          </div>
          <div style='box-sizing: border-box; white-space: nowrap; padding: 0px 5px; font-size: 0.75em; color: #fff;'
            v-else>
            {{course.code}}
          </div>
        </div>

        <!--Elective-->
        <div v-if='electiveCourses.length > 0' style='border-top: 1px solid #000;'>
          <div v-for='course in electiveCourses' :key='course.code'
            style="display: inline-block; border: 1px solid #000; background-color: #334;">
            <div
              style='box-sizing: border-box; white-space: nowrap; padding: 0px 5px; font-size: 0.75em; background-color: #1C91A4; color: #fff;'
              v-if='user.courses[course.code] !== undefined' :style="
            {
              width: user.courses[course.code][0].progress + '%'
            }
          ">
              {{course.code}}
            </div>
            <div style='box-sizing: border-box; white-space: nowrap; padding: 0px 5px; font-size: 0.75em; color: #fff;'
              v-else>
              {{course.code}}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if='showStudentReport' class='btech-modal' style='display: inline-block;'>
      <div class='btech-modal-content'>
        <div class='btech-modal-content-inner'>
          <p> TEST </p>
        </div>
      </div>
    </div>
  </div>
</template>