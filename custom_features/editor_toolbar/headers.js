(async function () {
  headerOptions = [
    'icon-stats',
    'icon-media',
    'icon-student-view',
    'icon-copy-course',
    'icon-discussion',
    'icon-edit',
    'icon-home',
    'icon-settings',
    'icon-flag',
    'icon-warning',
    'icon-quiz',
    'icon-clock',
    'icon-hour-glass',
    'icon-tag',
    'icon-folder',
    'icon-lti',
    'icon-heart',
    'icon-star'
  ];
  //escape if not on the editor page
  if (!TOOLBAR.checkEditorPage()) return;

  async function insertHeader(className) {
    let editor = TOOLBAR.editor;
    let selection = editor.selection;
    let color = $("#btech-custom-editor-buttons-color").val();
    let fontColor = "#000000";
    editor.execCommand("mceReplaceContent", false, `
    <h2 class="icon-header" style="text-align: center;">
      <span><strong><i class="` + className + `"></i> <span class="btech-hidden">#ICON#</span> </strong></span>
    </h2>
    <h2 style="text-align: center;">HEADING</h2>
      `);
  }

  function iconFormat(icon) {
    var originalOption = icon.element;
    return $('<span><i class="fa ' + $(originalOption).attr('data-icon') + '"></i> ' + icon.text + '</span>');
  }

  await TOOLBAR.checkReady();
  //TOOLBAR.addButtonIcon("far fa-file-spreadsheet", "Insert a table which will be linked to a google sheet. You will need the google sheet id.", googleSheetsTable);
  let select = $(await TOOLBAR.addSelect("headers", "Insert a header with an icon."));
  for (let i = 0; i < headerOptions.length; i++) {
    let className = headerOptions[i];
    let optionName = className.replace("icon-", "").replace("-", " ");
    let option = await TOOLBAR.addSelectOption(optionName, 'headers', '', function () {
        insertHeader(className);
      },
      'btech-header-insert-option', {
        'icon': className
      }
    );
    option.attr('id', className + '-option');
  }
  select.select2({
    templateSelection: iconFormat,
    templateResult: iconFormat,
    allowHTML: true
  });
})();