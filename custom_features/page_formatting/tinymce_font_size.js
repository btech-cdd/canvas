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
  html {
    background-color: #F1F1F1;
  }
  :
  body {
    max-width: 850px;
    margin: auto;
    background-color: #FFFFFF;
  }

  h2 {font-size: 1.5rem;}
  h3 {font-size: 1.2rem;}
  h4 {font-size: 1rem;}
  h2, h3, h4 {
    clear: both;
    font-weight: bold;
  }
  .btech-citation {
    font-size: .66rem;
  }
  .btech-graphic-image {
    filter: blur(4px);
  }

  img[style*="float: left"] {
    margin: 5px 15px 0px 0px;
  }

  img[style*="float: right"] {
    margin: 5px 0px 0px 15px;
  }

  .btech-callout-box {
    background-color: #F1F1F1;
    border-radius: 5px;
    box-shadow: 5px 5px 10px #888;
    padding: 0.5rem;
    border: 1px solid #E1E1E1;
    margin: 0.5rem 5% 1rem 5%;
  }

  /*the basic header*/
  h2.icon-header {
    position: relative;
    text-align: center;
  }

  h2.icon-header::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    border-top: 1px solid #888;
    width: 100%;
    transform: translateY(-50%);
  }
  h2.icon-header span {
    position: relative; 
    background-color: #ffffff;
    color: #000000;
    padding: 10px 10px;
    border-radius: 40px;
    border: 1px solid #888;
    /* box-shadow: 0 4px 2px -2px #888; */
    font-size: 1.5rem;

  }
  h2.icon-header span i {
    vertical-align: middle;
  }
  h2.icon-header span i::before {
    font-size: 1.5rem;
  }
  `;
  if (tinymce.majorVersion === "4") {
    tinyMCE.activeEditor.iframeElement.contentDocument.getElementsByTagName('style')[1].innerHTML = tinyMCE.activeEditor.iframeElement.contentDocument.getElementsByTagName('style')[1].innerHTML + additionalCSS;
  } else if (tinymce.majorVersion === "5") {
    tinyMCE.activeEditor.iframeElement.contentDocument.getElementsByTagName('style')[0].innerHTML = tinyMCE.activeEditor.iframeElement.contentDocument.getElementsByTagName('style')[0].innerHTML + additionalCSS;
  }
}
_init();