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
    rows = sourceTable.find('tbody tr');
    rows.each(function() {
      let row = $(this);
      let key = $(row.find('td')[0]).text()
      console.log(key);
    })
    $('.show-content').append(sourceTable);
  });
}