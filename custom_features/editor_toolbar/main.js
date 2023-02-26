//Run in custom js. You'll want to:
////1. Filter in some way which pages this runs on, I just do a regex checking the url to see if /edit is at the end of the url.
////2. wait for the rce to be loaded and initialized. I'm still experimenting on the best way to do this so don't have any good suggestions for you.
(function() {
  RCE = {
    getEditor: async function () {
      if (tinymce?.activeEditor?.initialized === true) {
        return;
      } else {
        await delay(500);
        return this.getEditor();
      }
    },

    addMenu: function () {
      tinymce.activeEditor.settings.menu.ai = {
        title: 'AI Tools',
        items: 'ai_register | ai_clarify | ai_quiz_generator | ai_fact_check'
      };

      this.resetEditor(function() {
        editor.ui.registry.addMenuItem('ai_register', {
          text: 'Register',
          onAction: function () {
            editor.insertContent('<p>Here\'s some content inserted from a basic menu!</p>');
          }
        });
        editor.ui.registry.addMenuItem('ai_clarify', {
          text: 'Register',
          onAction: function () {
            editor.insertContent('<p>Here\'s some content inserted from a basic menu!</p>');
          }
        });
        editor.ui.registry.addMenuItem('ai_quiz_generator', {
          text: 'Register',
          onAction: function () {
            editor.insertContent('<p>Here\'s some content inserted from a basic menu!</p>');
          }
        });
        editor.ui.registry.addMenuItem('ai_fact_check', {
          text: 'Register',
          onAction: function () {
            editor.insertContent('<p>Here\'s some content inserted from a basic menu!</p>');
          }
        });
      });
    },

    resetEditor: async function (extrasetup = (editor) => {}) {
      //save current settings so you don't lose anything Canvas has set up
      let savedSettings = tinymce.activeEditor.settings;
      //save the setup function
      let oldSetup = savedSettings.setup;
      //create a new setup function that first calls the old one, then adds whatever button you want (or other settings)
      savedSettings.setup = function(editor) {
        //run the old setup function and pass the editor
        oldSetup(editor);
        
        //add your button or whatever else you want to do
        //this is just a sample button I pulled from the tinymce docs
        extrasetup(editor);
        // editor.ui.registry.addButton('customInsertButton', {
        //   text: 'My Button',
        //   onAction: function (_) {
        //     editor.insertContent('&nbsp;<strong>It\'s my button!</strong>&nbsp;');
        //   }
        // });
      }
      //don't forget to add your button to the toolbar
      //you'll probably want to get more sophisticated in selecting which specific toolbar to add to rather than just the first one
      // savedSettings.toolbar[0].items.push("customInsertButton");
      //get rid of the current editor
      tinymce.activeEditor.destroy();
      //reset up with modified settings
      tinymce.init(savedSettings);

    },

    init: async function () {
      await this.getEditor();
      this.resetEditor();
      console.log(window.tinymce.activeEditor)
    }
  }
  RCE.init();
})();