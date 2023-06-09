(function() {
  const WIDTH = 200;
  $('body').append(`
  <div 
    id="btech-editor-vue"
    :style="{
      'width': width
    }"
    style="position: fixed; top: 0; right: 0; height: 100%; background-color: #f1f1f1;"
  >
    <div
      v-if="!minimized"
    >
      <div 
        style="
          text-align: center;
          background-color: #d22232;
          color: white;
          cursor: pointer;
          user-select: none;
        "
        @click="minimize"
      >
        BTECH Editor
        <b>&#8250;</b>
      </div>
    </div>
    <div>
    </div>
  </div>
  `);
  new Vue({
    el: '#btech-editor-vue',
    mounted: async function () {
      $('#wrapper').css('margin-right', `${this.width}px`);
    },
    data: function () {
      return {
        minimized: false,
        width: 250 
      }
    },
    methods: {
      minimize: function() {
        $('#wrapper').css('margin-right', '0px');
      }
    }
  });
})();