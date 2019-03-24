using System.Web.Mvc;

namespace MyPharmacy.Web.Controllers
{
  [AllowAnonymous]
  public class AccountController : BaseController
  {
    public ActionResult Login()
    {
      return View();
    }

    public ActionResult RecoverPassword()
    {
      return View();
    }

    public ActionResult ResetPassword(string userId, string code)
    {
      return View();
    }
  }
}