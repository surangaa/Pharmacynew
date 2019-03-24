namespace MyPharmacy.Core
{
  public class ResetPassword
  {
    public int UserId { get; set; }
    public string Token { get; set; }
    public string NewPassword { get; set; }
  }
}
