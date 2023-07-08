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
        <i
          @click="addHexImage"
          class="icon-image"
        ></i>
        <i
          @click="addCallout"
          class="icon-note-light"
        ></i>
        <i
          @click="addHeader"
          class="icon-text"
        ></i>
      </div>
      <div>
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
        width: 250,
        defaultImg: 'https://bridgetools.dev/canvas/media/image-placeholder.png'
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
      addHexImage: function() {
        let editor = tinymce.activeEditor;
        editor.execCommand("mceInsertContent", false, `
          <div
            class="btech-hex-mask"
            style="
              width: 200px; /* Adjust the size as per your needs */
              height: 230px;
              position: relative;
              margin: 0 auto;
              display: inline-block;
              clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
            "
          >
            <img
              src="${this.defaultImg}"
              style="
                width: 100%;
                height: 100%;
                object-fit: cover;
                transform: rotate(30deg);
              "
            />
          </div>
        `);

      },
      addCallout: function () {
        let editor = tinymce.activeEditor;
        let selection = editor.selection;
        let selectionContent = selection.getContent();
        console.log(selectionContent);
        editor.execCommand("mceReplaceContent", false, `
          <div class="btech-callout-box flat">
          ${selectionContent}
          </div>
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
            class="
              btech-formatted-content-item
              btech-formatted-content-banner-wrapper
            "
            style="
              width: 100%;
            " 
          >
            <div
              class="
                btech-formatted-content-item
                btech-formatted-content-banner-wrapper
              "
              style="
                width: 100%;
                height: 10rem;
                overflow: hidden;
                position: relative;
                z-index: 1;
              " 
            >
              <img 
                style="
                  width:100%;
                "
                src="${this.defaultImg}"
              >
            </div>

            <h2
              style="
                margin-top: -2rem;
                background-color: #D22232;
                color: #FFFFFF;
                position: relative;
                z-index: 2;
                font-size: 2rem;
                display: inline-block;
                margin-left: -2rem;
                padding-left: 3rem;
                width: 90%;
                border: 0.25rem solid #FFFFFF;
              " 
            ><strong>HEADER</strong></h2>
          </div>
        `);
      }
    }
  });
})();