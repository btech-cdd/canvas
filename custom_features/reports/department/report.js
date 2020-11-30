//include a last updated list
(async function () {
  IMPORTED_FEATURE = {};
  IMPORTED_FEATURE = {
    initiated: false,
    async _init(params = {}) {
      let vueString = '';
      await $.get(SOURCE_URL + '/custom_features/reports/department/template.vue', null, function (html) {
        vueString = html.replace("<template>", "").replace("</template>", "");
      }, 'text');
      let content = $("#content");
      content.empty();
      content.append('<div id="canvas-department-report-vue"></div>')
      $("#canvas-department-report-vue").append(vueString);
      this.APP = new Vue({
        el: '#canvas-department-report-vue',
        mounted: async function () {
          let app = this;
          let dept = CURRENT_DEPARTMENT_ID;
          await app.loadJsonFile('progress');
          await app.loadJsonFile('departments');
          await app.loadJsonFile('canvas_to_jenz');
          console.log(app.json);
          app.availableDepartments = app.json.canvas_to_jenz[CURRENT_DEPARTMENT_ID];
          app.currentDepartment = app.availableDepartments[0];

          let usersUrl = '/api/v1/accounts/' + dept + '/users';
          let users = await canvasGet(usersUrl, {
            enrollment_type: 'student'
          });
          for (let i = 0; i < users.length; i++) {
            let user = users[i];
            if (user.id in app.json['progress']) {
              app.json['progress'][user.id].name = user.sortable_name;
            }
          }

          app.loadDepartmentUsers();
          /*
          for (let userId in deptUsers) {
            let user = deptUsers[userId];
            let div = $('<div></div>');
            div.append('<span><a href="/users/' + userId + '">' + user.name + '</a></span><br>');
            for (let courseCode in user.courses) {
              let course = user.courses[courseCode][0];
              let progress = course.progress;
              if (progress > 100) progress = 100;
              div.append(`<div style="display: inline-block; border: 1px solid #000; background-color: #334;">
          <div style='box-sizing: border-box; white-space: nowrap; padding: 0px 5px; font-size: 0.75em; background-color: #1C91A4; color: #fff; width: ` + progress + `%;'>` + courseCode + `</div>
        </div>`);
            }
            div.append('<br>')
            content.append(div);
            console.log(user);
          }
          */
          app.loading = false;
        },

        computed: {
          electiveCourses: function () {},
          coreCourses: function () {}
        },

        data: function () {
          return {
            loading: true,
            json: {},
            users: [],
            currentDepartment: '',
            coreCourses: [],
            electiveCourses: [],
            availableDepartments: [],
            showStudentReport: false
          }
        },
        methods: {
          calcElectiveCourses() {
            let list = [];
            let app = this;
            let courses = app.json['departments'][app.currentDepartment];
            for (let c = 0; c < courses.length; c++) {
              let course = courses[c];
              if (!course.is_core) {
                list.push(course);
              }
            }
            app.electiveCourses = list;
            return list;
          },
          calcCoreCourses() {
            let list = [];
            let app = this;
            let courses = app.json['departments'][app.currentDepartment];
            for (let c = 0; c < courses.length; c++) {
              let course = courses[c];
              if (course.is_core) {
                list.push(course);
              }
            }
            app.coreCourses = list;
            return list;
          },
          loadDepartmentUsers() {
            let app = this;
            console.log(app.currentDepartment);

            //set last activity date
            let users = [];
            let jsonUsers = app.json['progress'];
            let depts = app.json['departments'];
            let deptCourses = depts[app.currentDepartment];
            for (userId in jsonUsers) {
              let user = jsonUsers[userId];
              user.id = userId;
              for (c in deptCourses) {
                let course = deptCourses[c];
                if (user.courses[course.code] !== undefined) {
                  users.push(user);
                  break;
                }
              }
            }

            //Alphabetize
            users.sort(function (a, b) {
              let aName = a.name;
              if (aName != undefined) aName = aName.toLowerCase();
              else aName = '';

              let bName = b.name;
              if (bName != undefined) bName = bName.toLowerCase();
              else bName = '';

              return aName.localeCompare(bName);
            });

            console.log(users);
            app.users = users;
            app.calcCoreCourses();
            app.calcElectiveCourses();
          },

          openStudentReport(user) {
            let app = this;
            app.showStudentReport = true;
          },

          closeStudentReport() {
            app.showStudentReport = false;
          },

          async loadJsonFile(name) {
            let app = this;
            let jsonUrl = 'https://jhveem.xyz/canvas/custom_features/reports/department/' + name + '.json';
            let jsonData = await canvasGet(jsonUrl);
            app.json[name] = jsonData[0];
          }
        }
      })
    }
  }
})();