<template>
  <div>
    <select v-bind='currentDepartment'>
      <option v-for='department in availableDepartments'>{{department}}</option>
    </select>
    <div 
      v-for='(user, userId) in users'
      :key='userId'
    >
      <span><a :href="'/users/' + userId">{{user.name}}</a></span><br>
      <div 
        v-for='course in coreCourses'
        :key='course.code'
        :courseData='0'
        style="display: inline-block; border: 1px solid #000; background-color: #334;"
      >
        <div 
          style='box-sizing: border-box; white-space: nowrap; padding: 0px 5px; font-size: 0.75em; background-color: #1C91A4; color: #fff;'
          :style="
            {
              width: courseData + '%'
            }
          " 
         >
          {{course.code}}
        </div>
      </div>
      <div 
        v-for='(course, courseId) in user.courses'
        :key='courseId'
        style="display: inline-block; border: 1px solid #000; background-color: #334;"
      >

        <div 
          style='box-sizing: border-box; white-space: nowrap; padding: 0px 5px; font-size: 0.75em; background-color: #1C91A4; color: #fff;'
          :style="
            {
              width: course[0].progress + '%'
            }
          " 
         >
          {{courseId}}
        </div>
      </div>
    </div>
  </div>
</template>