let childTables = $('.btech-table-from-page');
if (childTables.length > 0) {
  let courseId = ENV.COURSE_ID;
  $.get('/api/v1/courses/'+courseId+'/pages/parts-list-master', function (data) {
    let pBody = $('<div class=".page-body">' + data.body + '</div>');
    let sourceTable = pBody.find('.table-from-page-source');
    let newTable = $('<table></table>');
    rowRef = {};
    //set style of new table to style of source table
    let thead = sourceTable.find('thead');
    newTable.append(thead);
    let tbody = $("<tbody></tbody>")
    newTable.append(tbody);
    sourceRows = sourceTable.find('tbody tr');
    sourceRows.each(function() {
      let row = $(this);
      let key = $(row.find('td')[0]).text().toLowerCase();
      console.log(key);
      rowRef[key] = row;
    });

    childTables.each(function() {
      let childTable = $(this);
      let childRows = childTable.find('tbody tr');
      childRows.each(function() {
        let row = this;
        let key = $(row.find('td')[0]).text().toLowerCase();
        if (key in rowRef) {
          tbody.append(rowRef[key]);
        }
      })
    })
    $('.show-content').append(newTable);
  });
}