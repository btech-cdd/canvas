(async function () {
  $('#content').empty();
  let dept = CURRENT_DEPARTMENT_ID;
  let jsonUrl = 'https://jhveem.xyz/canvas/custom_features/reports/department/data.json';
  let jsonData = await canvasGet(jsonUrl);
  let deptData = jsonData[0][dept];
  let enrollmentsUrl = '/api/v1/accounts/' + dept + '/users';
  let enrollments = await canvasGet(enrollmentsUrl, {
    enrollment_type: 'student'
  });
  console.log(enrollments);
  for (let i = 0; i < enrollments.length; i++) {
    let enrollment = enrollments[i];
    if (enrollment.id in deptData) {
      console.log(enrollment);
      console.log(deptData[enrollment.id]);
    }
  }
})();