(async function () {
  let passwordResetButton;
  let menu_bar;
  if (/^\/courses\/[0-9]+\/users\/[0-9]+$/.test(window.location.pathname)) {
    passwordResetButton = $('<a style="cursor: pointer;" id="btech-password_reset"></a>');
    menu_bar = $("#right-side div").first();
  } else {
    passwordResetButton = $('<a class="btn button-sidebar-wide" id="btech-password-reset"></a>');
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
})();