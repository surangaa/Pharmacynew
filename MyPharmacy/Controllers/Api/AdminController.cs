using Microsoft.AspNet.Identity;
using MyPharmacy.Core;
using MyPharmacy.Core.Admin;
using MyPharmacy.Core.Model;
using MyPharmacy.Data;
using NLog;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
namespace MyPharmacy.Web.Controllers.Api
{
  [Authorize(Roles = GlobalConstants.AdminRole)]
  public class AdminController : ApiController
  {
    private static readonly Logger Log = LogManager.GetCurrentClassLogger();

    [HttpGet]
    [Route("api/users")]
    public IHttpActionResult GetUsers()
    {
      using (var context = new ApplicationDbContext())
      {
        var userManager = new ApplicationUserManager(new ApplicationUserStore(context));
        var users =
          userManager.Users.Select(
            x =>
            new
            {
              x.Id,
              x.UserName,
              x.Email,
              x.ParentUserId,
              Suburb = x.UserData != null ? x.UserData.Suburb : String.Empty,
              ParentUserName = x.ParentUser != null ? x.ParentUser.UserName : String.Empty,
              Status =
              (x.LockoutEnabled && (x.LockoutEndDateUtc.HasValue && x.LockoutEndDateUtc > DateTime.Now))
                ? "Inactive"
                : "Active",
              IsLockout = x.LockoutEnabled && (x.LockoutEndDateUtc.HasValue && x.LockoutEndDateUtc > DateTime.Now),
              UserGroups = x.UserGroups.Select(y => y.Name).ToList()
            }).ToList();

        return Ok(users.Select(x => new
        {
          x.Id,
          x.UserName,
          x.Email,
          x.ParentUserId,
          x.Suburb,
          x.ParentUserName,
          x.Status,
          x.IsLockout,
          UserGroups = string.Join(", ", x.UserGroups)
        }));
      }
    }

    [HttpGet]
    [Route("api/user/{id}")]
    public async Task<IHttpActionResult> DetailsAsync(int id)
    {
      using (var context = new ApplicationDbContext())
      {
        var user = await context.Users.FirstOrDefaultAsync(x => x.Id == id);
        if (user == null)
        {
          return NotFound();
        }
        var userManager = new ApplicationUserManager(new ApplicationUserStore(context));
        var supervisors = userManager.Users.Select(x => new { x.Id, x.UserName }).Where(x => x.Id != id).ToList();
        var userGroups = user.UserGroups.Select(x => x.Name).ToList();
        supervisors.Insert(0, new { Id = GlobalConstants.IsNull, UserName = string.Empty });



        return Ok(new
        {
          user.Id,
          user.UserName,
          user.Email,
          FullName = user.UserData != null ? user.UserData.FullName : String.Empty,
          Suburb = user.UserData != null ? user.UserData.Suburb : String.Empty,
          SuburbX = user.UserData != null ? user.UserData.SuburbX : null,
          SuburbY = user.UserData != null ? user.UserData.SuburbY : null,
          ParentUserId = user.ParentUserId ?? GlobalConstants.IsNull,
          ParentName = user.ParentUser != null ? user.ParentUser.UserName : String.Empty,
          Supervisors = supervisors,
          UserGroups = string.Join(", ", userGroups),
          Groups = user.UserGroups.Select(x => x.Name).ToList(),
          IsReadOnly = userManager.IsInRole(user.Id, GlobalConstants.ReadOnlyRole),
          IsLockout = user.LockoutEnabled && (user.LockoutEndDateUtc.HasValue && user.LockoutEndDateUtc > DateTime.Now)
        });
      }
    }

    [HttpGet]
    [Route("api/user/check/{name}")]
    public async Task<IHttpActionResult> CheckUserNameExistsAsync(string name)
    {
      if (name == null)
      {
        return NotFound();
      }
      using (var context = new ApplicationDbContext())
      {
        var userManager = new ApplicationUserManager(new ApplicationUserStore(context));
        var user = await userManager.Users.FirstOrDefaultAsync(x => x.UserName.Equals(name));
        return Ok(user == null);
      }
    }

    [HttpGet]
    [Route("api/user/checkEmail/{email}")]
    public async Task<IHttpActionResult> CheckUserEmailExistsAsync(string email)
    {
      if (email == null)
      {
        return NotFound();
      }
      using (var context = new ApplicationDbContext())
      {
        var userManager = new ApplicationUserManager(new ApplicationUserStore(context));
        var user = await userManager.Users.FirstOrDefaultAsync(x => x.Email.Equals(email));
        return Ok(user == null);
      }
    }

    [HttpGet]
    [Route("api/role/check/{name}")]
    public async Task<IHttpActionResult> CheckRoleNameExistsAsync(string name)
    {
      using (var context = new ApplicationDbContext())
      {
        var roleManager = new RoleManager<UserRole, int>(new ApplicationRoleStore(context));
        return Ok(!await roleManager.Roles.AnyAsync(x => x.Name == name));
      }
    }

    [HttpPost]
    [Route("api/user/create")]
    public async Task<IHttpActionResult> CreateUserAsync(RegisterModel model)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest(ModelState);
      }

      var newUser = new User
      {
        UserName = model.UserName,
        Email = model.Email,
        ParentUserId = model.ParentUserId != GlobalConstants.IsNull ? model.ParentUserId : null,
        UserData = new UserData
        {
          Suburb = model.Suburb,
          SuburbX = model.SuburbX,
          SuburbY = model.SuburbY,
          FullName = model.FullName
        }
      };

      using (var context = new ApplicationDbContext())
      {

        var userManager = new ApplicationUserManager(new ApplicationUserStore(context));

        var result = await userManager.CreateAsync(newUser, model.Password);
        var errorResult = GetErrorResult(result);
        if (errorResult == null)
        {
          var user = await context.Users.SingleOrDefaultAsync(x => x.Id == newUser.Id);
          if (model.UserGroups != null && model.UserGroups.Count != 0)
          {

            foreach (string userGroup in model.UserGroups)
            {
              string ug = userGroup;
              var group = await context.UserGroups.SingleOrDefaultAsync(x => x.Name == ug);
              if (group != null)
              {
                if (user != null)
                {
                  user.UserGroups.Add(group);
                  foreach (var userRole in group.Roles)
                  {
                    user.Roles.Add(new UsersRole { UserId = user.Id, RoleId = userRole.Id });
                  }
                }
              }
              await context.SaveChangesAsync();
            }
          }
          else
          {
            var readOnlyGroup = await context.UserGroups.SingleOrDefaultAsync(x => x.Name == GlobalConstants.ReadOnlyRole);
            if (readOnlyGroup != null)
            {
              user.UserGroups.Add(readOnlyGroup);
              foreach (var userRole in readOnlyGroup.Roles)
              {
                user.Roles.Add(new UsersRole { UserId = user.Id, RoleId = userRole.Id });
              }
            }

            await context.SaveChangesAsync();
          }

          return Ok(true);
        }

        return errorResult;
      }
    }

    [HttpPost]
    [Route("api/user/edit")]
    public async Task<IHttpActionResult> EditUserAsync(UpdateProfileModel formuser)
    {
      if (formuser.Id == 0)
      {
        return Ok(false);
      }
      IList<int> roles = new List<int>();
      using (var context = new ApplicationDbContext())
      {
        var userManager = new ApplicationUserManager(new ApplicationUserStore(context));
        var user = await context.Users.FirstOrDefaultAsync(x => x.Id == formuser.Id);
        if (user != null)
        {
          user.UserName = formuser.UserName;
          user.Email = formuser.Email;
          user.ParentUserId = formuser.ParentUserId != GlobalConstants.IsNull ? formuser.ParentUserId : null;

          if (user.UserData == null)
          {
            user.UserData = new UserData();
          }
          user.UserData.Suburb = formuser.Suburb;
          user.UserData.SuburbX = formuser.SuburbX;
          user.UserData.SuburbY = formuser.SuburbY;
          user.UserData.FullName = formuser.FullName;

          if (formuser.IsActive)
          {
            user.LockoutEnabled = false;
            user.LockoutEndDateUtc = null;
          }
          else
          {
            user.LockoutEnabled = true;
            user.LockoutEndDateUtc = DateTime.MaxValue;
          }
          if (!string.IsNullOrEmpty(formuser.NewPassword))
          {

            user.PasswordHash = userManager.PasswordHasher.HashPassword(formuser.NewPassword);
            user.SecurityStamp = Guid.NewGuid().ToString();
          }
          user.Roles.Clear();
          if (formuser.UserGroups != null && formuser.UserGroups.Count != 0)
          {
            user.UserGroups.Clear();
            foreach (var userGroup in formuser.UserGroups)
            {
              string ug = userGroup;
              var group = await context.UserGroups.SingleOrDefaultAsync(x => x.Name == ug);
              if (group != null)
              {
                user.UserGroups.Add(group);
                foreach (var userRole in group.Roles.ToList())
                {
                  roles.Add(userRole.Id);
                }
              }
            }
            foreach (var role in roles.Distinct())
            {
              var usersRole = new UsersRole { UserId = user.Id, RoleId = role };
              user.Roles.Add(usersRole);
            }
            await context.SaveChangesAsync();
          }
          else
          {
            user.UserGroups.Clear();
            user.Roles.Clear();
            await context.SaveChangesAsync();

            var readOnlyGroup = await context.UserGroups.SingleOrDefaultAsync(x => x.Name == GlobalConstants.ReadOnlyRole);
            if (readOnlyGroup != null)
            {
              user.UserGroups.Add(readOnlyGroup);
              foreach (var userRole in readOnlyGroup.Roles.ToList())
              {
                roles.Add(userRole.Id);
              }
            }

            foreach (var role in roles.Distinct())
            {
              var usersRole = new UsersRole { UserId = user.Id, RoleId = role };
              user.Roles.Add(usersRole);
            }
            await context.SaveChangesAsync();

          }

          return Ok(true);
        }
        return Ok(false);
      }
    }

    [HttpGet]
    [Route("api/roles")]
    public async Task<IHttpActionResult> GetRolesAsync()
    {
      using (var context = new ApplicationDbContext())
      {
        var roles = await context.Roles.Select(o => new
        {
          o.Id,
          o.Name,
          SelectedGroups = o.UserGroups.Select(x => x.GroupId).ToList(),
          SelectedUsers = o.Users.Select(x => x.UserId).ToList()
        }).OrderBy(x => x.Name).ToListAsync();

        return Ok(roles);
      }
    }

    [HttpGet]
    [Route("api/group/lookupData")]
    public async Task<IHttpActionResult> GetGroupLookUpData()
    {
      using (var context = new ApplicationDbContext())
      {
        var roles = await context.Roles.Select(x => new { x.Id, x.Name }).ToListAsync();
        return Ok(new
        {
          Roles = roles
        });
      }
    }

    [HttpGet]
    [Route("api/group/{id}")]
    public async Task<IHttpActionResult> GetGroupDetailsAsync(int id)
    {
      using (var context = new ApplicationDbContext())
      {
        var group = await context.UserGroups.FirstOrDefaultAsync(x => x.GroupId == id);
        var roles = group == null ? new List<string>() : group.Roles.Select(x => x.Name).ToList();
        return Ok(new
        {
          GroupId = id,
          Name = group == null ? string.Empty : group.Name,
          Roles = roles,
          GroupRoles = string.Join(", ", roles)
        });
      }
    }

    [HttpGet]
    [Route("api/groups")]
    public async Task<IHttpActionResult> GetGroupsAsync()
    {
      using (var context = new ApplicationDbContext())
      {
        return Ok(await context.UserGroups.Select(x => new
        {
          x.GroupId,
          x.Name,
          CanDelete = x.Users.Count == 0,
        }).OrderBy(x => x.Name).ToListAsync());
      }
    }

    [HttpGet]
    [Route("api/group/check/{name}")]
    public async Task<IHttpActionResult> CheckGroupNameExistsAsync(string name)
    {
      if (name == null)
      {
        return NotFound();
      }
      using (var context = new ApplicationDbContext())
      {
        return Ok(!await context.UserGroups.AnyAsync(x => x.Name == name));
      }
    }

    [HttpPut]
    [Route("api/group/edit/{id}")]
    public async Task<IHttpActionResult> UpdateGroupAsync(int id, GroupModel groupUpdate)
    {
      if (id != groupUpdate.Id)
      {
        return BadRequest();
      }

      using (var context = new ApplicationDbContext())
      {
        var group = await context.UserGroups.FirstOrDefaultAsync(x => x.GroupId == id);
        if (group == null)
        {
          return NotFound();
        }

        group.Name = groupUpdate.Name;
        group.NotifyMethodId = groupUpdate.NotifyMethodId == GlobalConstants.IsNull ? null : groupUpdate.NotifyMethodId;
        group.NotifyDelayDays = groupUpdate.NotifyMethodId == GlobalConstants.IsNull ? null : groupUpdate.NotifyDelayDays;

        foreach (var userRole in group.Roles.ToList())
        {
          group.Roles.Remove(userRole);
        }
        if (groupUpdate.UserRoles != null && groupUpdate.UserRoles.Count != 0)
        {
          foreach (var roleName in groupUpdate.UserRoles)
          {
            string rn = roleName;
            var role = await context.Roles.SingleOrDefaultAsync(x => x.Name == rn);
            if (role != null)
            {
              group.Roles.Add(role);
            }
          }
        }

        foreach (User user in group.Users)
        {
          user.Roles.Clear();
          foreach (UserRole role in group.Roles)
          {
            var usersRole = new UsersRole
            {
              UserId = user.Id,
              RoleId = role.Id
            };
            user.Roles.Add(usersRole);
          }
        }

        await context.SaveChangesAsync();
      }
      return StatusCode(HttpStatusCode.NoContent);
    }

    [HttpDelete]
    [Route("api/group/delete/{id}")]
    public async Task<IHttpActionResult> DeleteGroupAsync(int id)
    {
      using (var context = new ApplicationDbContext())
      {
        var group = await context.UserGroups.SingleOrDefaultAsync(x => x.GroupId == id);
        if (group == null)
        {
          return NotFound();
        }
        foreach (var userRole in group.Roles.ToList())
        {
          foreach (var user in userRole.Users.ToList())
          {
            userRole.Users.Remove(user);
          }
          group.Roles.Remove(userRole);
        }
        foreach (var user in group.Users.ToList())
        {
          group.Users.Remove(user);
        }
        context.UserGroups.Remove(group);
        await context.SaveChangesAsync();
        return Ok(new { group.GroupId, group.Name });
      }
    }

    [HttpPost]
    [Route("api/group/create")]
    public async Task<IHttpActionResult> CreateGroupAsync(GroupModel group)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest(ModelState);
      }
      using (var context = new ApplicationDbContext())
      {
        var newGroup = new UserGroup
        {
          Name = group.Name,
          NotifyDelayDays = group.NotifyMethodId == GlobalConstants.IsNull ? null : group.NotifyDelayDays,
          NotifyMethodId = group.NotifyMethodId == GlobalConstants.IsNull ? null : group.NotifyMethodId
        };
        if (group.UserRoles != null && group.UserRoles.Count != 0)
        {
          foreach (var roleName in group.UserRoles)
          {
            string rn = roleName;
            var role = await context.Roles.SingleOrDefaultAsync(x => x.Name == rn);
            if (role != null)
            {
              newGroup.Roles.Add(role);
            }
          }
        }

        context.UserGroups.Add(newGroup);
        await context.SaveChangesAsync();
      }
      return StatusCode(HttpStatusCode.NoContent);
    }

    [HttpGet]
    [Route("api/settings")]
    public async Task<IHttpActionResult> GetConfigSettingsAsync()
    {
      using (var context = new ApplicationDbContext())
      {
        var appSettingsList =
          context.Settings.Where(x => x.SettingTypeId == 1).Select(
            key =>
            new { key.Key, key.Value, key.CssClass, key.Description, key.SettingId, key.ValidationRegex, key.Type })
            .OrderBy(x => x.Key).ToListAsync();
        return Ok(await appSettingsList);
      }
    }

    [HttpGet]
    [Route("api/colors")]
    public async Task<IHttpActionResult> GetConfigColorSettingsAsync()
    {
      using (var context = new ApplicationDbContext())
      {
        var colorAppSettingsList =
          context.Settings.Where(x => x.SettingTypeId == 2 || x.SettingTypeId == 3).Select(
            key =>
            new { key.Key, key.Value, key.CssClass, key.Description, key.SettingId, key.ValidationRegex, key.Type })
            .OrderBy(x => x.Key).ToListAsync();
        return Ok(await colorAppSettingsList);
      }
    }


    [HttpPut]
    [Route("api/settings/{settingKey}")]
    public async Task<IHttpActionResult> SetConfigSetting(string settingKey, AppSetting setting)
    {
      try
      {
        var settingToUpdate = Core.ConfigurationManager.AppSettings[settingKey];

        if (settingToUpdate != null)
        {
          using (var context = new ApplicationDbContext())
          {
            Core.ConfigurationManager.AppSettings[settingKey] = setting.Value;
            context.Settings.Single(x => x.Key == settingKey).Value = string.IsNullOrEmpty(setting.Value)
                                                                           ? string.Empty
                                                                           : setting.Value;
            await context.SaveChangesAsync();
          }
        }
      }
      catch (ConfigurationErrorsException ex)
      {
        Log.Fatal("Error writing app settings - {0}", ex.Message);
      }
      return StatusCode(HttpStatusCode.NoContent);
    }

    private IHttpActionResult GetErrorResult(IdentityResult result)
    {
      if (result == null)
      {
        return InternalServerError();
      }

      if (result.Succeeded)
      {
        return null;
      }

      if (result.Errors != null)
      {
        return BadRequest(string.Join(",", result.Errors.Select(p => p.ToString(CultureInfo.InvariantCulture)).ToArray()));
      }

      if (ModelState.IsValid)
      {
        // No ModelState errors are available to send, so just return an empty BadRequest.
        return BadRequest();
      }

      return BadRequest(ModelState);
    }
  }

  public class AppSetting
  {
    public string Key { get; set; }
    public string Value { get; set; }
  }
}
