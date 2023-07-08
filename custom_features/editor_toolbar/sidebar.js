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
      <i class="icon-edit"></i>
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
        BTECH Editor
        <b>&#8250;</b>
      </div>
      <div>
        <i
          @click="addGradebook"
          class="icon-gradebook"
        ></i>
      </div>
      <div>
        <i
          @click="addHeader"
          class="icon-text"
        ></i>
      </div>
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
      maximize: function () {
        $('#wrapper').css('margin-right', this.width + 'px');
        this.minimized = false;
      },
      minimize: function () {
        $('#wrapper').css('margin-right', '0px');
        this.minimized = true;
      },
      addGradebook: function () {
        let editor = tinymce.activeEditor;
        editor.execCommand("mceInsertContent", false, `
          <p class="btech-grading-scheme btech-hidden" style="border: 1px solid black;">This will be replaced by a table populated with the course Grading Scheme.</p>
        `);
      },
      addHeader: function () {
        let editor = tinymce.activeEditor;
        let body = editor.getBody();
        $(body).find('.btech-formatted-content-wrapper').each(() => {
          $(this).unwrap();
        });
        console.log(body);
        $(body).contents().wrap(`<div class="btech-formatted-content-wrapper"></div>`);
        let wrapper = $($(body).find('.btech-formatted-content-wrapper')[0]);
        wrapper.prepend(`
          <div
            class="btech-formatted-content-banner-header"
            style="
              width: 100%;
              height: 10rem;
              overflow: hidden;
            " 
          >
            <img 
              style="
                width:100%;
              "
              src="https://bridgetools.dev/canvas/media/image-placeholder.png"
            >
            <h2
              style="
                margin-top: -2rem;
              " 
            >HEADER</h2>
          </div>
        `);
      }
    }
  });
})();