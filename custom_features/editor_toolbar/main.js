(function() {
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
    editor.ui.registry.addButton('customInsertButton', {
      text: 'My Button',
      onAction: function (_) {
        editor.insertContent('&nbsp;<strong>It\'s my button!</strong>&nbsp;');
      }
    });
  }
  //don't forget to add your button to the toolbar
  //you'll probably want to get more sophisticated in selecting which specific toolbar to add to rather than just the first one
  savedSettings.toolbar[0].items.push("customInsertButton");
  //get rid of the current editor
  tinymce.activeEditor.destroy();
  //reset up with modified settings
  tinymce.init(savedSettings);
})();