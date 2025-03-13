(async function () {
  //escape if not on the editor page
  if (!TOOLBAR.checkEditorPage()) return;

  // GRAY CALLOUT BOX BUT WITHOUT A BOX SHADOW
  async function calloutBoxGrayonGray() {
    let editor = tinymce.activeEditor;
    let selection = editor.selection;
    let content = selection.getContent();
    if (content.trim() == '') content = '<div aria-label="callout-title" style="font-size: 1.2rem; font-weight: bold;"><strong>INSERT TITLE<strong></div><div><p>INSERT TEXT</p></div>'
    editor.execCommand("mceReplaceContent", false, `
      <div 
        class="btech-callout-box" 
        style="background-color: #EDEDED; border-radius: 5px; padding: 0.5rem 1.5rem; border: 3px solid #AAA; margin: 1rem auto; width: 70%;"
        role="note" aria-label="callout-box">
          <p>${content}</p>
      </div>
      `);
  }

  // GRAY CALLOUT BOX FOR EMBEDDING NTO AN ALREADY GRAY BACKGROUND 
  async function calloutBox() {
    let editor = tinymce.activeEditor;
    let selection = editor.selection;
    let content = selection.getContent();
    if (content.trim() == '') content = '<div aria-label="callout-title" style="font-size: 1.2rem; font-weight: bold;"><strong>INSERT TITLE<strong></div><div><p>INSERT TEXT</p></div>'
    editor.execCommand("mceReplaceContent", false, `
      <div 
        class="btech-callout-box" 
        style="background-color: #F1F1F1; border-radius: 5px; padding: 0.5rem 1.5rem; border: 3px solid #E1E1E1; margin: 1rem auto; width: 70%;"
        role="note" aria-label="callout-box">
      <p>${content}</p>
      </div>
      `);
  }

  // ANOTHER CALLOUT, THIS ONE USES THE SET COLOR
  async function exampleBox() {
    let editor = tinymce.activeEditor;
    let selection = editor.selection;
    let content = selection.getContent();
    let color = $("#btech-custom-editor-buttons-color").val();
    let fontColor = "#FFFFFF";
    if (content.trim() == '') content = 'INSERT CONTENT'
    editor.execCommand("mceReplaceContent", false, `
      <div style="background-color: #ffffff; color: #000000; border: 3px solid ${color}; border-radius: 5px; margin: 1rem auto; width: 70%;" role="note" aria-label="callout-box">
        <div aria-label="callout-title" style="background-color: ${color}; color: #ffffff; font-size: 1.2em; padding: 0.25rem 1.5rem; text-align: left; font-weight: bold;"><strong>INSERT TITLE</strong></div>
        <div style="padding: 0.5rem 1.5rem;">
        <p>${content}</p>
        </div>
      </div>
      `);
  }
  
  // // SLIGHTLY MORE CONDENSE CALLOUT BOX THAT ALSO USES COLOR
  // async function exampleBoxSmall() {
  //   let editor = tinymce.activeEditor;
  //   let selection = editor.selection;
  //   let color = $("#btech-custom-editor-buttons-color").val();
  //   let fontColor = "#FFFFFF";
  //   editor.execCommand("mceReplaceContent", false, `
  //   <table style="margin-bottom: 0.5rem; width: 90%; border-collapse: collapse; border-color: gray; margin-left: auto; margin-right: auto;" border="0" cellpadding="10">
  //     <tbody>
  //     <tr>
  //     <td style="background-color: `+color+`; color: #ffffff; text-align: center; width: 1%; white-space: nowrap;">Note</td>
  //     <td style="width: 1rem; background: linear-gradient(to bottom right, `+color+` 49.5%, #f0f0f0 50.5%);"></td>
  //     <td style="background-color: #f0f0f0; color: #000000;">
  //       ${selection.getContent()}
  //     </td>
  //     <td style="width: 1rem; background: linear-gradient(to bottom right, #f0f0f0 49.5%, `+color+` 50.5%);"></td>
  //     </tr>
  //     </tbody>
  //   </table>
  //     `);
  // }

  // FORMATS A CITATION
  function citationInsert(bg) {
    let editor = tinymce.activeEditor;
    let name = $("#citation-name").val();
    let authorLast = $("#citation-author-last").val();
    let publisher = $("#citation-publisher").val();
    let date = $("#citation-year-published").val();
    let url = $("#citation-url").val();
    if (name != "" && authorLast != "") {
      let citationString = ""; 
      $(".citation-author").each(function() {
        let authorEl = $(this);
        let last = authorEl.find(".last-name").val();
        let first = authorEl.find(".first-name").val();
        if (last !== "") {
          if (first !== "") {
            citationString += (last + ", " + first.charAt(0) + ". ")
          } else {
            citationString += last + ". "
          }
        }
      })
      if (date !== "") {
        citationString += ("(" + date + "). ");
      }
      
      citationString += ("<i>" +name + "</i>. ");
      if (publisher !== "") {
        citationString += (publisher + ". ")
      }
      if (url !== "") {
        citationString = `<a href="${url}">${citationString}</a>`;
      }
      citationString = "<p class='btech-citation' style='text-align: right;'>" + citationString + "</p>";
      editor.execCommand("mceReplaceContent", false, `<p>`+citationString+`</p>`);
      bg.remove();
    }
  }

  async function citationKeypress(bg) {
    let editor = tinymce.activeEditor;
    $(".citation-information").keypress(function (event) {
      var keycode = (event.keyCode ? event.keyCode : event.which);
      if (keycode == '13') {
        citationInsert(bg);
      }
      event.stopPropagation();
    });
  }

  async function citation() {
    let bg = TOOLBAR.addBackground(false);
    let close = $(`<span class="btech-pill-text" style="background-color: black; color: white; cursor: pointer; user-select: none; position: absolute; right: 2rem;">Close</span>`);
    close.click(() => {bg.remove();});
    bg.find('#background-container').append(close);
    bg.find('#background-container').append(`
    <p>Name of Image, Book, Article, Video, etc.*</p>
    <input style='width: 100%; height: 40px; box-sizing: border-box;' type="text" class="citation-information" id="citation-name">
    <p>Author(s)*</p>
    <p>Must include a last name, if unknown, put unkown</p>
    <div id="citation-authors">
      <div class="citation-author">
        <input placeholder="first name" style='width: 49%; height: 40px; box-sizing: border-box;' type="text" class="citation-information first-name" id="citation-author-first">
        <input placeholder="last name" style='width: 49%; height: 40px; box-sizing: border-box;' type="text" class="citation-information last-name" id="citation-author-last">
      </div>
    </div>
    <a class='btn' id="citation-add-author">Add Author</a>
    <p>Year Published</p>
    <input style='width: 100%; height: 40px; box-sizing: border-box;' type="number" class="citation-information" id="citation-year-published">
    <p>Publisher</p>
    <input style='width: 100%; height: 40px; box-sizing: border-box;' type="text" class="citation-information" id="citation-publisher">
    <p>URL (If Applicable)</p>
    <input style='width: 100%; height: 40px; box-sizing: border-box;' type="text" class="citation-information" id="citation-url">
    <a class='btn' id="citation-submit">Create</a>
    `);
    let addAuthor = $("#citation-add-author");
    addAuthor.click(function () {
      $("#citation-authors").append(`
    <div class="citation-author">
      <input placeholder="first name" style='width: 49%; height: 40px; box-sizing: border-box;' type="text" class="citation-information first-name">
      <input placeholder="last name" style='width: 49%; height: 40px; box-sizing: border-box;' type="text" class="citation-information last-name">
    </div>
    `);
      citationKeypress(bg);
    });
    let submit = $("#citation-submit");
    submit.click(function () {
      citationInsert(bg);
    });
    citationKeypress(bg);
  }

  // AN AUTO FORMATTER FOR THE WHOLE PAGE. BARE BONES, BUT IS QUICK
  function formatPage() {
    let body = tinyMCE.activeEditor.getBody();
    let children = $(body).children();
    let headerNum = -1;
    let headerName = null;
    let alt = true;
    let customColor = $("#btech-custom-editor-buttons-color").val();
    $(body).find('.btech-formatted-content-wrapper').each(function () {
      $(this).contents().unwrap();
    });
    $(body).find('.btech-sections').each(function () {
      $(this).contents().unwrap();
    });
    $(body).find('.btech-sections-header').each(function () {
      $(this).find('.btech-sections-header-content').contents().unwrap();
      $(this).removeClass('.btech-sections-header');
    });
    for (let i = 0; i < children.length; i++) {
      let child = $(children[i])[0];
      //find out the header to check for
      if (headerName === null) {
        if (child.tagName.charAt(0) === "H") {
          headerName = child.tagName;
        }
      }
      if (headerName !== null) {
        if (child.tagName === headerName || (i === children.length - 1)) {
          if (headerNum > -1) {
            let arrGroup = [];
            for (var j = headerNum; j < i; j++) {
              arrGroup.push($(children[j])[0]);
            }
            //make sure to include the last element
            if (i === children.length - 1) {
              arrGroup.push($(children[i])[0]);
            }
            //alternate background color
            let bgColor = "#fff";
            if (alt) {
              bgColor = "#f6f6f6";
            }
            alt = !alt;
            let header = $(children[headerNum]);
            header.css({
              'text-align': 'center',
            });
            header.addClass("btech-sections-header");
            header.wrapInner(`<span class='btech-sections-header-content' style="background-color: ${customColor}; color: #FFFFFF"></span>`);
            $(arrGroup).wrapAll("<div class='btech-sections' style='border: 1px solid #ddd; background-color: " + bgColor + "; padding: 5px; padding-top: 15px; margin-top: 25px;'></div>");
          }
          headerNum = i;
        }
      }
    }
  }

  // DOESN'T CURRENTLY WORK. MEANT TO BE AN AUTOMATIC WAY OF FINDING 
  function replaceExternalFiles() {
    let body = tinyMCE.activeEditor.getBody();
    let bodyText = $(body).html();
    let externalLinks = [...bodyText.matchAll(/src=\"(.)+?courses\/([0-9]+)\/files\/([0-9]+)/g)];
    let courseId = parseInt(window.location.pathname.match(/courses\/([0-9]+)/)[1]);
    $.get("/api/v1/courses/" + courseId + "/folders").done(function (data) {
      for (let d = 0; d < data.length; d++) {
        let folderData = data[d];
        if (folderData.name == "course files") {

          url = "/api/v1/folders/" + data[d].id + "/copy_file?source_file_id=" + 95008571 + "&on_duplicate=rename";
          $.post(url).done(function (data) {
          });
          break;
        }
      }
    });
  }

  function sidebarCallout() {
    console.log("COMMENT");
    let editor = tinymce.activeEditor;
    let node = $(editor.selection.getNode());
    let customColor = $("#btech-custom-editor-buttons-color").val();
    // need to add in a check to see if there is an existing comment here and delete if there. If no comment exists, then create a comment. 
    // get classes, if btech-sidebar-content exists
    //// then delete that class, get the btech-sidebar-content-<id> and delete that class and use the id to delete the comment div
    // if btech-sidebar-comment is the class, then do nothing, because don't want comments on comments
    // if neither exists, then create the comment
    let commentId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    node.addClass(`btech-sidebar-content-${commentId}`);
    node.addClass('btech-sidebar-content');
    let comment = $(`<div class="btech-sidebar-comment btech-sidebar-comment-${commentId}" style="border: 1px solid ${customColor}; padding: 5px;">comment</div>`);
    node.after(comment);
  }

  // EDITOR SOMETIMES TAKES A MINUTE TO LOAD, THIS WAITS UNTIL IT'S ALL READY
  await TOOLBAR.checkReady(0);

  //Add in option to change color of exampleBox. IE, you click in it, it figures out the color selected, if you change the color, it changes the box
  TOOLBAR.toolbar.prepend(`<input type="color" id="btech-custom-editor-buttons-color" value="#B20B0F" style="width: 48px; padding: 4px; padding-right: 0px;" list="default-colors"/>
    <datalist id="default-colors">
      <option>#B20B0F</option>
      <option>#0f79A2</option>
      <option>#0B810F</option>
      <option>#000000</option>
      <option>#FFFFFF</option>
    </datalist>
    `);

  TOOLBAR.addButtonIcon("icon-not-light icon-Solid", "Callout Box with Colored Title", "Insert a callout box with a colored header.", exampleBox);
  $('[aria-label="Callout Box with Colored Title"]').css('color', '#B20B0F');

  TOOLBAR.addButtonIcon("icon-note-light", "Callout Box Gray. Light Border.", "Insert a gray callout box with light border. Designed for on white backgrounds.", calloutBox);
  TOOLBAR.addButtonIcon("icon-note-light icon-Solid", "Callout Box Gray. Dark Border.", "Insert a gray callout box with dark border. Designed for on gray backgrounds.", calloutBoxGrayonGray);
  TOOLBAR.addButtonIcon("icon-compose", "Citation", "Insert a citation.", citation);
  TOOLBAR.addButtonIcon("icon-materials-required", "Auto Format", "Auto format the page to break the page into sections. Sections are determined by the top level heading.", formatPage);
})();