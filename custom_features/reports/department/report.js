(async function () {
  let content = $('#content');
  content.empty();
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
    let div = $('<div></div>');
    div.append('<span>' + user.name + '</span>');
    for (let courseId in user) {
      if (courseId !== 'name') {
        let course = user[courseId];
        let progress = course.progress * .01;
        if (progress > 1) progress = 1;
        console.log(progress);
        let progressWidth = Math.round(progress * 64);
        console.log(progressWidth);
        div.append(`<div style="width: 64px; border: 1px solid #000; background-color: #334;">
          <div style='background-color: #1C91A4; color: #fff; width: `+progressWidth+`px'>`+courseId+`</div>
        </div>`);
      }
    }
    content.append(div);
    console.log(user);
  }
})();