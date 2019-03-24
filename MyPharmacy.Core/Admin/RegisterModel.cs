namespace MyPharmacy.Core.Admin
{
  using System.Collections.Generic;

  public class RegisterModel
  {
    public string UserName { get; set; }
    public string Email { get; set; }
    public string FullName { get; set; }
    public string Password { get; set; }
    public int? ParentUserId { get; set; }
    public string Suburb { get; set; }
    public double? SuburbX { get; set; }
    public double? SuburbY { get; set; }
    public List<string> UserGroups { get; set; }
  }
}
