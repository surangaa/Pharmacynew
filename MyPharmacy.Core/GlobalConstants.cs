namespace MyPharmacy.Core
{
  public static class GlobalConstants
  {
    public const string DateFormat = "dd/MM/yyyy";
    public const string TimeFormat = "HH:mm";
    public const string DateTimeFormat = "dd/MM/yyyy hh:mm tt";
    public const string JsonDateTimeFormat = "yyyy-MM-dd HH:mm:ss";

    public const string AdminRole = "Admin";
    public const string AllocationOnlyRole = "AllocationOnly";
    public const string ReviewActionsRole = "ReviewActions";
    public const string ReadOnlyRole = "ReadOnly";
    public const string ReviewerRole = "Reviewer";
    public const string DefaultUser = "admin";

    public const string CookieKey = "CookieId";
    public const string SiteUrl = "SiteUrl";

    public const int IsNull = -1;
    public const string IsEmptyNull = " ";
  }
}
