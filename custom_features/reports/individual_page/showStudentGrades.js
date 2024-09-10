Vue.component('show-student-grades', {
  template: ` 
    <div>
      <!--HEADER-->
      <ind-header-credits
        :colors="colors"
        :user="user"
        :settings="settings"
        :student-tree="studentTree"
        ref="studentdataheader"
      ></ind-header-credits>

      <!--CONTRACTED HOURS-->
      <div 
        style="margin-block-end: 2rem;" 
      >
        <div v-for="enrollment in enrollments">
          <div style="width: 15rem; display: inline-block;">{{enrollment.course_name}}</div>
          <div style="width: 6rem; display: inline-block;">{{enrollment.computed_current_score}}% ({{enrollment.computed_current_grade}})</div>
          <div style="width: 6rem; display: inline-block;">{{enrollment.computed_final_score}}% ({{enrollment.computed_final_grade}})</div>
        </div>
      </div>
    </div>
  `,
  props: {
    manualHoursPerc: {
      type: Boolean,
      default: false
    },
    colors: {
      type: Object,
      default: () => ({
        type: 'someType'
      })
    },
    scroll: {
      type: Boolean,
      default: false
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    user: {
      type: Object,
      default: () => ({})
    },
    studentTree: {
      type: Object,
      default: () => ({
        type: 'someType'
      })
    }
  },
  computed: {},
  data() {
    return {
      MONTH_NAMES_SHORT: ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
      DAYS_NAMES_SHORT: ["Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"],
      DAYS_NAMES: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      previousMonths: (function () {
        let months = [];
        return months;
      })(),
      enrollments: []
    }
  },
  async mounted() {
    let courses = await canvasGet(`/api/v1/courses?enrollment_Type=student&include[]=total_scores&include[]=current_grading_period_scores`);
    let enrollments = [];
    courses.forEach(course => {
      course.enrollments.forEach(enrollment => {
        enrollment.course_name = course.name;
        enrollments.push(enrollment)
      })
    });
    this.enrollments = enrollments;
  },
  methods: {
    dateToString(date) {
      if (typeof date == 'string') {
        if (date == "" || date == "N/A") return "N/A";
        date = new Date(date);
      }
      if (date == null) return "N/A";
      let year = date.getFullYear();
      let month = (1 + date.getMonth()).toString().padStart(2, '0');
      let day = date.getDate().toString().padStart(2, '0');

      return month + '/' + day + '/' + year;
    },
  },
  destroyed: function () {}
});