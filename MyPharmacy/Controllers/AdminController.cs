using System.Web.Mvc;
using MyPharmacy.Core;
namespace MyPharmacy.Web.Controllers
{
  [Authorize(Roles = GlobalConstants.AdminRole)]
  public class AdminController : BaseController
  {
    public ActionResult Index()
    {
      return View();
    }

    public ActionResult UserGroups()
    {
      return View();
    }

    public ActionResult Settings()
    {
      return View();
    }
  }
}