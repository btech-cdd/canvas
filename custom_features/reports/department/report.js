(async function () {
  $('#content').empty();
  let dept = 3824;
  let jsonUrl = 'https://jhveem.xyz/canvas/custom_features/reports/department/data.json';
  let jsonData = await canvasGet(jsonUrl);
  let deptData = jsonData[dept];
  let enrollmentsUrl = '/api/v1/accounts/' + dept + '/users';
  let enrollments = await canvasGet(enrollmentsUrl, {
    enrollment_type: 'student'
  });
  console.log(enrollments);
})();