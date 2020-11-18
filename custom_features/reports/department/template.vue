<template>
  <div>
    <div 
      v-for='(user, userId) in users'
      :key='userId'
    >
      <span><a :href="'/users/' + userId">{{user.name}}</a></span><br>
      <div style="display: inline-block; border: 1px solid #000; background-color: #334;">

        <div 
          v-for='(course, courseId) in user.courses'
          v-bind:key='courseId'
          style='box-sizing: border-box; white-space: nowrap; padding: 0px 5px; font-size: 0.75em; background-color: #1C91A4; color: #fff; width: ` + progress + `%;'
         >
          {{course}}
        </div>
      </div>
    </div>
  </div>
</template>