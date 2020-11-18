<template>
  <div>
    <select v-bind='currentDepartment'>
      <option v-for='department in availableDepartments'>{{department}}</option>
    </select>
    <div v-for='(user, userId) in users' :key='userId'>
      <span><a :href="'/users/' + userId">{{user.name}}</a></span><br>

      <!--CORE COURSES-->
      <div>Core</div>
      <div v-for='course in coreCourses' :key='course.code'
        style="display: inline-block; border: 1px solid #000; background-color: #334;">
        <div
          style='box-sizing: border-box; white-space: nowrap; padding: 0px 5px; font-size: 0.75em; background-color: #1C91A4; color: #fff;'
          v-if='user.courses[course.code] !== undefined' :style="
            {
              width: user.courses[course.code][0] + '%'
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
      <div>Electives</div>
      <div v-for='course in electiveCourses' :key='course.code'
        style="display: inline-block; border: 1px solid #000; background-color: #334;">
        <div
          style='box-sizing: border-box; white-space: nowrap; padding: 0px 5px; font-size: 0.75em; background-color: #1C91A4; color: #fff;'
          v-if='user.courses[course.code] !== undefined' :style="
            {
              width: user.courses[course.code][0] + '%'
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
</template>