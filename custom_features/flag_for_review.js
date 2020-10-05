(async function () {
  let canvasbody = $("#application");
  let vueString = `
<div>
  <div
    @mouseover="buttonX = 40;"
    @mouseleave="buttonX = 0;"
    @click="show = !show;"
    style='
      width: 40px;
      margin-right: -70px;
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
    <i class='fas fa-flag'></i>
  </div>
  <div 
    v-if='show' 
    class='btech-modal' 
    style='display: inline-block;'
    @mouseup="dropElement"
  >
    <div 
      class='btech-modal-content' 
      style='left: 25%; top: 10%; height: 80%; width: 50%; position: absolute; box-sizing: border-box;'
    >
      <div class="btech-tabs" >
        <ul>
          <li style='float: right;' v-on:click='close()'>X</li>
        </ul>
      </div>
      <div class='btech-modal-content-inner'
        style='height: 100%; position: relative;'
        @mousemove="onMouseMove($event)"
      >
        <h2 style='text-align: center;'>Flag Submission Form</h2>
        <select v-model='flagType'>
          <option v-for='option in flagOptions' :value='option'>{{option}}</option>
        </select>
        <br>
        <div style='width: 100%; float: left; box-sizing: border-box;'>
          <textarea v-model='flagComment' rows='6' style='width: 100%; max-width: 100%; box-sizing: border-box;'></textarea>
        </div>
        <br>
        <button @click='submitFlag();'>Submit</button>
      </div>
    </div>
  </div>
</div>
`;
  canvasbody.after('<div id="btech-flag-vue"></div>');
  $("#btech-flag-vue").append(vueString);
  this.APP = new Vue({
    el: '#btech-flag-vue',
    mounted: async function () {
      let app = this;
      let flags = [];
      let url = window.location.pathname;
      let rItem = /^\/courses\/([0-9]+)\/(pages|assignments|quizzes)\/(.*)$/;
      let rModules = /^\/courses\/([0-9]+)(\/modules){0,1}$/;
      if (rItem.test(url)) {
        let match = url.match(rItem);
        app.courseId = match[1];
        app.itemType = match[2];
        app.itemId = match[3];
        await $.get("https://jhveem.xyz/api/flags/courses/" + app.courseId + "/" + app.itemType + "/" + app.itemId, function (data) {
          for (let i = 0; i < data.length; i++) {
            let flag = data[i];
            console.log(flag);
          }
        });
        console.log(match);
      } else if (rModules.test(url)) {
        console.log("MODULES");
        let flags = [];
        let match = url.match(rModules);
        app.courseId = match[1];
        await $.get("https://jhveem.xyz/api/flags/courses/" + app.courseId, function (data) {
          for (let i = 0; i < data.length; i++) {
            let flag = data[i];
            flags.push(flag);
            console.log(flag);
          }
        });
        await $.get('/api/v1/courses/' + app.courseId + '/modules?include[]=items&include[]=content_details', function(data) {
          console.log(data);
        })
        console.log(match);
      }

    },
    data: function () {
      return {
        departments: {},
        topics: [],
        currentEl: null,
        currentData: null,
        buttonX: 0,
        show: false,
        moving: false,
        firstClick: null,
        xOffset: null,
        yOffset: null,
        flagOptions: [
          'Video',
          'Copyright',
          'Spelling/Grammar',
          'Missing Content'
        ],
        courseId: null,
        itemType: null,
        itemId: null,
        flagType: '',
        flagComment: '',
        flagTags: []
      }
    },
    methods: {
      async submitFlag() {
        let app = this;
        $.post('https://jhveem.xyz/api/flags', {
          'courseId': app.courseId,
          'itemType': app.itemType,
          'itemId': app.itemId,
          'flagType': app.flagType,
          'tags': app.flagTags,
          'comment': app.flagComment
        }, function (data) {
          console.log(data);
        });
        app.flagType = '';
        app.flagComment = '';
        app.flagTags = [];
        app.close();
      },
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
        let app = this;
        if (data.editing === false) {
          let el = e.target;
          if (e.target !== $("#btech-course-status-vue .btech-modal-content-inner")[0]) {

            app.xOffset = e.pageX - $(el).offset().left;
            app.yOffset = e.pageY - $(el).offset().top;
            console.log($(el).offset());
            console.log(app.xOffset);
            console.log(app.yOffset);
            console.log(e.pageX);
            console.log(e.pageY);
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
      onMouseMove(e) {
        if (this.currentEl !== null && this.currentData !== null) {
          this.moving = true;
          var container = $("#btech-course-status-vue .btech-modal-content-inner");
          var containerOffset = container.offset();
          var relX = e.pageX - containerOffset.left;
          var relY = e.pageY - containerOffset.top;
          let percX = (relX / container.width() * 100).toFixed(2);
          if (percX > 0 && percX <= 100) this.currentData.elX = percX;
          let percY = (relY / container.height() * 100).toFixed(2);
          if (percY > 0 && percY <= 100) this.currentData.elY = percY;
        }
      }
    }
  });
})();