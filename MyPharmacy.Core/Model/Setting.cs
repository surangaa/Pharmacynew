namespace MyPharmacy.Core.Model
{
  public class Setting
  {
    public int SettingId { get; set; }
    public string Key { get; set; }
    public string Value { get; set; }
    public string Description { get; set; }
    public string Type { get; set; }
    public string ValidationRegex { get; set; }
    public string CssClass { get; set; }
    public int SettingTypeId { get; set; }
  }
}
