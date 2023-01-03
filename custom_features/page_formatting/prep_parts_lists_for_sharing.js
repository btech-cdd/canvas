//create a button... somewhere, maybe on the parts list master page?

function dupStyle(to, from) {
  to.attr('style', from.attr('style'));
  to.attr('border', from.attr('border'));
  to.attr('cellspacing', from.attr('cellspacing'));
  to.attr('cellpadding', from.attr('cellpadding'));
}

let partsListPage = await canvasGet("/api/v1/courses/" + ENV.COURSE_ID + "/pages/parts-list-master");
let partsListBody = $('<div class=".page-body">' + partsListPage[0].body + '</div>');
let partsListTable = partsListBody.find('table');
let partsListRows = partsListTable.find('tbody tr');
let rowRef = {};
partsListRows.each(function () {
  let row = $(this);
  let key = $(row.find('td')[0]).text().toLowerCase();
  rowRef[key] = row;
});

function updateContent(content) {
  let newPageBody = $('<div class=".new-page-body">' + content + '</div>');
  let childTables = newPageBody.find('.btech-table-from-page');
  if (childTables.length > 0) {
      childTables.each(function () {
          //Set up table
          let newTable = $('<table></table>');
          dupStyle(newTable, partsListTable);
          newTable.css('height', '');
          
          //pull head directly from source
          let thead = partsListTable.find('thead').clone();
          newTable.append(thead);
          
          //Create a new body and duplicate style from source
          let tbody = $("<tbody></tbody>");
          dupStyle(tbody, partsListTable.find('tbody'));
          newTable.append(tbody);
          
          //Go row by from and add in same order as what appears on page
          let childTable = $(this);
          let childRows = childTable.find('tbody tr');
          childRows.each(function () {
              let row = $(this);
              let key = $(row.find('td')[0]).text().toLowerCase();
              if (key in rowRef) {
                  tbody.append(rowRef[key].clone());
              }
          });
          
          //add the newly created table to the page
          childTable.after(newTable);
          childTable.remove();
      });
  }
    return $(newPageBody[0]).html();
}

let assignments = await canvasGet("/api/v1/courses/" + ENV.COURSE_ID + "/assignments");
for (let a in assignments) {
    let assignment = assignments[a];
    let newContent = updateContent(assignment.description);
    $.put("/api/v1/courses/" + ENV.COURSE_ID + "/assignments/" + assignment.id, {
      assignment: {
          description: newContent
      }
    });
    
}

let pages = await canvasGet("/api/v1/courses/" + ENV.COURSE_ID + "/pages");
for (let p in pages) {
  let pData = pages[p];
  let page = await canvasGet("/api/v1/courses/" + ENV.COURSE_ID + "/pages/" + pData.url);
  page = page[0];
  let newContent = updateContent(page.body);
  $.put("/api/v1/courses/" + ENV.COURSE_ID + "/pages/" + pData.url, {
      wiki_page: {
          body: newContent
      }
  });
}