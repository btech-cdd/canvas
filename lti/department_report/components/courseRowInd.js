Vue.component('course-row-ind', {
  template:` 
      <div
        style="background-color: rgb(255, 255, 255); display: inline-block; width: 100%; font-size: 0.75rem; padding: .25rem;"
      >
        <div style="display: inline-block; width: 15rem;">
          <a :class="{
              disabled: checkValidCourseId 
            }" 
            style="text-decoration: none; color: #000000;"
            :href="'https://btech.instructure.com/courses/' + course.canavs_id+ '/grades/' + userCanvasId"
            target="_blank">
            {{courseName}} ({{courseCode}})
          </a>
        </div>
        <!--Change the first 90 under width to the course's hours once figure out how to include that-->
        <course-progress-bar-ind
          :progress='progress'
          :colors='colors'
          :hours='courseHours'
        ></course-progress-bar-ind> 
      </div>
  `,
  props: [
    'progress',
    'user',
    'course',
    'courseName',
    'courseCanvasId',
    'courseCode',
    'courseHours',
    'colors',
    'userCanvasId'
  ],
  computed: {
    checkValidCourseId: function() {
      let vm = this;
      if (vm.course === undefined) return false;
      if (vm.course.canvas_id === null || vm.course.canvas_id === undefined) return false;
      return true;
    }
  },
  data() {
    return {
    }
  },
  mounted() {
    let vm = this;
    console.log(vm.progress);
    console.log(vm.courseName);
    console.log(vm.user);
    console.log(vm.course);
    console.log(vm.colors);
  },
  methods: {
  },
  destroyed: function () {
  }
});