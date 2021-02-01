Vue.component('course-row-ind', {
  template:` 
      <div
        style="background-color: rgb(255, 255, 255); display: inline-block; width: 100%; font-size: 0.75rem; padding: .25rem;"
      >
        <div style="display: inline-block; width: 15rem;">
          <a :class="{
              disabled: !checkValidCourseId 
            }" 
            style="text-decoration: none; color: #000000;"
            :href="courseUrl"
            target="_blank">
            {{courseName}} ({{courseCode}})
          </a>
        </div>
        <!--Change the first 90 under width to the course's hours once figure out how to include that-->
        <course-progress-bar-ind
          :progress='progress'
          :colors='colors'
          :hours='0'
        ></course-progress-bar-ind> 
      </div>
  `,
  props: {
    hours: {
      type: Number,
      default: 0
    },
    progress: {
      type: Number,
      default: 0
    },
    course: {
      type: Object,
      default: () => ({type: 'someType'})
    },
    courseName: {
      type: String,
      default: ''
    },
    courseCode: {
      type: String,
      default: ''
    },
    colors: {
      type: Object,
      default: () => ({type: 'someType'})
    },
    userCanvasId: {
      type: String,
      default: ''
    }
  },
  computed: {
    checkValidCourseId: function() {
      let vm = this;
      if (vm.course === undefined) return false;
      if (vm.course.canvas_id === null || vm.course.canvas_id === undefined) return false;
      return true;
    },
    courseUrl: function() {
      let vm = this;
      console.log(vm.course);
      if (vm.course === undefined) return '';
      if (vm.course.canvas_id === null || vm.course.canvas_id === undefined) return '';
      return 'https://btech.instructure.com/courses/' + vm.course.canavs_id+ '/grades/' + vm.userCanvasId
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
    if (vm.course !== undefined) {
      console.log(vm.course.canvas_id);
    }
  },
  methods: {
  },
  destroyed: function () {
  }
});