(function() {
  const WIDTH = 150;
  $("#wrapper").css("margin-right", `${WIDTH}px`);
  $("body").append(`
  <div 
  id="btech-editor-vue"
  style="position: fixed; top: 0; right: 0; width: ${WIDTH}px; height: 100%; background-color: #f1f1f1;">
    <div style="text-align: center; background-color: #d22232; color: white;">BTECH Editor</div>
  </div>
  `);
  new Vue({
    el: "#btech-editor-vue",
    mounted: async function () {
    },
    data: function () {
      return {
      }
    },
    methods: {
    }
  });
})();