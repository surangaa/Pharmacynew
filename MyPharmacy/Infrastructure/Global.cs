using MyPharmacy.Web.Hubs;

namespace MyPharmacy.Web.Infrastructure
{
  public class Global
  {
    public static ConnectionMapping<string> Connections { get; set; }
  }
}