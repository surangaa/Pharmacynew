using MyPharmacy.Core;
using MyPharmacy.Data;
using MyPharmacy.Web.Hubs;
using MyPharmacy.Web.Infrastructure;
using Newtonsoft.Json;
using NLog;
using System;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Xml;

namespace MyPharmacy.Web
{
  public class MvcApplication : HttpApplication
  {
    protected void Application_Start()
    {
      AreaRegistration.RegisterAllAreas();
      GlobalConfiguration.Configure(WebApiConfig.Register);
      FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
      RouteConfig.RegisterRoutes(RouteTable.Routes);
      BundleConfig.RegisterBundles(BundleTable.Bundles);
      SetResources();
      Global.Connections = new ConnectionMapping<string>();
      InitializeConfigurationManager();
    }

    private void Application_Error(Object sender, EventArgs e)
    {
      var exception = Server.GetLastError();
      if (exception == null)
      {
        return;
      }

      var log = LogManager.GetCurrentClassLogger();
      log.Fatal(exception.Message);
      if (exception.Messages().Any())
      {
        foreach (string message in exception.Messages())
        {
          log.Fatal(message);
        }
      }
      Server.ClearError();
    }

    private static void InitializeConfigurationManager()
    {
      using (var context = new ApplicationDbContext())
      {
        foreach (var appSetting in context.Settings.ToList())
        {
          ConfigurationManager.AppSettings.Add(appSetting.Key, appSetting.Value);
        }
      }
    }
    private void SetResources()
    {
      var doc = new XmlDocument();
      var resourcePath = HttpContext.Current.Server.MapPath("~/ResourceStrings.xml");
      doc.Load(new StreamReader(resourcePath));
      string jsonText = "var resources = " + JsonConvert.SerializeXmlNode(doc);
      var jsPath = Server.MapPath("~/Scripts/app/resources.js");
      File.WriteAllText(jsPath, jsonText);
    }
  }
}
