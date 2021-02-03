let childTables = $('.btech-table-from-page');
if (childTables.length > 0) {
  let courseId = ENV.courseId;
  $.get('/api/v1/courses/'+courseId+'/pages/parts-list-master', function (data) {
    let pBody = $('<div class=".page-body">' + data.body + '</div>');
    let sourceTable = pBody.find('.table-from-page-source');
    $('.show-content').append(sourceTable);
  });
}