import {
  ENODEV
} from "constants";

(async function () {
  let canvasbody = $("#application");
  //two things, first, instead of a hard coded left, just have it be the left of the menu it's going in.
  //Second, add a little number in red or something that says how many unresolved flags are there so you don't have to click to see if there are any
  let vueString = `
<div>
  <div
    v-if='pageType=="item"'
    @click="showFlags = !showFlags;"
    style='
      position:fixed;
      bottom: 30px;
      left: 120px;
      z-index:1000;
      background-color: #49e;
      border: 2px solid #5ae;
      padding: 10px 20px;
      color: #FFF;
      border-radius: 5px;
      cursor: pointer;
      user-select: none;
    '
  >
    <i class='fas fa-flag'></i>
  </div>

  <!--THIS IS THE MENU TO REVIEW FLAGS-->
  <div
    v-if='showFlags' 
    id='btech-flags-container'
  >
    <div
      style='
        width: 100%;
        background-color: #49e;
        color: #fff;
        padding: 2px;
        text-align: center;
        cursor: pointer;
      '
      @click='showSubmit = true'
    >
      <i class='fas fa-flag'></i>New
    </div>
    <div 
      class='btech-flags-item'
      v-for='flag in flags'
    >
      <span><strong>{{flag.flagType}}</strong></span>
      <span>{{flag.comment}}</span>
      <span style='text-align: right;'>{{flag.created_by}}</span>
      <span style='float: bottom;' @click='deleteFlag(flag);'>Delete</span>
    </div>
  </div>

  <!--THIS IS THE MODAL TO SUBMIT FLAGS-->
  <div 
    v-if='showSubmit' 
    class='btech-modal' 
    style='display: inline-block; z-index: 1000001;'
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
  canvasbody.after('<div id="btech-flags-vue"></div>');
  $("#btech-flags-vue").append(vueString);
  this.APP = new Vue({
    el: '#btech-flags-vue',
    mounted: async function () {
      let app = this;

      //get CDD Data
      console.log(CDDIDS);

      let url = window.location.pathname;
      let rItem = /^\/courses\/([0-9]+)\/(pages|assignments|quizzes)\/(.*)$/;
      let rModules = /^\/courses\/([0-9]+)(\/modules){0,1}$/;

      //in a page/quiz/assignment
      if (rItem.test(url)) {
        app.pageType = 'item';
        let flags = [];
        let match = url.match(rItem);
        app.courseId = match[1];
        app.itemType = match[2];
        app.itemId = match[3];
        await $.get("https://jhveem.xyz/api/flags/courses/" + app.courseId + "/" + app.itemType + "/" + app.itemId, function (data) {
          for (let i = 0; i < data.length; i++) {
            let flag = data[i];
            console.log(flag);
            flags.push(flag);
          }
        });
        app.flags = flags;
      }

      //For modules page
      if (rModules.test(url)) {
        app.pageType = 'modules';
        let flags = [];
        let match = url.match(rModules);
        app.courseId = match[1];
        await $.get("https://jhveem.xyz/api/flags/courses/" + app.courseId, function (data) {
          for (let i = 0; i < data.length; i++) {
            let flag = data[i];
            let flagUrl = 'https://btech.instructure.com/courses/' + flag.courseId + '/' + flag.itemType + '/' + flag.itemId;
            flag.item_url = flagUrl;
            flags.push(flag);
          }
        });
        app.flags = flags;

        await $.get('/api/v1/courses/' + app.courseId + '/modules?include[]=items&include[]=content_details', function (data) {
          for (let m = 0; m < data.length; m++) {
            let module = data[m];
            for (let i = 0; i < module.items.length; i++) {
              let item = module.items[i];
              if (item.url !== undefined) {
                let item_url = item.url.replace('/api/v1', '');
                for (let f = 0; f < flags.length; f++) {
                  let flag = flags[f];
                  if (item_url === flag.item_url) {
                    let li = $('li#context_module_item_' + item.id);
                    //Clicking on this icon should do something and/or hovering should give info about the flag.
                    li.find('div.ig-row div.ig-info').after('<div class="ig-flag"><i class="fas fa-flag" aria-hidden="true"></i></div>');
                  }
                }
              }
            }
          }
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
        showFlags: false,
        showSubmit: false,
        moving: false,
        firstClick: null,
        xOffset: null,
        yOffset: null,
        flags: [],
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
        flagTags: [],
        pageType: '',
        cddInfo: []
      }
    },
    methods: {
      async submitFlag() {
        let app = this;
        $.post('https://jhveem.xyz/api/flags', {
          'courseId': app.courseId,
          'createdBy': ENV.current_user_id,
          'assignedTo': [],
          'itemType': app.itemType,
          'itemId': app.itemId,
          'flagType': app.flagType,
          'tags': app.flagTags,
          'comment': app.flagComment
        }, function (data) {
          //need to append this flag to list of flags
          console.log(data);
          app.flags.push(data);
        });
        app.flagType = '';
        app.flagComment = '';
        app.flagTags = [];
        app.close();
      },
      async deleteFlag(flag) {
        let app = this;
        await $.delete('https://jhveem.xyz/api/flags/' + flag._id);
        let ind = app.flags.indexOf(flag);
        console.log(ind);
        if (ind > -1) {
          app.flags.splice(ind, 1);
        }
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
        this.showSubmit = false;
      },
      grabElement(e, data) {
        let app = this;
        if (data.editing === false) {
          let el = e.target;
          if (e.target !== $("#btech-course-status-vue .btech-modal-content-inner")[0]) {

            app.xOffset = e.pageX - $(el).offset().left;
            app.yOffset = e.pageY - $(el).offset().top;
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