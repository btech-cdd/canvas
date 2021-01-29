Vue.component('course-row-ind', {
  template:` 
    <div
      style="background-color: rgb(255, 255, 255); display: inline-block; width: 100%; font-size: 0.75rem; padding: .25rem;"
    >
      <div style="display: inline-block; width: 15rem;">
        <a :class="{
            disabled: courseCanvasId === null
          }" 
          style="text-decoration: none; color: #000000;"
          :href="'https://btech.instructure.com/courses/' + courseCanvasId + '/grades/' + userCanvasId"
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
    'courseName',
    'courseCanvasId',
    'courseCode',
    'courseHours',
    'colors',
    'userCanvasId'
  ],
  computed: {
    progressBarBaseStyle() {
      let vm = this;
      return {
        'background-color': vm.colors.gray,
        'width': ((90 / 90) * 20) + 'rem'
      }
    },
    progressBarFillStyle() {
      let vm = this;
      return {
        'background-color': vm.getFillColor(),
        'width': vm.progress + '%'
      }
    }
  },
  data() {
    return {
    }
  },
  mounted() {
    let vm = this;
    console.log(vm.progress);
    console.log(vm.bgColor);
    console.log(vm.colors);
  },
  methods: {
    getFillColor() {
      let vm = this;
      let progress = vm.progress;
      let start = new Date(); //include start date
      if (progress >= 100) return vm.colors.complete;

      let diffDays = Math.floor((new Date() - new Date(start)) / (1000 * 60 * 60 * 24));
      if (diffDays <= 60) return vm.colors.green;
      if (diffDays <= 120) return vm.colors.yellow; //yellow
      if (diffDays <= 180) return vm.colors.orange; //orange
      return vm.colors.red; //red
    },
  },
  destroyed: function () {
  }
});