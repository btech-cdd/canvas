(async function () {
  $('#content').empty();
  let dept = CURRENT_DEPARTMENT_ID;
  let jsonUrl = 'https://jhveem.xyz/canvas/custom_features/reports/department/data.json';
  let jsonData = await canvasGet(jsonUrl);
  let deptData = jsonData[dept];
  console.log(deptData);
  let enrollmentsUrl = '/api/v1/accounts/' + dept + '/users';
  let enrollments = await canvasGet(enrollmentsUrl, {
    enrollment_type: 'student'
  });
  console.log(enrollments);
})();