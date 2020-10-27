(async function () {
  if (!TOOLBAR.checkEditorPage()) return;

  function resetImgButtons() {
    let node = tinyMCE.activeEditor.selection.getNode();
    let parent = tinyMCE.activeEditor.dom.getParent(node, "img");
    console.log(parent);
  }
  async function addClassToImage(className) {
    //get the currently selected node
    let node = tinyMCE.activeEditor.selection.getNode();
    //get the parent
    let parent = tinyMCE.activeEditor.dom.getParent(node, "img");
    if (parent !== null) {
      //see if it's already got the class in question, if so remove it, otherwise remove all other classes and add that one
      if ($(parent).hasClass(className)) {
        tinyMCE.activeEditor.dom.removeClass(parent, className);
      } else {
        for (let i = 0; i < tableOptions.length; i++) {
          let _class = tableOptions[i];
          tinyMCE.activeEditor.dom.removeClass(parent, _class);
        }
        tinyMCE.activeEditor.dom.addClass(parent, className);
      }
    }
    return parent;
  }

  function blurGraphicImage() {
    addClassToImage('btech-graphic-image');
  }

  function setImageAlign() {
    addClassToImage('btech-img-align');
  }
  TOOLBAR.addButtonIcon("far fa-exclamation-triangle", "Blur image with graphic content.", blurGraphicImage);
  TOOLBAR.addButtonIcon("far fa-arrows-alt-h", "Set image to appear on same row as images adjacent to it.", setImageAlign);
  tinymce.activeEditor.on("click", function () {
    resetImgButtons();
  });
})();