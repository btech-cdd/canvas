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
  let additionalCSS = `
  h2 {font-size: 1.5rem; font-weight: bold;}
  h3 {font-size: 1.2rem; font-weight: bold;}
  h4 {font-size: 1rem; font-weight: bold;}
  .btech-citation {
    font-size: .66rem;
  }
  .btech-graphic-image {
    filter: blur(4px);
  }
  .btech-graphic-image::after {
    content: "THIS IMAGE HAS BEEN MARKED AS POTENTIALLY GRAPHIC";
  }
  `;
  if (tinymce.majorVersion === "4") {
    tinyMCE.activeEditor.iframeElement.contentDocument.getElementsByTagName('style')[1].innerHTML = tinyMCE.activeEditor.iframeElement.contentDocument.getElementsByTagName('style')[1].innerHTML + additionalCSS;
  } else if (tinymce.majorVersion === "5") {
    tinyMCE.activeEditor.iframeElement.contentDocument.getElementsByTagName('style')[0].innerHTML = tinyMCE.activeEditor.iframeElement.contentDocument.getElementsByTagName('style')[0].innerHTML + additionalCSS;
  }
}
_init();