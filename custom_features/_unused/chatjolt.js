var chat_appid = '60609';
var chat_auth = 'e1dfe9f3565261374ab37028d7126c69';
if (typeof ENV.current_user != "undefined"){
  chat_id = ENV.current_user.id;
  chat_name = ENV.current_user.display_name;
  chat_avatar = ENV.current_user.avatar_image_url;
  chat_link = ENV.current_user.html_url;
}
(function() {
    var chat_css = document.createElement('link'); chat_css.rel = 'stylesheet'; chat_css.type = 'text/css'; chat_css.href = 'https://fast.cometondemand.net/'+chat_appid+'x_xchat.css';
    document.getElementsByTagName("head")[0].appendChild(chat_css);
    var chat_js = document.createElement('script'); chat_js.type = 'text/javascript'; chat_js.src = 'https://fast.cometondemand.net/'+chat_appid+'x_xchat.js'; var chat_script = document.getElementsByTagName('script')[0]; chat_script.parentNode.insertBefore(chat_js, chat_script);
})();