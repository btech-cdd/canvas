(async function() {
  const WIDTH = 200;
  async function postLoad() {
    let vueString = '';
    await $.get(SOURCE_URL + '/custom_features/editor_toolbar/sidebar.vue', null, function (html) {
      vueString = html.replace("<template>", "").replace("</template>", "");
    }, 'text');
    $('body').append(vueString);
    new Vue({
      el: '#btech-editor-vue',
      mounted: async function () {
        $('#wrapper').css('margin-right', `${this.width}px`);
      },
      data: function () {
        return {
          minimized: false,
          width: 250,
          defaultimg: 'https://bridgetools.dev/canvas/media/image-placeholder.png',
          colors: {
            primary: "#D22232",
            secondary: "#B11121",
            callout: "#F1F1F1",
            font: "#FFFFFF",
            bodyfont: "#000000",
            bg: "#FFFFFF"
          } ,
          elColor: "#d22232"
        }
      },
      methods: {
        setCSSVariables: function () {
          document.querySelector(':root').style.setProperty('--font', 'Roboto');
          for (let color in this.colors) {
            document.querySelector(':root').style.setProperty('--color-' + color, this.colors[color]);
          }
        },
        maximize: function () {
          $('#wrapper').css('margin-right', this.width + 'px');
          this.minimized = false;
        },
        minimize: function () {
          $('#wrapper').css('margin-right', '0px');
          this.minimized = true;
        },

        initFormattedContent: function () {
          let editor = tinymce.activeEditor;
          let body = editor.getBody();
          $(body).find('.btech-formatted-content-wrapper').each(() => {
            $(this).unwrap();
          });
          $(body).contents().wrap(`<div class="btech-formatted-content-wrapper"></div>`);
        },

        getContainer: function (element) {
          let container = element;
          //loop until parent is 
          while (container.parent().prop("tagName") != "body" && !container.parent().hasClass("btech-formatted-content-wrapper")) {
            if (container != $(container.parent())) break;
            container = $(container.parent());
            console.log(container);
          }
          return container;
        },

        addImageLeftModal: function () {
          let editor = tinymce.activeEditor;
          let container = this.getContainer($(editor.selection.getNode()));
          container.after(`
            <div
              class="
                btech-formatted-content-modal
                btech-formatted-content-image-left-wrapper
              "
              style="
                display: grid;
                grid-template-columns: 1fr 2fr;
              "
            >
              <img
                style="width: 100%;"
                src="${this.defaultimg}"
              />
              <div>
                <p>TEXT</p>
              </div>
            </div>
          `)
          console.log(container);
        },
        addImageRightModal: function () {
          let editor = tinymce.activeEditor;
          let container = this.getContainer($(editor.selection.getNode()));
          container.after(`
            <div
              class="
                btech-formatted-content-modal
                btech-formatted-content-image-right-wrapper
              "
              style="
                display: grid;
                grid-template-columns: 2fr 1fr;
              "
            >
              <div>
                <p>TEXT</p>
              </div>
              <img
                style="width: 100%;"
                src="${this.defaultimg}"
              />
            </div>
          `)
          console.log(container);
        },

        addHeaderBannerModal: function () {

        },

        addHeaderHexModal: function () {
          let editor = tinymce.activeEditor;
          let container = this.getContainer($(editor.selection.getNode()));
          container.after(`
            <div
              class="
                btech-formatted-content-modal
                btech-formatted-content-banner-wrapper
              "
              style="
                width: 100%;
              " 
            >
              <div
                style="
                  width: 100%;
                  height: 5rem;
                  overflow: hidden;
                  position: relative;
                  z-index: 1;
                " 
              >
                <img 
                  style="
                    width:100%;
                  "
                  src="${this.defaultimg}"
                >
              </div>

              <h2
                style="
                  margin-top: -2rem;
                  background-color: var(--colors-primary);
                  color: var(--colors-font);
                  position: relative;
                  z-index: 2;
                  font-size: 2rem;
                  display: inline-block;
                  margin-left: 10%;
                  padding-right: 3rem;
                  width: 90%;
                  border: 0.25rem solid #FFFFFF;
                  text-align: right;
                " 
              ><strong>HEADER</strong></h2>
            </div>
          `);
        },

        addBannerModal: function () {
          let editor = tinymce.activeEditor;
          let body = editor.getBody();
          this.initFormattedContent();
          let wrapper = $($(body).find('.btech-formatted-content-wrapper')[0]);
          wrapper.prepend(`
            <div
              class="
                btech-formatted-content-modal
                btech-formatted-content-banner-wrapper
              "
              style="
                width: 100%;
              " 
            >
              <div
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
                  src="${this.defaultimg}"
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
        },

      }
    });
  }

  $.getScript(SOURCE_URL + '/custom_features/editor_toolbar/components/sidebar_comment.js').done(function () {
  $.getScript(SOURCE_URL + '/custom_features/editor_toolbar/components/hex_image.js').done(function () {
  $.getScript(SOURCE_URL + '/custom_features/editor_toolbar/components/callout.js').done(function () {
    postLoad();
  });
  });
  });


})();