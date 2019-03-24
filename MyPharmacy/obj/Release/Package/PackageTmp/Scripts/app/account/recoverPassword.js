$(function () {
  $('#main').addClass('login-container');
  var l = Ladda.create(document.querySelector('button'));
  var validator = $("#recoverPassword-form").kendoValidator().data("kendoValidator");
  var recoverPasswordViewModel = kendo.observable({
    email: null,
    message: null,
    recoverPassword: function (e) {
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
          url: '/api/account/recoverPassword?email=' + recoverPasswordViewModel.email,
          dataType: 'json',
          type: 'POST',
          success: function () {
            recoverPasswordViewModel.set("message", "An email is sent with the password reset link.");
            l.setProgress(1);
            l.stop();
            $('.hideSection').hide();
            $('#success-message-area').show();
          },
          statusCode: {
            404: function () {
              recoverPasswordViewModel.set("message", "Unable to reset your password. Please contact your Administrator.");
              l.setProgress(1);
              l.stop();
              $('#message-area').show();
            }
          }
        });
      }
    }
  });
  kendo.bind($('#recoverPassword'), recoverPasswordViewModel);
}());