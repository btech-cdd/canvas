(function() {
  const WIDTH = 200;
  $('body').append(`
  <div 
    id="btech-editor-vue"
    :style="{
      'width': width + 'px',
      'right': minimized ? '-' + width + 'px' : '0px'
    }"
    style="position: fixed; top: 0; height: 100%; background-color: #f1f1f1;"
  >
    <div
      v-if="minimized"
      @click="maximize"
      style="
        position: absolute;
        top: 2rem;
        background-color: #d22232;
        color: white;
        padding: 0.5rem;
        cursor: pointer;
      "
      :style="{
        'right': width + 'px'
      }"
    >
      <i class="icon-rubric"></i>
    </div>
    <div
      v-else
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
        Course Review 
        <b>&#8250;</b>
      </div>

      <!--MODULES-->
      
    </div>
  </div>
  `);
  new Vue({
    el: '#btech-editor-vue',
    mounted: async function () {
    },
    data: function () {
      return {
        minimized: true,
        width: 400,
        defaultImg: 'https://bridgetools.dev/canvas/media/image-placeholder.png',
        colors: {
          primary: "#D22232",
          secondary: "#B11121",
          callout: "#F1F1F1",
          font: "#FFFFFF",
          bodyfont: "#000000",
          bg: "#FFFFFF"
        } 
      }
    },
    methods: {
      maximize: function () {
        $('#wrapper').css('margin-right', this.width + 'px');
        this.minimized = false;
      },
      minimize: function () {
        $('#wrapper').css('margin-right', '0px');
        this.minimized = true;
      }
    }
  });
})();