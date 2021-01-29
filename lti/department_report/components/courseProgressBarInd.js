Vue.component('course-progress-bar-ind', {
  template:` 
   <div class="btech-course-progress-bar" style="width: 20rem;" :style="{
                    'background-color': bgColor,
                    'width': ((90 / 90) * 20) + 'rem'
                  }">
                  <div 
                    class="btech-course-progress-bar-fill" 
                    :style="
                    {
                      'background-color': barColor,
                      'width': progress + '%'
                    }
                    ">
                  </div>
                  <div style="color: #000000" class="btech-course-progress-bar-text">
                    {{Math.round(progress * 10) / 10}}% 
                    <span
                      v-if="!isNaN(course.hours)">
                      ({{Math.round((course.hours * progress) / 100)}}/{{course.hours}} HRS)
                    </span>
                  </div>
                </div> 
  `,
  props: {
    progress: 0,
    hours: 0,
    bgColor: '',
    barColor: '',
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