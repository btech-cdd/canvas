(function () {
  let gen_report_button;
  let menu_bar;
  if (/^\/courses\/[0-9]+\/users\/[0-9]+$/.test(window.location.pathname)) {
    gen_report_button = $('<a style="cursor: pointer;" id="btech-password_reset"></a>');
    menu_bar = $("#right-side div").first();
  } else {
    gen_report_button = $('<a class="btn button-sidebar-wide" id="btech-password-reset"></a>');
    menu_bar = $("#right-side div").first();
  }
  gen_report_button.append('<i class="icon-gradebook"></i>Password Reset');
  gen_report_button.appendTo(menu_bar);
  gen_report_button.click(function () {
    let match = window.location.pathname.match(/(users|grades)\/([0-9]+)/);
    this.userId = match[2];
    $.post("https://btech.instructure.com/forgot_password?unique_id_forgot=" + userId + "&pseudonym_session[unique_id_forgot]=" + userId);
  });
})();