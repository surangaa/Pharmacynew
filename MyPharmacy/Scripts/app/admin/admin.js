$("a[href='/Admin']").parent().parent().parent().addClass("active");
$("a[href='/Admin']").parent().addClass("active");
var authCookie;
var usersViewModel = kendo.observable({
  init: init,
  editorWindow: null,
  dataGrid: null,
  users: [],
  groups: [],
  validator: null,
  editorViewModel: null,
  createUser: function (e) {
    e.preventDefault();
    usersViewModel.editorWindow.mode = e.mode;
    var template = kendo.template($("#editor-template").html());
    usersViewModel.editorWindow.content(template(usersViewModel.users));
    usersViewModel.editorWindow.title("Add");
    usersViewModel.editorViewModel = kendo.observable({
      current: false,
      id: "",
      name: "",
      email: "",
      oldEmail: "",
      oldName: "",
      password: "",
      confirmpassword: "",
      idvisibile: "none",
      isErrorVisible: false,
      parentId: -1,
      fullName: "",
      suburb: "",
      suburbX: "",
      suburbY: "",
      users: usersViewModel.users,
      errorMessage: "",
      groups: usersViewModel.groups,
      isEditMode: false,
      selectedGroups: [],
      cancel: function (ev) {
        ev.preventDefault();
        usersViewModel.editorWindow.close();
      },
      saveItem: function (ev) {
        ev.preventDefault();
        if (usersViewModel.validator.validate()) {
          window.showOverlay();
          $.ajax({
            type: "POST",
            url: "/api/user/create",
            beforeSend: function (req) {
              req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
            },
            dataType: "Json",
            data: {
              UserName: usersViewModel.editorViewModel.name,
              Email: usersViewModel.editorViewModel.email,
              FullName: usersViewModel.editorViewModel.fullName,
              Password: usersViewModel.editorViewModel.password,
              ParentUserId: usersViewModel.editorViewModel.parentId,
              Suburb: usersViewModel.editorViewModel.suburb,
              suburbX: usersViewModel.editorViewModel.suburbX,
              suburbY: usersViewModel.editorViewModel.suburbY,
              UserGroups: usersViewModel.editorViewModel.selectedGroups.toJSON()
            },
            statusCode: {
              400: function (eve) {
                window.hideOverlay();
                usersViewModel.editorViewModel.set("errorMessage", eve.responseJSON.Message);
                usersViewModel.editorViewModel.set("isErrorVisible", true);
              }
            }
          }).done(function () {
            window.hideOverlay();
            usersViewModel.editorWindow.close();
            $("#usergrid").data("kendoGrid").dataSource.read();
          });
        }
      }
    });
    kendo.bind($("#editor"), usersViewModel.editorViewModel);
    setValidator();
    usersViewModel.editorWindow.open().center();
  },
  popUpModes: { add: 1, edit: 0 }
});

function init() {
  usersViewModel.editorWindow = $("#editorwindow")
    .kendoWindow({
      title: "Edit",
      modal: true,
      visible: false,
      resizable: false,
      width: 600,
    }).data("kendoWindow");

  usersViewModel.users = new kendo.data.DataSource({
    type: "json",
    transport: {
      read: {
        url: "/api/users",
        beforeSend: function (req) {
          req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
        }
      }
    },
    pageSize: 20
  });

  $("#usergrid").kendoGrid({
    dataSource: usersViewModel.users,
    groupable: false,
    sortable: true,
    filterable: {
      extra: false
    },
    pageable: {
      refresh: true,
      pageSizes: true,
      buttonCount: 5
    },
    height: $(document).height() - 250,
    columns: [
      {
        field: "Id",
        title: "User Id",
        hidden: true
      },
      {
        command: [
          {
            name: "Edit",
            text: "",
            imageClass: "fa fa-pencil",
            click: function (e) {
              e.mode = usersViewModel.popUpModes.edit;
              showDetails(e);
            }
          }
        ], width: "55px"
      },
      {
        field: "Status",
        title: "Active/Inactive",
        template: '<span class="label #= IsLockout ? "label-warning": "label-success" # "style="font-size: 11px;">#= Status #</span>',
        width: "200px",
        filterable: {
          multi: true
        }
      },
      {
        field: "UserName",
        title: "User Name"
		},
		{
			field: "FirstName",
			title: "First Name"
		},
		{
        field: "Email",
        title: "Email"
      },
      {
        field: "ParentUserName",
        title: "Supervisor"
      },
      {
        field: "Address",
        title: "Adress"
      },
      {
        field: "UserGroups",
        title: "User Groups"
      }]
  });

  usersViewModel.groups = new kendo.data.DataSource({
    transport: {
      read: {
        url: "/api/groups",
        dataType: "json",
        beforeSend: function (req) {
          req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
        }
      }
    }
  });
}

function showDetails(e) {
  usersViewModel.editorWindow.mode = e.mode;
  var template = kendo.template($("#editor-template").html());
  switch (e.mode) {
    case usersViewModel.popUpModes.edit:
      e.preventDefault();
      var dataItem = $("#usergrid").data("kendoGrid").dataItem($(e.currentTarget).closest("tr"));
      usersViewModel.editorWindow.content(template(usersViewModel.users));
      usersViewModel.editorWindow.title("Edit");
      initEditor(dataItem);
      usersViewModel.editorWindow.open().center();
      break;
  }
}

function initEditor(dataItem) {

  $.ajax({
    url: "/api/user/" + dataItem.Id,
    dataType: "json",
    beforeSend: function (req) {
      req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
    }
  }).done(function (data) {

    usersViewModel.editorViewModel = kendo.observable({
      current: false,
      id: data.Id,
      name: data.UserName,
      fullName: data.FullName,
      email: data.Email,
      oldEmail: data.Email,
      oldName: data.UserName,
      password: "",
      parentId: data.ParentUserId,
      parentName: data.ParentName,
      suburb: data.Suburb,
      suburbX: data.SuburbX,
      suburbY: data.SuburbY,
      idvisibile: "block",
      confirmpassword: "",
      userGroups: data.UserGroups,
      groups: usersViewModel.groups,
      users: data.Supervisors,
      selectedGroups: data.Groups,
      isEditMode: true,
      statuses: [{ text: "Active", value: "true" }, { text: "Inactive", value: "false" }],
      isActive: data.IsLockout === false,
      status: data.IsLockout === false ? "Active" : "Inactive",
      statusClass: data.IsLockout === false ? "label label-success" : "label label-warning",
      cancel: function (e) {
        e.preventDefault();
        usersViewModel.editorWindow.close();
      },
      saveItem: function (e) {
        e.preventDefault();
        if (usersViewModel.validator.validate()) {
          window.showOverlay();
          $.ajax({
            type: "POST",
            url: "/api/user/edit",
            beforeSend: function (req) {
              req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
            },
            dataType: "Json",
            data: {
              Id: usersViewModel.editorViewModel.id,
              UserName: usersViewModel.editorViewModel.name,
              Email: usersViewModel.editorViewModel.email,
              FullName: usersViewModel.editorViewModel.fullName,
              NewPassword: usersViewModel.editorViewModel.password,
              ParentUserId: usersViewModel.editorViewModel.parentId,
              Suburb: usersViewModel.editorViewModel.suburb,
              suburbX: usersViewModel.editorViewModel.suburbX,
              suburbY: usersViewModel.editorViewModel.suburbY,
              IsActive: usersViewModel.editorViewModel.isActive,
              ConfirmPassword: usersViewModel.editorViewModel.confirmpassword,
              UserGroups: usersViewModel.editorViewModel.selectedGroups.toJSON()
            }
          }).done(function () {
            window.hideOverlay();
            usersViewModel.editorWindow.close();
            $("#usergrid").data("kendoGrid").dataSource.read();
          });
        }
      }
    });
    kendo.bind($("#editor"), usersViewModel.editorViewModel);
  });
  setValidator();
}

function setValidator() {
  usersViewModel.validator = $("#editorform").kendoValidator({
    rules: {
      availability: function (input) {
        var validate = input.data('available');
        if (typeof validate !== 'undefined' && validate !== false) {
          var id = input.attr('id');
          if (id = "name") {
            if (usersViewModel.editorViewModel.name === usersViewModel.editorViewModel.oldName)
              return true;
          }
          if (id = "email") {
            if (usersViewModel.editorViewModel.email === usersViewModel.editorViewModel.oldEmail)
              return true;
          }
          var cache = availability.cache[id] = availability.cache[id] || {};
          cache.checking = true;
          var settings = {
            url: input.data('url')
          };
          if (cache.value === input.val() && cache.valid) {
            // the value is available
            return true;
          }
          if (cache.value === input.val() && !cache.valid) {
            // the value is not available
            cache.checking = false;
            return false;
          }
          availability.check(input, settings);
          return false;
        }
        return true;
      },
      verifyPasswords: function (input) {
        var ret = true;
        if (input.is("[name=confirmpassword]")) {
          ret = input.val() === $("#password").val();
        }
        return ret;
      },
      passwordRequired: function (input) {
        var ret = true;
        if (input.is("[name=password]")) {
          ret = usersViewModel.editorViewModel.id !== "" || input.val() !== "";
        }
        return ret;
      },
      confirmPasswordRequired: function (input) {
        var ret = true;
        if (input.is("[name=confirmpassword]")) {
          ret = usersViewModel.editorViewModel.id !== "" || input.val() !== "";
        }
        return ret;
      }
    },

    messages: {
      availability: function (input) {
        var id = input.attr('name');
        var msg = kendo.template(input.data('availableMsg') || '');
        var cache = availability.cache[id];
        if (cache.checking) {
          return "Checking...";
        }
        else {
          return msg(input.val());
        }
      },
      verifyPasswords: "Passwords do not match!",
      passwordRequired: "Enter password",
      confirmPasswordRequired: "Enter confirm password"
    }

  }).data("kendoValidator");
  var availability = {
    cache: {},
    check: function (element, settings) {
      var id = element.attr('name');
      var cache = this.cache[id] = this.cache[id] || {};
      $.ajax({
        url: settings.url + '/' + element.val(),
        dataType: 'json',
        beforeSend: function (req) {
          req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
        },
        success: function (data) {
          cache.valid = data;
          usersViewModel.validator.validateInput(element);
        },
        failure: function () {
          cache.valid = true;
        },
        complete: function () {
          cache.value = element.val();
        }
      });
    }
  };
}

$(function () {
  authCookie = $.cookie(window.authCookieKeyName);
  usersViewModel.init();
  kendo.bind($("#manageusers"), usersViewModel);
  $("#addNew").click(function (e) {
    usersViewModel.createUser(e);
  });
});