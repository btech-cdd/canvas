(async function () {
  let canvasbody = $("#application");
  //checkbox to only show flags assigned to me (especially if not in a course)
  //ability to assign
  //ability to edit
  //lots of options for sorting / filtering flags
  //to do list on the front page organized by department or course?
  /*
  show course name
edit (click edit)

-short term
--default to previous
-long term
--replace button with drop down
*/
  let vueString = `
<div>
  <!--THIS IS THE BUTTON FOR OPENING THE FLAGS INTERFACE-->
  <div 
    v-if='unresolvedCount > 0' 
    class="btech-flags-number-circle" 
    style='
      z-index: 1000001;
    '
    :style="{
      position: 'fixed',
      top: (Math.round((button.offset()).top +  - ($('#header').offset()).top + (button.height() * .75)) + 'px'),
      left: (Math.round((button.offset()).left + (button.width() * .75)) + 'px')
    }"
  >
    {{unresolvedCount}}
  </div>

  <!--THIS IS THE MENU TO REVIEW FLAGS-->
  <div
    v-if='showFlags' 
    id='btech-flags-container'
    style='
      overflow-y: scroll;
    '
    :style="{
      'margin-left': ($('#menu').width()) + 'px'
    }"
  >
    <div
      v-if='pageType=="item"'
      style='
        width: 100%;
        background-color: #49e;
        color: #fff;
        padding: 2px;
        text-align: center;
        cursor: pointer;
      '
      @click='openSubmit()'
    >
      <i class='fas fa-flag'></i>New
    </div>
    <div v-if=showFilters>
      <input type='checkbox' v-model='displayResolved'><label>Include Resolved</label>
      <input type='checkbox' v-model='displayOnlyCreatedByMe'><label>Created By Me</label>
    </div>
    <div 
      v-for='flag in filteredFlags'
    >
      <div 
        class='btech-flags-item'
        v-if='checkDisplayFlag(flag) && (checkNameReady = (app.loadedNames[flag.createdBy] !== undefined && app.loadedNames[flag.createdBy] !== null))'>
        <div style='text-align: center;' v-if='loadedCourses[flag.courseId] !== undefined && loadedCourses[flag.courseId] !== null'>{{loadedCourses[flag.courseId]}}</div>
        <div><strong><a :href='flag.item_url'>{{flag.flagType}}</a></strong></div>
        <div>{{flag.comment}}</div>
        <div style='text-align: right;'><i>-{{loadedNames[flag.createdBy]}}</i></div>
        <div style='width: 100%;'>
          <i @click='deleteFlag(flag);' class='icon-trash'></i>
          <i @click='editFlag(flag);' class='icon-edit'></i>
          <i v-if='flag.resolved' @click='resolveFlag(flag);' class='icon-publish icon-Solid' style='color: #0f0;'></i>
          <i v-else @click='resolveFlag(flag);' class='icon-publish' style='color: #f00;'></i>
        </div>
      </div>
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
  //height is set to 0 so it doesn't make a giant empty div at the bottom of the page. There's probably a better way to do this.
  canvasbody.after('<div id="btech-flags-vue" style="height: 0px;"></div>');
  $("#btech-flags-vue").append(vueString);
  this.APP = new Vue({
    el: '#btech-flags-vue',
    mounted: async function () {
      let app = this;
      $('.ic-app-header__menu-list-item ').each(function () {
        $(this).click(function () {
          app.showFlags = false;
        });
      });
      app.button = $(`
        <li class="ic-app-header__menu-list-item">
          <a id="global_nav_flag_link" role="button" class="ic-app-header__menu-list-link" data-track-category="flag system" data-track-label="flag button" href="javascript:void(0);">
            <div class="menu-item-icon-container" role="presentation">
              <i style="font-size: 1.5em;" class="fal fa-flag" aria-hidden="true"></i>
            </div>
            <div class="menu-item__text">
                Flag
            </div>
          </a>
        </li>
      `)
      app.button.click(function () {
        let button = $(this);
        app.showFlags = !app.showFlags;
        if (app.showFlags === false) {
          button.removeClass('ic-app-header__menu-list-item--active');
        } else {
          button.addClass('ic-app-header__menu-list-item--active');
        }
      })
      $("#menu").append(app.button);

      let url = window.location.pathname.replace(/edit$/, '');
      let rItem = /^\/courses\/([0-9]+)\/(pages|assignments|quizzes|discussion_topics)\/(.*)$/;
      let rInCourse = /^\/courses\/([0-9]+)/;
      let rModules = /^\/courses\/([0-9]+)(\/modules){0,1}$/;

      //in a page/quiz/assignment
      if (rItem.test(url)) {
        app.pageType = 'item';
        $(document).bind('keydown', 'ctrl+shift+f', function () {
          app.openSubmit();
        });
        let flags = [];
        let match = url.match(rItem);
        app.courseId = match[1];
        app.itemType = match[2];
        app.itemId = match[3];
        await $.get("https://jhveem.xyz/api/flags/courses/" + app.courseId + "/" + app.itemType + "/" + app.itemId, function (data) {
          for (let i = 0; i < data.length; i++) {
            let flag = data[i];
            flag = app.initFlag(flag);
            flags.push(flag);
          }
        });
        app.flags = flags;
      }

      //For modules page
      else if (rInCourse.test(url)) {
        app.pageType = 'course';
        let flags = [];
        let match = url.match(rInCourse);
        app.courseId = match[1];
        await $.get("https://jhveem.xyz/api/flags/courses/" + app.courseId, function (data) {
          for (let i = 0; i < data.length; i++) {
            let flag = data[i];
            flag = app.initFlag(flag);
            flags.push(flag);
          }
        });
        app.flags = flags;

        if (rModules.test(url)) {
          await $.get('/api/v1/courses/' + app.courseId + '/modules?include[]=items&include[]=content_details', function (data) {
            for (let m = 0; m < data.length; m++) {
              let module = data[m];
              for (let i = 0; i < module.items.length; i++) {
                let item = module.items[i];
                if (item.url !== undefined) {
                  let item_url = item.url.replace('/api/v1', '');
                  for (let f = 0; f < flags.length; f++) {
                    let flag = flags[f];
                    if (item_url === flag.item_url && flag.resolved === false) {
                      let li = $('li#context_module_item_' + item.id);
                      //Clicking on this icon should do something and/or hovering should give info about the flag.
                      li.find('div.ig-row div.ig-info').after('<div class="ig-flag"><i class="fas fa-flag" aria-hidden="true"></i></div>');
                    }
                  }
                }
              }
            }
          })
        }
      }

      //any other page, not in a specific course
      else {
        app.pageType = 'other';
        let flags = [];
        await $.get("https://jhveem.xyz/api/flags", function (data) {
          for (let i = 0; i < data.length; i++) {
            let flag = data[i];
            flag = app.initFlag(flag);
            if (app.loadedCourses[flag.courseId] === undefined) {
              app.loadedCourses[flag.courseId] = null;
              $.get('/api/v1/courses/' + flag.courseId, function (data) {
                app.loadedCourses[flag.courseId] = data.name;
              });
            }
            flags.push(flag);
          }
        });
        app.flags = flags;
      }

    },
    data: function () {
      return {
        //Filters
        showFilters: true,
        displayResolved: false,
        displayOnlyCreatedByMe: false,

        button: null,
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
          'Missing Content',
          'Other'
        ],
        courseId: null,
        itemType: null,
        itemId: null,
        flagType: '',
        flagComment: '',
        flagTags: [],
        pageType: '',
        cddInfo: [],
        loadedNames: {},
        loadedCourses: {},
      }
    },
    computed: {
      filteredFlags: function () {
        let app = this;
        return app.flags;
      },
      unresolvedCount: function () {
        let app = this;
        let count = 0;
        for (let i = 0; i < app.filteredFlags.length; i++) {
          let flag = app.filteredFlags[i];
          if (flag.resolved === false && app.checkDisplayFlag(flag)) count += 1;
        }
        return count;
      }
    },
    methods: {
      checkDisplayFlag(flag) {
        let app = this;
        //do not include the check on if the name is loaded here because it messes up the flag count displayed before the menu opens
        let checkResolved = (app.displayResolved || !flag.resolved);
        let checkFilterCreator = (!app.displayOnlyCreatedByMe || (ENV.current_user_id === flag.createdBy));
        return checkResolved && checkNameReady && checkFilterCreator;
      },
      initFlag(flag) {
        let app = this;
        let flagUrl = 'https://btech.instructure.com/courses/' + flag.courseId + '/' + flag.itemType + '/' + flag.itemId;
        flag.item_url = flagUrl;
        if (app.loadedNames[flag.createdBy] === undefined) {
          app.loadedNames[flag.createdBy] = null;
          $.get('/api/v1/users/' + flag.createdBy, function (data) {
            app.loadedNames[flag.createdBy] = data.name;
          });
        }
        return flag;
      },
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
        }, function (flag) {
          //need to append this flag to list of flags
          flag = app.initFlag(flag);
          app.flags.push(flag);
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
        if (ind > -1) {
          app.flags.splice(ind, 1);
        }
      },
      async updateFlag(flag, changes) {
        let app = this;
        await $.put('https://jhveem.xyz/api/flags/' + flag._id, changes);
      },
      async editFlag(flag) {

      },
      async resolveFlag(flag) {
        let app = this;
        flag.resolved = !flag.resolved
        app.updateFlag(flag, {
          'resolved': flag.resolved
        });
      },
      openSubmit() {
        let app = this;
        app.flagType = '';
        app.flagComment = '';
        app.flagTags = [];
        app.showSubmit = true
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