(async function () {
  function randomPassword() {
    return Array(10).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@$&").map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');
  }

  let passwordResetButton, tempPasswordSendButton;
  let menu_bar;
  if (/^\/courses\/[0-9]+\/users\/[0-9]+$/.test(window.location.pathname)) {
    passwordResetButton = $('<a style="cursor: pointer;" id="btech-password-reset"></a>');
    tempPasswordSendButton = $('<a style="cursor: pointer;" id="btech-temp-password-send"></a>');
    menu_bar = $("#right-side div").first();
  } else {
    passwordResetButton = $('<a class="btn button-sidebar-wide" id="btech-password-reset"></a>');
    tempPasswordSendButton = $('<a class="btn button-sidebar-wide" id="btech-temp-password-send"></a>');
    menu_bar = $("#right-side div").first();
  }
  passwordResetButton.append('<i class="icon-gradebook"></i>Password Reset');
  passwordResetButton.appendTo(menu_bar);
  passwordResetButton.click(function () {
    let resetPassword = confirm("Send this user a password reset email?");
    if (resetPassword) {
      let match = window.location.pathname.match(/(users|grades)\/([0-9]+)/);
      let userId = match[2];
      $.get("/api/v1/users/" + userId, function (data) {
        let loginId = data.login_id;
        $.post("https://btech.instructure.com/forgot_password?unique_id_forgot=" + loginId + "&pseudonym_session[unique_id_forgot]=" + loginId);
      });
    }
  });

  if (IS_CDD) {
    tempPasswordSendButton.append('<i class="icon-forward"></i>Send Temp Password');
    tempPasswordSendButton.appendTo(menu_bar);
  } else {
    tempPasswordSendButton.remove();
  }

  tempPasswordSendButton.click(async function() {
    let match = window.location.pathname.match(/(users|grades)\/([0-9]+)/);
    let userId = match[2];
    let users = await canvasGet(`/api/v1/users/${userId}`);
    let user = users[0];
    let logins = await canvasGet(`/api/v1/users/${userId}/logins`);
    let login = logins[0];
    let password = randomPassword();
    let body = {
      email: user.email,
      password: password,
      username: login.unique_id,
      name: user.name
    }
    await $.put(`/api/v1/accounts/3/logins/${login.id}`, {
      login: {
        password: password
      }
    });
    window.open(`
      mailto:${user.email}?subject=Temporary Canvas Password&body=Username%3A ${login.unique_id}%0D%0APassword%3A ${password}%0D%0APlease reset your password after you successfully log in.
    `)
    //Used to send an email from server, but was getting blocked even more than Canvas.
    // let res = await $.post("https://canvas.bridgetools.dev/api/temp_password", body);
    // if (res.status == 'success') alert(`Temporary Password set to: ${password} Remind the user to check their spam.`);
    // if (res.status == 'fail') alert("Failed to send!");
  });

  let channels = await canvasGet(`/api/v1/users/${ENV.USER_ID}/communication_channels`);

  $("#name_and_email .user_details tr").each(function() {
      let row = $(this);
      let h = row.find("th").text().toLowerCase();
      if (h.includes("email")) {
          let emailCell = row.find("td")
          let email = emailCell.text().toLowerCase();
          for (let c in channels) {
              let channel = channels[c];
              if (email == channel.address.toLowerCase()) {
                  if (channel.workflow_state == "unconfirmed") {
                      emailCell.append(`<i title="Email unconfirmed. Contact CDD for help. If admin: confirm with user email is correct, then act as user and confirm email." style="cursor: help; color: red; padding-left: 1rem;" class="icon-warning"></i>`);
                  }
              }
          }
      }
  });
})();