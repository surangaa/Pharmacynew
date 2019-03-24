using System;
using System.Collections.Generic;
using System.Globalization;
using System.Security.Claims;
using System.Threading.Tasks;
using MyPharmacy.Core.Model;
using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OAuth;

namespace MyPharmacy.Web.Providers
{
  public class ApplicationOAuthProvider : OAuthAuthorizationServerProvider
  {
    private readonly string publicClientId;
    private readonly Func<ApplicationUserManager> userManagerFactory;

    public ApplicationOAuthProvider(string publicClientId, Func<ApplicationUserManager> userManagerFactory)
    {
      if (publicClientId == null)
      {
        throw new ArgumentNullException("publicClientId");
      }

      if (userManagerFactory == null)
      {
        throw new ArgumentNullException("userManagerFactory");
      }

      this.publicClientId = publicClientId;
      this.userManagerFactory = userManagerFactory;
    }

    public override async Task GrantResourceOwnerCredentials(OAuthGrantResourceOwnerCredentialsContext context)
    {
      using (ApplicationUserManager userManager = userManagerFactory())
      {
        var user = await userManager.FindAsync(context.UserName, context.Password);

        if (user == null)
        {
          context.SetError("invalid_grant", "The username or password is incorrect.");
          return;
        }
        if (userManager.IsLockedOut(user.Id))
        {
          context.SetError("invalid_grant", "Account is locked out.");
          return;
        }
        ClaimsIdentity oAuthIdentity = await userManager.CreateIdentityAsync(user,
            context.Options.AuthenticationType);
        AddAdditionalClaims(oAuthIdentity, user);
        AuthenticationProperties properties = CreateProperties(user.UserName);
        var ticket = new AuthenticationTicket(oAuthIdentity, properties);
        context.Validated(ticket);
        ClaimsIdentity cookiesIdentity = await userManager.CreateIdentityAsync(user, CookieAuthenticationDefaults.AuthenticationType);
        AddAdditionalClaims(cookiesIdentity, user);
        context.Request.Context.Authentication.SignIn(cookiesIdentity);
      }
    }

    public override Task TokenEndpoint(OAuthTokenEndpointContext context)
    {
      foreach (KeyValuePair<string, string> property in context.Properties.Dictionary)
      {
        context.AdditionalResponseParameters.Add(property.Key, property.Value);
      }

      return Task.FromResult<object>(null);
    }

    public override Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context)
    {
      // Resource owner password credentials does not provide a client ID.
      if (context.ClientId == null)
      {
        context.Validated();
      }

      return Task.FromResult<object>(null);
    }

    public override Task ValidateClientRedirectUri(OAuthValidateClientRedirectUriContext context)
    {
      if (context.ClientId == publicClientId)
      {
        var expectedRootUri = new Uri(context.Request.Uri, "/");

        if (expectedRootUri.AbsoluteUri == context.RedirectUri)
        {
          context.Validated();
        }
      }

      return Task.FromResult<object>(null);
    }

    public static AuthenticationProperties CreateProperties(string userName)
    {
      IDictionary<string, string> data = new Dictionary<string, string>
            {
                { "userName", userName }
            };
      return new AuthenticationProperties(data);
    }

    private static void AddAdditionalClaims(ClaimsIdentity identity, User user)
    {
      identity.AddClaim(new Claim("ExternalId", user.ExternalId.HasValue ? user.ExternalId.Value.ToString(CultureInfo.InvariantCulture) : ""));
    }
  }
}