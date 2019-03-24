$(function () {
  //if ($.cookie(window.authCookieKeyName) !== undefined) {
  //  window.location.href = "/";
  //}
  $('#main').addClass('login-container');
  var l = Ladda.create(document.querySelector('button'));
  var validator = $("#login-form").kendoValidator().data("kendoValidator");
  var loginViewModel = kendo.observable({
    username: null,
    password: null,
    message: null,
    login: function (e) {
      e.preventDefault();
      if (validator.validate()) {
        l.start();
        var progress = 0;
        setInterval(function () {
          progress = Math.min(progress + Math.random() * 0.1, 1);
          if (progress <= 0.8)
            l.setProgress(progress);
        }, 200);
        $.ajax({
          url: '/token',
          dataType: 'json',
          type: 'POST',
          data: { UserName: $('#username').val(), Password: $('#password').val(), grant_type: 'password' },
          success: function (data) {
            $.cookie(window.authCookieKeyName, data.access_token, { path: '/' });
            $.cookie(window.userInfoCookieKeyName, data.userName, { path: '/' });
            l.setProgress(1);
            l.stop();
            var returnUrl = window.getParameterByName('ReturnUrl');
            window.location.href = (returnUrl === null || returnUrl === "") ? "/" : returnUrl;
          },
          statusCode: {
            400: function (data) {
              loginViewModel.set("message", data.responseJSON.error_description);
              l.setProgress(1);
              l.stop();
              $('#message-area').show();
            }
          }
        });
      }
    }
  });

  kendo.bind($('#login'), loginViewModel);
}());