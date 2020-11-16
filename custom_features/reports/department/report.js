(async function () {
  $('#content').empty();
  let dept = CURRENT_DEPARTMENT_ID;
  let jsonUrl = 'https://jhveem.xyz/canvas/custom_features/reports/department/data.json';
  let jsonData = await canvasGet(jsonUrl);
  let deptData = jsonData[0][dept];
  let usersUrl = '/api/v1/accounts/' + dept + '/users';
  let users = await canvasGet(usersUrl, {
    enrollment_type: 'student'
  });
  console.log('awaited');
  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    if (user.id in deptData) {
      deptData[user.id].name = user.sortable_name;
    }
  }
  for (let user in deptData) {
    console.log(user);
  }
})();