$(function () {
  var authCookie = $.cookie(window.authCookieKeyName);
  if (authCookie === undefined || authCookie === null) {
    $('#left-panel').hide();
    $('#ribbon').hide();
    $('body').addClass("hidden-menu");
    $('#activity').hide();
  }
  else {
    $('#left-panel').show();
    $('#ribbon').show();
    $('body').removeClass("hidden-menu");
    $("#logged-username").text($.cookie(window.userInfoCookieKeyName));
    $('#activity').show();
  }
  $("body").on("click", "button", function () {
    if ($(this)[0].id === "bot2-Msg1") {
      $.ajax({
        type: "POST",
        url: "/api/account/logout",
        dataType: "json",
        beforeSend: function (req) {
          req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
        }
      })
      .done(function () {
        $.cookie(window.authCookieKeyName, null, { path: '/' });
        $.removeCookie(window.authCookieKeyName, { path: '/' });
        $.cookie(window.userInfoCookieKeyName, null, { path: '/' });
        $.removeCookie(window.userInfoCookieKeyName, { path: '/' });
        window.location.href = "/account/login";
      });
    }
  });
});