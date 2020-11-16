(async function () {
  $('#content').empty();
  let dept = CURRENT_DEPARTMENT_ID;
  console.log(dept);
  let jsonUrl = 'https://jhveem.xyz/canvas/custom_features/reports/department/data.json';
  let jsonData = await canvasGet(jsonUrl);
  console.log(jsonData);
  let deptData = jsonData[dept];
  console.log(deptData);
  let enrollmentsUrl = '/api/v1/accounts/' + dept + '/users';
  let enrollments = await canvasGet(enrollmentsUrl, {
    enrollment_type: 'student'
  });
  console.log(enrollments);
})();