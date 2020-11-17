//include a last updated list
(async function () {
  let content = $('#content');
  content.empty();
  let dept = CURRENT_DEPARTMENT_ID;
  let jsonUrl = 'https://jhveem.xyz/canvas/custom_features/reports/department/progress.json';
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
    let div = $('<div></div>');
    div.append('<span><a href="/users/'+userId+'">' + user.name + '</a></span><br>');
    for (let courseCode in user.courses) {
      let course = user.courses[courseCode][0];
      let progress = course.progress;
      if (progress > 100) progress = 100;
      div.append(`<div style="display: inline-block; border: 1px solid #000; background-color: #334;">
          <div style='box-sizing: border-box; white-space: nowrap; padding: 1px; font-size: 1em; background-color: #1C91A4; color: #fff; width: ` + progress + `%;'>` + courseCode + `</div>
        </div>`);
    }
    div.append('<br>')
    content.append(div);
    console.log(user);
  }
})();