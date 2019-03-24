using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MyPharmacy.Web.Controllers
{
    [Authorize]
    public class MasterDataController : Controller
    {
        // GET: MasterData
        public ActionResult Products()
        {
            return View();
        }
    }
}