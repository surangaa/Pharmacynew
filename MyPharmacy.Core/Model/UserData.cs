using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyPharmacy.Core.Model
{
  public class UserData
  {
    [Key, ForeignKey("User")]
    [Column("UserID")]
    public int UserId { get; set; }

    [Column("Suburb")]
    public string Suburb { get; set; }

    [Column("SuburbX")]
    public double? SuburbX { get; set; }

    [Column("SuburbY")]
    public double? SuburbY { get; set; }

    [Column("FullName")]
    public string FullName { get; set; }

    [Column("CleanAddress")]
    public string CleanAddress { get; set; }

    public virtual User User { get; set; }
  }
}
