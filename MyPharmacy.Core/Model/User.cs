using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNet.Identity.EntityFramework;

namespace MyPharmacy.Core.Model
{
  public class User : IdentityUser<int, UserLogin, UsersRole, UserClaim>
  {
    public User()
    {
      // ReSharper disable DoNotCallOverridableMethodsInConstructor
      UserGroups = new List<UserGroup>();
      ChildUsers = new List<User>();
      // ReSharper restore DoNotCallOverridableMethodsInConstructor
    }

    [Column("ExternalID")]
    public int? ExternalId { get; set; }

    [Column("ParentUserID")]
    [ForeignKey("ParentUser")]
    public int? ParentUserId { get; set; }
    public virtual User ParentUser { get; set; }
    public virtual ICollection<User> ChildUsers { get; set; }
    public virtual UserData UserData { get; set; }
    public virtual ICollection<UserGroup> UserGroups { get; set; }
  }
}
