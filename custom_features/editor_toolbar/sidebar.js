(function() {
  const WIDTH = 200;
  $("#wrapper").css("margin-right", `${WIDTH}px`);
  $("body").append(`
  <div 
    id="btech-editor-vue"
    style="position: fixed; top: 0; right: 0; width: ${WIDTH}px; height: 100%; background-color: #f1f1f1;"
  >
    <div>
      <div style="text-align: center; background-color: #d22232; color: white;">
        BTECH Editor
        <span 
          @click="minimize"
          style="float: right; padding: 0 1rem; cursor: pointer; user-select: none;"
        >
          <b>&#8250;</b>
        </span>
      </div>
    </div>
    <div>
    </div>
  </div>
  `);
  new Vue({
    el: "#btech-editor-vue",
    mounted: async function () {
    },
    data: function () {
      return {
        minimized: false;
      }
    },
    methods: {
      minimize: function() {

      }
    }
  });
})();