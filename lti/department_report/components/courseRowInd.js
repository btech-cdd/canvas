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
      console.log("CHECK");
      console.log(vm.course);
      if (vm.course === undefined) return true;
      if (vm.course.canvas_id === null || vm.course.canvas_id === undefined) return true;
      return false;
    }
  },
  data() {
    return {
    }
  },
  mounted() {
    let vm = this;
    console.log(vm.courseName);
    console.log(vm.course);
    console.log(vm.course.canvas_id);
  },
  methods: {
  },
  destroyed: function () {
  }
});