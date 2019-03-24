using System.Collections.Generic;

namespace MyPharmacy.Core.Admin
{
  public class GroupModel
  {
    public int Id { get; set; }
    public string Name { get; set; }
    public int? NotifyMethodId { get; set; }
    public double? NotifyDelayDays { get; set; }
    public List<string> UserRoles { get; set; }
  }
}
