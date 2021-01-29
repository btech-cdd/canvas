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
  props: [
    'progress',
    'hours',
    'bgColor',
    'barColor',
    'colors'
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
        'background-color': vm.colors.blue,
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
  },
  destroyed: function () {
  }
});