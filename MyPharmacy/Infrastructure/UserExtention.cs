using System;
using System.Linq;
using System.Security.Claims;
using System.Security.Principal;

namespace MyPharmacy.Web.Infrastructure
{
  public static class UserExtention
  {
    public static int? ExternalId(this IPrincipal user)
    {
      if (user.Identity.IsAuthenticated)
      {
        var claimsIdentity = user.Identity as ClaimsIdentity;
        if (claimsIdentity == null) return null;
        foreach (var claim in claimsIdentity.Claims.Where(claim => claim.Type == "ExternalId"))
        {
          return claim.Value == "" ? (int?)null : Convert.ToInt32(claim.Value);
        }
        return null;
      }
      return null;
    }
  }
}