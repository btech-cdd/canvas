(async function () {
  let canvasbody = $("#application");
  let vueString = `
<div>
<div
  @mouseover="buttonX = 120;"
  @mouseleave="buttonX = 10;"
  @click="show = !show;"
  style='
    width: 110px;
    margin-right: -140px;
    position:fixed;
    bottom: 60px;
    z-index:1000;
    transition: 0.5s;
    background-color: #49e;
    border: 2px solid #5ae;
    padding: 10px 20px;
    color: #FFF;
    border-radius: 5px;
    cursor: pointer;
    user-select: none;
  '
  :style="{'right': buttonX + 'px'}"
>
Dept. Status
</div>
<div v-if='show' class='btech-modal' style='display: inline-block;'
@mouseup="dropElement"
>
<!-- ERASE THE DISPLAY PIECE BEFORE GOING LIVE -->
<div class='btech-modal-content' style='left: 2.5%; top: 2.5%; height: 95%; width: 95%; position: absolute; box-sizing: border-box;'>
<div class="btech-tabs" >
<ul style='background-color: #2d3b45'>
<li @click="menu='departments'">Departments</li>
<li style='float: right;' v-on:click='close()'>X</li>
</ul>
</div>
<div class='btech-modal-content-inner'
style='height: 100%; position: relative;'
@mousemove="onMouseMove($event)"
>


<div
v-for='topic in topics'
style='position: absolute; user-select: none; cursor: pointer; background-color: #49e; color: #fff; padding: 0px .5rem; font-size: 1.5rem; border-radius: 5px;'
v-bind:style='{left: "calc(" + topic.elX + "%)", top: "calc(" + topic.elY + "%)"}'
@mousedown="grabElement($event, topic)"
>
<span v-show='topic.editing === false'>{{topic.title}}</span>
<input v-show='topic.editing === true' v-model='topic.title' v-on:blur='topic.editing=false; saveTopicElement(topic);'>

</div>

<div
v-for='department in departments'
style='position: absolute; user-select: none; cursor: pointer;'
v-bind:style='{left: "calc(" + department.elX + "%)", top: "calc(" + department.elY + "%)"}'
@mousedown="grabElement($event, department)"
>
<div style='border: solid 1px #eee; border-left: solid 1rem #49e; padding: 0px .5rem;'>{{department.data.name}}</div>
</div>
</div>
</div>
</div>
</div>
`;
  canvasbody.after('<div id="btech-course-status-vue"></div>');
  $("#btech-course-status-vue").append(vueString);
  this.APP = new Vue({
    el: '#btech-course-status-vue',
    mounted: async function () {
      let app = this;
      let topics = [];

      await $.get("https://jhveem.xyz/api/topics", function (data) {
        for (let i = 0; i < data.length; i++) {
          let topic = data[i];
          topic.type = 'topic';
          topic.editing = false;
          topics.push(topic);
        }
      });
      app.topics = topics;
      let departments = {};
      let savedData = {};
      await $.get("https://jhveem.xyz/api/departments", function (data) {
        for (let i = 0; i < data.length; i++) {
          let department = data[i];
          savedData[department.departmentId] = department;
        }
      });

      await $.get("/api/v1/accounts/3/sub_accounts?per_page=100", function (data) {
        for (let i = 0; i < data.length; i++) {
          let dept = data[i];
          departments[dept.id] = {
            elX: 0,
            elY: 0,
            data: dept,
            editing: false,
            type: 'department'
          }
          let savedDepartmentData = savedData[dept.id];
          if (savedDepartmentData !== undefined) {
            departments[dept.id].elX = savedDepartmentData.elX;
            departments[dept.id].elY = savedDepartmentData.elY;
          } else {
            app.createDepartmentElement(departments[dept.id]);
          }
        }
      });
      app.departments = departments;
    },
    data: function () {
      return {
        departments: {},
        topics: [],
        currentEl: null,
        currentData: null,
        buttonX: 10,
        show: false,
        moving: false,
        firstClick: null,
      }
    },
    methods: {
      async createDepartmentElement(department) {
        let departmentId = department.data.id;
        $.post("https://jhveem.xyz/api/departments", {
          departmentId: departmentId,
          elX: department.elX,
          elY: department.elY
        });
      },
      async saveDepartmentElement(department) {
        let departmentId = department.data.id;
        $.put("https://jhveem.xyz/api/departments/" + departmentId, {
          departmentId: departmentId,
          elX: department.elX,
          elY: department.elY
        });
      },
      async saveTopicElement(topic) {
        let topicId = topic._id;
        $.put("https://jhveem.xyz/api/topics/" + topicId, {
          title: topic.title,
          elX: topic.elX,
          elY: topic.elY
        });
      },
      removeNewLines(str) {
        return str.replace(/\n/g, " ");
      },
      close() {
        this.show = false;
      },
      grabElement(e, data) {
        if (data.editing === false) {
          let app = this;
          let el = $(e.target).parent()[0];
          if (this.currentEl == null) {
            this.currentEl = el;
            this.currentData = data;
          }
          if (!this.moving) {
            if (this.firstClick == el) {
              if (data.type === 'topic') {
                data.editing = true;
                setTimeout(function () {
                  $(el).find("input").focus();
                }, 100);
              }
            }
          }
          this.firstClick = el;
          setTimeout(function () {
            if (app.firstClick == el) {
              app.firstClick = null;
            }
          }, 1000);
        }
      },
      dropElement(e) {
        let app = this;
        if (app.moving === true) {
          app.firstClick = null;
        }
        app.moving = false;
        if (app.currentData !== null) {
          if (app.currentData.type === 'department') {
            app.saveDepartmentElement(app.currentData);
          }
          if (app.currentData.type === 'topic') {
            app.saveTopicElement(app.currentData);
          }
        }
        app.currentEl = null;
        app.currentData = null;
      },
      getOffset(e) {},
      onMouseMove(e) {
        if (this.currentEl !== null && this.currentData !== null) {
          this.moving = true;
          var container = $("#btech-course-status-vue .btech-modal-content-inner");
          var containerOffset = container.offset();
          var relX = e.pageX - containerOffset.left - $(this.currentEl).width() / 2;
          var relY = e.pageY - containerOffset.top - $(this.currentEl).height() / 2;
          let percX = (relX / container.width() * 100).toFixed(2);
          if (percX > 0 && percX <= 100) this.currentData.elX = percX;
          let percY = (relY / container.height() * 100).toFixed(2);
          if (percY > 0 && percY <= 100) this.currentData.elY = percY;
        }
      }
    }
  });
})();