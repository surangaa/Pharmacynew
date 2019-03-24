using System.Collections.Generic;
using Microsoft.AspNet.Identity.EntityFramework;

namespace MyPharmacy.Core.Model
{
  public class UserRole : IdentityRole<int, UsersRole>
  {
    public UserRole()
    {
      // ReSharper disable DoNotCallOverridableMethodsInConstructor
      UserGroups = new List<UserGroup>();
      // ReSharper restore DoNotCallOverridableMethodsInConstructor
    }

    public UserRole(string name)
    {
      Name = name;
      // ReSharper disable DoNotCallOverridableMethodsInConstructor
      UserGroups = new List<UserGroup>();
      // ReSharper restore DoNotCallOverridableMethodsInConstructor
    }

    public virtual ICollection<UserGroup> UserGroups { get; set; }
  }
}
