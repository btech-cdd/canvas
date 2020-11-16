(async function () {
  $('#content').empty();
  let dept = CURRENT_DEPARTMENT_ID;
  let jsonUrl = 'https://jhveem.xyz/canvas/custom_features/reports/department/data.json';
  let jsonData = await canvasGet(jsonUrl);
  let deptUsers = jsonData[0][dept];
  let usersUrl = '/api/v1/accounts/' + dept + '/users';
  let users = await canvasGet(usersUrl, {
    enrollment_type: 'student'
  });
  console.log('awaited');
  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    if (user.id in deptUsers) {
      deptUsers[user.id].name = user.sortable_name;
    }
  }
  for (let userId in deptUsers) {
    let user = deptUsers[userId];
    console.log(user);
  }
})();