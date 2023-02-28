async function getEditor() {
  if (window.tinymce === undefined) {
    await delay(500);
    return getEditor();
  } else {
    return tinymce.activeEditor;
  }
}
async function _init() {
  let editor = await getEditor();
  //use rem instead of pixels because it messes everything up otherwise. 1.5, 1.2, 1 for h2, h3, h4 respectively
  //These should work out to 18, 14, and 12

  //save current settings so you don't lose anything Canvas has set up
  let savedSettings = tinymce.activeEditor.settings;
  //save the setup function
  let oldSetup = savedSettings.setup;
  //create a new setup function that first calls the old one, then adds whatever button you want (or other settings)
  console.log(savedSettings);
  savedSettings.content_css.push("https://bridgetools.com/canvas/style/rce.css");
  savedSettings.setup = function(editor) {
    //run the old setup function and pass the editor
    oldSetup(editor);
  }
  //get rid of the current editor
  tinymce.activeEditor.destroy();
  //reset up with modified settings
  tinymce.init(savedSettings);
}
_init();