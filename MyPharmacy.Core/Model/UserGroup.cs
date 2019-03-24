using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyPharmacy.Core.Model
{
  public class UserGroup
  {
    public UserGroup()
    {
      Roles = new List<UserRole>();
      Users = new List<User>();
    }

    [Key]
    [Column("GroupID")]
    public int GroupId { get; set; }
    [Column("Name")]
    public string Name { get; set; }
    [Column("NotifyMethodID")]
    public int? NotifyMethodId { get; set; }
    [Column("NotifyDelayDays")]
    public double? NotifyDelayDays { get; set; }
    public virtual ICollection<UserRole> Roles { get; set; }
    public virtual ICollection<User> Users { get; set; }
  }
}
