(async function () {
  IMPORTED_FEATURE = {};
  IMPORTED_FEATURE = {
    initiated: false,
    _init(params = {}) {
      if ($('#enrollhs').length > 0) return;
      let content = $('#content');
      content.empty();
      content.html(`
      <div id='enrollhs'>
        <div class='locate-student-container'>
          <input type='text' v-model='studentIdInput'>
          <input type='button' @click='searchStudentId()' value='search'>
        </div>
        <div class='date-input-container'>
          <input type='date' v-model='saveTerm.startDate'>
          <input type='date' v-model='saveTerm.endDate'>
        </div>
        <div class='addition-information-container'>
          <select v-model='saveTerm.type'>
          </select>
          <input type='text' v-model='saveTerm.hours'>
          <input type='text' v-model='saveTerm.school'>
        </div>
        <div class='select-course-container'>
          <select class='select-course'>
            <option>-select initial course-</option>
          </select>
        </div>
        <div class='existing-terms'>
          <div v-for='term in  terms'>
            <span>{{term.startDate}}</span>
            <span>{{term.endDate}}</span>
            <span>{{term.hours}}</span>
            <span>{{term.school}}</span>
          </div>
        </div>
      </div>
      `)
      new Vue({
        el: "#enrollhs",
        mounted: async function () {
          let app = this;
        },
        data: function () {
          return {
            highschools: [
              'Sky View',
              'Cache High',
              'Bear River',
              'Box Elder',
              'Mountain Crest',
              'Green Canyon',
              'Logan High',
              'Ridgeline',
            ],
            terms: [],
            saveTerm: {},
            studentIdInput: ''
          }
        },
        methods: {
          searchStudentId() {
            let app = this;
            console.log(app.studentIdInput);
            app.studentIdInput = '';
          }
        }
      });
    },
  }
})();