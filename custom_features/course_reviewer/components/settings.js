(async function() {
  Vue.component('settings', {
    template: ` 
      <div style="padding: 8px 0;">
        <h2>Settings</h2>
        <div>
            {{settings}}
        </div>
      </div>
    `,
    data: function () {
        return {
            settings: courseReviewerSettings
        }
    },

  });
})();
