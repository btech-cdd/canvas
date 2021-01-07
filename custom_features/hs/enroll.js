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
        <div v-if='studentsFound.length === 0' class='locate-student-container'>
          <p>Locate student(s) by thier sis id. Separate students by a comma, newline, or space.</p>
          <textarea v-model='studentIdInput'></textarea>
          <br>
          <input type='button' @click='searchStudentId()' value='search'>
        </div>
        <div v-else>
         <div v-for='student in studentsFound'>
          <span>{{student.user_name}} ({{student.address}})</span>
         </div>
         <input type='button' @click='resetSearch()' value='reset'>
        </div>
        <br>
        <div class='date-input-container'>
          <span>Start Date</span>
          <input type='date' v-model='saveTerm.startDate'>
          <span>End Date</span>
          <input type='date' v-model='saveTerm.endDate'>
        </div>
        <div class='addition-information-container'>
          <select v-model='saveTerm.type'>
            <option>Semester</option>
            <option>Trimester</option>
          </select>
          <span>Hours: </span>
          <input type='number' min='30' max='300' step='15' v-model='saveTerm.hours'>
          <select v-model='saveTerm.school'>
            <option value='' selected disabled>-select school-</option>
            <option v-for='school in schools' :value='school'>
              {{school}}
            </option>
          </select>
        </div>
        <div class='select-course-container'>
          <span>Select a course to enroll this student.</span>
          <select class='select-course'>
            <option value='' selected disabled>-select initial course-</option>
            <option v-for='course in courses' :value='course.id'>
              {{course.name}} ({{course.term.name}})
            </option>
          </select>
        </div>
        <input type='button' @click='enroll()' value='enroll'>
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
          app.dept = CURRENT_DEPARTMENT_ID;
          let courses = await canvasGet('/api/v1/accounts/' + app.dept + '/courses', {
            published: true,
            completed: false,
            blueprint: false,
            state: [
              'available'
            ],
            include: ['term']
          });
          app.courses = courses;
          console.log(courses);
        },
        data: function () {
          return {
            schools: [
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
            studentIdInput: '',
            studentsFound: [],
            studentsNotFound: [],
            dept: '',
            courses: [],
          }
        },
        methods: {
          async searchStudentId() {
            let app = this;
            console.log(app.studentIdInput);
            let ids = app.studentIdInput.split(/[\s,]+/);
            console.log(ids);
            app.studentIdInput = '';
            //look up ids in Canvas
            await $.post('https://btech.instructure.com/accounts/' + app.dept + '/user_lists.json', {
              "user_list": ids,
              "v2": true,
              "search_type": "unique_id"
            }, function (data) {
              app.studentsFound = data.users;
              app.studentsNotFound = data.missing;
            });

            //create list of ids and send it to server to find existing terms for those students
            let studentList = [];
            for (let i = 0; i < app.studentsFound.length; i++) {
              let student = app.studentsFound[i];
              let studentId = student.user_id;
              studentList.push(studentId);
            }
            let terms = await $.post('https://jhveem.xyz/api/enroll_hs/get_list', {
              students: studentList
            }, function (data) {
              console.log(terms);
              for (let i = 0; i < app.studentsFound.length; i++) {
                app.studentsFound[i].terms = [];
                for (let j = 0; j < terms.length; j++) {
                  let term = terms[j];
                  if (term.student_id === app.studentsFound[i].user_id) {
                    app.studentsFound[i].terms.push(term);
                  }
                }
              }
            });
            console.log(app.studentsFound);
          },
          resetSearch() {
            let app = this;
            app.studentsFound = [];
            app.studentsNotFound = [];
          },
          enroll() {

          }
        }
      });
    },
  }
})();