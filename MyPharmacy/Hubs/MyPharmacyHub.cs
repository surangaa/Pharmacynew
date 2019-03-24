using System.Linq;
using System.Threading.Tasks;
using MyPharmacy.Web.Infrastructure;
using Microsoft.AspNet.SignalR;

namespace MyPharmacy.Web.Hubs
{
  public class MyPharmacyHub : Hub
  {
    public override Task OnConnected()
    {
      string name = Context.User.Identity.Name;

      Global.Connections.Add(name, Context.ConnectionId);

      return base.OnConnected();
    }

    public override Task OnDisconnected(bool stopCalled)
    {
      string name = Context.User.Identity.Name;

      Global.Connections.Remove(name, Context.ConnectionId);

      return base.OnDisconnected(stopCalled);
    }

    public override Task OnReconnected()
    {
      string name = Context.User.Identity.Name;

      if (!Global.Connections.GetConnections(name).Contains(Context.ConnectionId))
      {
        Global.Connections.Add(name, Context.ConnectionId);
      }

      return base.OnReconnected();
    }
  }
}