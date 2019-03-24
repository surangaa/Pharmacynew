using MyPharmacy.Core.Model;
using System.Data.Entity.ModelConfiguration;

namespace MyPharmacy.Data.Mapping
{
  public class SettingMap : EntityTypeConfiguration<Setting>
  {
    public SettingMap()
    {
      // Primary Key
      HasKey(t => t.SettingId);

      // Properties
      Property(t => t.Key)
          .IsRequired()
          .HasMaxLength(50);

      Property(t => t.Value)
          .IsRequired()
          .HasMaxLength(200);

      Property(t => t.Description)
          .HasMaxLength(500);

      Property(t => t.Type)
          .HasMaxLength(50);

      Property(t => t.ValidationRegex)
          .HasMaxLength(500);

      Property(t => t.CssClass)
          .HasMaxLength(50);

      // Table & Column Mappings
      ToTable("Settings");
      Property(t => t.SettingId).HasColumnName("SettingID");
      Property(t => t.Key).HasColumnName("Key");
      Property(t => t.Value).HasColumnName("Value");
      Property(t => t.Description).HasColumnName("Description");
      Property(t => t.Type).HasColumnName("Type");
      Property(t => t.ValidationRegex).HasColumnName("ValidationRegex");
      Property(t => t.CssClass).HasColumnName("CssClass");
      Property(t => t.SettingTypeId).HasColumnName("SettingTypeID");
    }
  }
}
