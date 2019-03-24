using System.Web.Mvc;

namespace MyPharmacy.Web.Controllers
{
  [Authorize]
  public class HomeController : BaseController
  {
    public ActionResult Index()
    {
      return View();
    }
  }
}