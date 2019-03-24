using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(MyPharmacy.Web.Startup))]
namespace MyPharmacy.Web
{
  public partial class Startup
  {
    public void Configuration(IAppBuilder app)
    {
      ConfigureAuth(app);
      app.MapSignalR();
    }
  }
}
