using Microsoft.AspNet.Identity.EntityFramework;
using MyPharmacy.Core.Model;
using MyPharmacy.Data.Mapping;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;

namespace MyPharmacy.Data
{
  public class ApplicationDbContext : IdentityDbContext<User, UserRole, int, UserLogin, UsersRole, UserClaim>
  {
    public ApplicationDbContext()
      : base("name=ApplicationDbContext")
    {
      Database.CommandTimeout = 3600;
    }

    static ApplicationDbContext()
    {
      Database.SetInitializer<ApplicationDbContext>(null);
    }

    public DbSet<Setting> Settings { get; set; }
    public DbSet<UserData> UserData { get; set; }
    public DbSet<UserGroup> UserGroups { get; set; }
    public DbSet<Supplier> Suppliers { get; set; }

    protected override void OnModelCreating(DbModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);
      modelBuilder.Entity<UserGroup>().ToTable("[UserGroups]");
      modelBuilder.Entity<UserGroup>()
        .HasMany<User>(g => g.Users)
        .WithMany(u => u.UserGroups)
        .Map(gu =>
        {
          gu.MapLeftKey("GroupID");
          gu.MapRightKey("UserID");
          gu.ToTable("UserGroupUsers");
        });
      modelBuilder.Entity<User>().ToTable("[Users]").Property(x => x.Id).HasColumnName("UserID");

      modelBuilder.Entity<User>()
        .HasOptional<UserData>(r => r.UserData)
        .WithRequired(g => g.User);
      modelBuilder.Entity<UserData>().ToTable("[UserData]");

      modelBuilder.Entity<UserRole>().ToTable("[UserRoles]").Property(x => x.Id).HasColumnName("RoleID");
      modelBuilder.Entity<UserGroup>()
        .HasMany<UserRole>(r => r.Roles)
        .WithMany(g => g.UserGroups)
        .Map(rg =>
        {
          rg.MapLeftKey("GroupID");
          rg.MapRightKey("RoleID");
          rg.ToTable("UserGroupRoles");
        });
      modelBuilder.Entity<UsersRole>().ToTable("[UsersRoles]").Property(x => x.UserId).HasColumnName("UserID");
      modelBuilder.Entity<UsersRole>().ToTable("[UsersRoles]").Property(x => x.RoleId).HasColumnName("RoleID");

      modelBuilder.Entity<UserLogin>().ToTable("[UserLogins]").Property(x => x.UserId).HasColumnName("UserID");

      modelBuilder.Entity<UserClaim>().ToTable("[UserClaims]").Property(x => x.Id).HasColumnName("UserClaimID");
      modelBuilder.Entity<UserClaim>().ToTable("[UserClaims]").Property(x => x.UserId).HasColumnName("UserID");

      modelBuilder.Configurations.Add(new SettingMap());

      modelBuilder.Conventions.Remove<OneToManyCascadeDeleteConvention>();
    }
  }
}
