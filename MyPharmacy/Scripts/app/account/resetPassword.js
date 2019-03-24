$(function () {
  $('#main').addClass('login-container');
  var l = Ladda.create(document.querySelector('button'));
  var validator = $("#resetPassword-form").kendoValidator({
    rules: {
      equalto: function (input) {
        if (input.filter("[data-val-equalto-other]").length) {
          var otherField = input.attr("data-val-equalto-other");
          otherField = otherField.substr(otherField.lastIndexOf(".") + 1);
          return input.val() == $("#" + otherField).val();
        }
        return true;
      }
    },
    messages: {
      equalto: function (intput) {
        return intput.attr("data-val-equalto");
      }
    }
  }).data("kendoValidator");
  var resetPasswordViewModel = kendo.observable({
    message: null,
    reset: function (e) {
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
          url: '/api/account/resetPassword',
          dataType: 'json',
          type: 'POST',
          data: { UserId: window.getParameterByName('userId'), Token: window.getParameterByName('code'), NewPassword: $('#newPassword').val() },
          success: function () {
            l.setProgress(1);
            l.stop();
            $('.hideSection').hide();
            $('#success-message-area').show();
          },
          statusCode: {
            500: function () {
              resetPasswordViewModel.set("message", "An error occured during the password reset. Please contact your Administrator.");
              l.setProgress(1);
              l.stop();
              $('#message-area').show();
            }
          }
        });
      }
    }
  });

  kendo.bind($('#resetPassword'), resetPasswordViewModel);
}());