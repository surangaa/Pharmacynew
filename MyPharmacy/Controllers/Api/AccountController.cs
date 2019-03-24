using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using MyPharmacy.Core;
using MyPharmacy.Data;
using MyPharmacy.Web.Infrastructure;
using MyPharmacy.Web.Providers;
using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security.Cookies;
using NLog;

namespace MyPharmacy.Web.Controllers.Api
{
  public class AccountController : ApiController
  {
    private static readonly Logger Log = LogManager.GetCurrentClassLogger();

    [Authorize]
    [HttpPost]
    [Route("api/account/logout")]
    public IHttpActionResult Logout()
    {
      Request.GetOwinContext().Authentication.SignOut(CookieAuthenticationDefaults.AuthenticationType);
      return StatusCode(HttpStatusCode.NoContent);
    }

    [AllowAnonymous]
    [HttpPost]
    [Route("api/account/recoverPassword")]
    public IHttpActionResult RecoverPassword(string email)
    {
      using (var context = new ApplicationDbContext())
      {
        var userManager = new ApplicationUserManager(new ApplicationUserStore(context));
        var user = userManager.Users.Where(x => x.Email.Equals(email)).FirstOrDefault();
        if (user == null) return NotFound();
        var code = userManager.GeneratePasswordResetToken(user.Id);
        // ReSharper disable Mvc.ActionNotResolved
        var callbackUrl = Url.Link("Default", new { Controller = WebConstants.AccountControllerName, Action = WebConstants.ResetPasswordAction, userId = user.Id, code });
        EmailProvider.SendEmail(user.Email, "Reset Password", "Hi " + user.UserName + ",<br/><br/>Please reset your password by clicking here: <a href=\"" + callbackUrl + "\">link</a><br/><br/>MyPharmacy Team");
        // ReSharper restore Mvc.ActionNotResolved
        return StatusCode(HttpStatusCode.NoContent);
      }
    }

    [AllowAnonymous]
    [HttpPost]
    [Route("api/account/resetPassword")]
    public IHttpActionResult ResetPassword(ResetPassword resetPassword)
    {
      using (var context = new ApplicationDbContext())
      {
        var userManager = new ApplicationUserManager(new ApplicationUserStore(context));
        var result = userManager.ResetPassword(resetPassword.UserId, resetPassword.Token, resetPassword.NewPassword);
        if (result.Succeeded)
        {
          return StatusCode(HttpStatusCode.NoContent);
        }
        Log.Error(string.Join(",", result.Errors));
        return StatusCode(HttpStatusCode.InternalServerError);
      }
    }
  }
}
