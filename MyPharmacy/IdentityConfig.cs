using System;
using System.Security.Cryptography;
using System.Text;
using MyPharmacy.Core.Model;
using MyPharmacy.Data;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using Microsoft.Owin.Security.DataProtection;

namespace MyPharmacy.Web
{
  public class ApplicationUserStore : UserStore<User, UserRole, int, UserLogin, UsersRole, UserClaim>
  {
    public ApplicationUserStore(ApplicationDbContext context)
      : base(context)
    {
    }
  }

  public class ApplicationRoleStore : RoleStore<UserRole, int, UsersRole>
  {
    public ApplicationRoleStore(ApplicationDbContext context)
      : base(context)
    {
    }
  }

  public class ApplicationUserManager : UserManager<User, int>
  {
    public ApplicationUserManager(IUserStore<User, int> store)
      : base(store)
    {
      PasswordHasher = new ApplicationPasswordHasher();
      UserTokenProvider = new DataProtectorTokenProvider<User, int>(new DpapiDataProtectionProvider("MyPharmacy").Create("ASP.NET Identity"))
      {
        TokenLifespan = TimeSpan.FromHours(1),
      };
      PasswordValidator = new PasswordValidator
      {
        //RequiredLength = 4,
        //RequireNonLetterOrDigit = false,
        //RequireDigit = false,
        //RequireLowercase = false,
        //RequireUppercase = false
      };
    }
  }

  public class ApplicationPasswordHasher : PasswordHasher
  {
    public override PasswordVerificationResult VerifyHashedPassword(string hashedPassword, string providedPassword)
    {
      return hashedPassword.Equals(HashPassword(providedPassword)) ? PasswordVerificationResult.Success : PasswordVerificationResult.Failed;
    }

    public override string HashPassword(string password)
    {
      // step 1, calculate MD5 hash from input
      var md5 = MD5.Create();
      var inputBytes = Encoding.ASCII.GetBytes(password);
      var hash = md5.ComputeHash(inputBytes);

      // step 2, convert byte array to hex string
      var sb = new StringBuilder();
      for (int i = 0; i < hash.Length; i++)
      {
        sb.Append(hash[i].ToString("X2"));
      }
      return sb.ToString();
    }
  }
}