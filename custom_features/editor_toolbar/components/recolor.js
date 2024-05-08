(async function() {
  Vue.component('rce-recolor', {
    template: ` 
      <i
        @click="recolor"
        class="icon-materials-required"
        title="Swap existing colors for new colors."
      ></i>
    `,
    props: {
    },
    computed: {},
    data() {
      return {
      } 
    },
    created: async function () {
    },

    methods: {
      // CREATES A COMMENT THAT APPEARS IN THE RIGHT MARGIN (PADDING) OF THE PAGE AND MOVES TO THE TOP OF THE ASSOCIATED ELEMENT EVEN ON PAGE RESIZE
    // FORMATS A CITATION
      recolorSubmit: function (bg) {
        let editor = tinymce.activeEditor;
        let existingColor = $("#existing-color").val();
        let newColor = $("#new-color").val();
        console.log(existingColor);
        console.log(newColor);
       
        // editor.execCommand("mceReplaceContent", false, `<p>`+citationString+`</p>`);
        bg.remove();
      },

      keypress: async function (bg) {
        $(".citation-information").keypress(function (event) {
          var keycode = (event.keyCode ? event.keyCode : event.which);
          if (keycode == '13') {
            this.recolorSubmit(bg);
          }
          event.stopPropagation();
        });
      },

      recolor: async function () {
        let bg = TOOLBAR.addBackground(false);
        let close = $(`<span class="btech-pill-text" style="background-color: black; color: white; cursor: pointer; user-select: none; position: absolute; right: 2rem;">Close</span>`);
        close.click(() => {bg.remove();});
        bg.find('#background-container').append(close);
        bg.find('#background-container').append(`
        <p>Existing Color</p>
        <input type="color" id="btech-recolor-existing-color" v-model="elColor" style="width: 48px; height: 28px; padding: 4px; padding-right: 0px;" list="existing-colors"/>
        <datalist id="existing-colors">
          <option>#d22232</option>
          <option>#2232d2</option>
          <option>#1f89e5</option>
          <option>#32A852</option>
          <option>#E2A208</option>
          <option>#000000</option>
          <option>#FFFFFF</option>
        </datalist>
        <input type="color" id="btech-recolor-new-color" v-model="elColor" style="width: 48px; height: 28px; padding: 4px; padding-right: 0px;" list="new-colors"/>
        <datalist id="new-colors">
          <option>#d22232</option>
          <option>#2232d2</option>
          <option>#1f89e5</option>
          <option>#32A852</option>
          <option>#E2A208</option>
          <option>#000000</option>
          <option>#FFFFFF</option>
        </datalist>
        <a class='btn' id="recolor-submit">Create</a>
        `);
        let submit = $("#recolor-submit");
        submit.click(() => {
          this.recolorSubmit(bg);
        });
        this.keypress(bg);
      }

    }, 

    destroyed: function () {}
  });
})();

