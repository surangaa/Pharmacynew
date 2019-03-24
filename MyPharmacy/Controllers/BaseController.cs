using System;
using System.Web.Mvc;
using System.Xml;
using NLog;

namespace MyPharmacy.Web.Controllers
{
  public class BaseController : Controller
  {
    protected override void OnException(ExceptionContext filterContext)
    {
      Logger log = LogManager.GetCurrentClassLogger();
      log.Fatal(filterContext.Exception.Message);
      filterContext.ExceptionHandled = true;
      filterContext.Result = new ViewResult
      {
        ViewName = "Error"
      };
    }

    protected override void OnActionExecuting(ActionExecutingContext filterContext)
    {
      string mapPointTypeName = GetInnerTextFromXmlByTagName("MapPointType");
      ViewBag.MapPointTypePageTitle = mapPointTypeName + "s";
      ViewBag.MapPointTypeTypeName = mapPointTypeName;

      string mapPointName = GetInnerTextFromXmlByTagName("MapPoint");
      ViewBag.MapPointPageTitle = mapPointName + "s";
      ViewBag.MapPointName = mapPointName;

      ViewBag.ScenarioText = GetInnerTextFromXmlByTagName("Scenario");
      ViewBag.AllocationText = GetInnerTextFromXmlByTagName("Allocation");
    }

    private string GetInnerTextFromXmlByTagName(string pageName)
    {
      var xml = new XmlDocument();
      using (XmlReader reader = XmlReader.Create(Server.MapPath("~/ResourceStrings.xml")))
      {
        xml.Load(reader);

        var node = xml.SelectSingleNode("/Tags/" + pageName);
        if (node != null)
        {
          return (node.FirstChild).InnerText;
        }
      }
      return String.Empty;
    }
  }
}