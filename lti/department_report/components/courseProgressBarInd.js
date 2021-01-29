Vue.component('course-progress-bar-ind', {
  template:` 
  <div>
   <div class="btech-course-progress-bar" style="width: 20rem;" :style="progressBarBaseStyle">
      <div 
        class="btech-course-progress-bar-fill" 
        :style="
          progressBarFillStyle
        ">
      </div>
      <div style="color: #000000" class="btech-course-progress-bar-text">
        {{Math.round(progress * 10) / 10}}% 
        <span
          v-if="hours!==0 && !isNaN(hours)">
          ({{Math.round((hours * progress) / 100)}}/{{hours}} HRS)
        </span>
      </div>
    </div> 
    <span>{{bgColor}}, {{barColor}}</span>
  </div>
  `,
  props: {
    progress: 0,
    hours: 0,
    bgColor: '',
    barColor: '',
  },
  computed: {
    progressBarBaseStyle() {
      let vm = this;
      return {
        'background-color': vm.bgColor,
        'width': ((90 / 90) * 20) + 'rem'
      }
    },
    progressBarFillStyle() {
      let vm = this;
      return {
        'background-color': vm.barColor,
        'width': vm.progress + '%'
      }
    }
  },
  data() {
    return {
    }
  },
  mounted() {
    let vm = this
  },
  methods: {
  },
  destroyed: function () {
  }
});