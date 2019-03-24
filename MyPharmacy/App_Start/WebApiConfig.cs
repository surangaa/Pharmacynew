using System.Web.Http;
using System.Web.Http.ExceptionHandling;
using MyPharmacy.Web.Infrastructure;
using Microsoft.Owin.Security.OAuth;

namespace MyPharmacy.Web
{
  public static class WebApiConfig
  {
    public static void Register(HttpConfiguration config)
    {
      // Web API configuration and services
      // Configure Web API to use only bearer token authentication.
      config.SuppressDefaultHostAuthentication();
      config.Filters.Add(new HostAuthenticationFilter(OAuthDefaults.AuthenticationType));
      //config.SetDocumentationProvider(new XmlDocumentationProvider(HttpContext.Current.Server.MapPath("~/App_Data/XmlDocument.XML")));
      // Web API routes
      config.MapHttpAttributeRoutes();
      config.Services.Replace(typeof(IExceptionLogger), new UnhandledExceptionLogger());  
      config.Routes.MapHttpRoute(
          name: "DefaultApi",
          routeTemplate: "api/{controller}/{id}",
          defaults: new { id = RouteParameter.Optional }
      );
    }
  }
}
