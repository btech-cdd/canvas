(async function() {
    console.log("SETTINGS")
  Vue.component('settings', {
    template: ` 
      <div style="padding: 8px 0;">
        <h2>Settings</h2>
        <div>
          <label>
            <input type="checkbox" v-model="settings.hide" @change="updateSettings" />
            Hide
          </label>
        </div>
        <div>
          {{ settings }}
        </div>
      </div>
    `,
    data: function() {
      return {
        settings: {}
      };
    },
    mounted() {
      // Initialize settings with the global courseReviewerSettings
      this.settings = { ...courseReviewerSettings };
    },
    methods: {
      updateSettings() {
        // Toggle the hide setting and update the global courseReviewerSettings
        courseReviewerSettings = this.settings;
        updateCourseReviewerSettings(courseReviewerSettings);
      },
      removeLoadingElement(menuName) {
        let index = this.loadingMenus.indexOf(menuName);
        this.loadingMenus.splice(index, 1);
      }
    }
  });
})();
