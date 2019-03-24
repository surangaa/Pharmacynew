$("a[href='/Admin/UserGroups']").parent().parent().parent().addClass("active");
$("a[href='/Admin/UserGroups']").parent().addClass("active");
var authCookie;
var userGroupsViewModel = kendo.observable({
  init: init,
  editorWindow: null,
  dataGrid: null,
  groups: [],
  roles: [],
  validator: null,
  editorViewModel: null,
  createGroup: function (e) {
    e.preventDefault();
    userGroupsViewModel.editorWindow.mode = e.mode;
    var template = kendo.template($("#editor-template").html());
    userGroupsViewModel.editorWindow.content(template(userGroupsViewModel.groups));
    userGroupsViewModel.editorWindow.title("Add");
    userGroupsViewModel.editorViewModel = kendo.observable({
      current: false,
      id: "",
      name: "",
      idvisibile: "none",
      roles: userGroupsViewModel.roles,
      selectedRoles: [],
      cancel: function (ev) {
        ev.preventDefault();
        userGroupsViewModel.editorWindow.close();
      },
      saveItem: function (ev) {
        ev.preventDefault();
        if (userGroupsViewModel.validator.validate()) {
          window.showOverlay();
          $.ajax({
            type: "POST",
            url: "/api/group/create",
            beforeSend: function (req) {
              req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
            },
            dataType: "Json",
            data: {
              Name: userGroupsViewModel.editorViewModel.name,
              UserRoles: userGroupsViewModel.editorViewModel.selectedRoles.toJSON()
            }
          }).done(function () {
            window.hideOverlay();
            userGroupsViewModel.editorWindow.close();
            $("#groupGrid").data("kendoGrid").dataSource.read();
          });
        }
      }
    });
    kendo.bind($("#editor"), userGroupsViewModel.editorViewModel);
    setValidator();
    userGroupsViewModel.editorWindow.open().center();
  },
  popUpModes: { add: 1, edit: 0 }
});

function init() {
  userGroupsViewModel.editorWindow = $("#editorwindow")
                     .kendoWindow({
                       title: "Edit",
                       modal: true,
                       visible: false,
                       resizable: false,
                       width: 600,
                     }).data("kendoWindow");

  $("#groupGrid").kendoGrid({
    toolbar: kendo.template($("#gridtoolbar").html()),
    dataSource: {
      type: "json",
      transport: {
        read: {
          url: "/api/groups",
          beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
          }
        }
      },
      pageSize: 20
    },
    dataBound: function () {
      $("#groupGrid .k-grid-content tbody tr .k-grid-Delete").each(function () {
        var currentDataItem = $("#groupGrid").data("kendoGrid").dataItem($(this).closest("tr"));

        //Check in the current dataItem if the row is deletable
        if (currentDataItem.CanDelete == false) {
          $(this).hide();
        }
      });
    },
    groupable: false,
    height: $(document).height() - 245,
    sortable: true,
    pageable: {
      refresh: true,
      pageSizes: true,
      buttonCount: 5
    },
    columns: [{
      field: "Id",
      title: "Group Id",
      hidden: true
    }, {
      field: "Name",
      title: "Group Name"
    }, {
      command: [
        {
          name: "Edit",
          text: "",
          imageClass: "glyphicon glyphicon-pencil",
          click: function (e) {
            e.mode = userGroupsViewModel.popUpModes.edit;
            showDetails(e);
          }
        },
        {
          name: "Delete",
          text: "",
          imageClass: "glyphicon glyphicon-trash",
          click: function (e) {
            var tr = $(e.target).closest("tr"); //get the row for deletion
            var data = this.dataItem(tr);
            if (confirm("Are you sure you want to delete?") == true) {
              $.ajax({
                type: "DELETE",
                url: "/api/group/delete/" + data.GroupId,
                dataType: "JSON",
                beforeSend: function (req) {
                  req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
                },
              }).done(function () {
                $("#groupGrid").data("kendoGrid").dataSource.read();
              });
            }
          }
        }
      ]
    }]
  });

  userGroupsViewModel.roles = new kendo.data.DataSource({
    transport: {
      read: {
        url: "/api/roles",
        dataType: "json",
        beforeSend: function (req) {
          req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
        }
      }
    }
  });
}

function showDetails(e) {
  userGroupsViewModel.editorWindow.mode = e.mode;
  var template = kendo.template($("#editor-template").html());
  switch (e.mode) {
    case userGroupsViewModel.popUpModes.edit:
      e.preventDefault();
      var dataItem = $("#groupGrid").data("kendoGrid").dataItem($(e.currentTarget).closest("tr"));
      userGroupsViewModel.editorWindow.content(template(userGroupsViewModel.groups));
      userGroupsViewModel.editorWindow.title("Edit");
      initEditor(dataItem);
      userGroupsViewModel.editorWindow.open().center();
      break;
  }
}

function initEditor(dataItem) {
  $.ajax({
    url: "/api/group/" + dataItem.GroupId,
    dataType: "json",
    beforeSend: function (req) {
      req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
    }
  }).done(function (data) {
    userGroupsViewModel.editorViewModel = kendo.observable({
      current: false,
      id: data.GroupId,
      name: data.Name,
      oldname: data.Name,
      idvisibile: "block",
      roles: userGroupsViewModel.roles,
      selectedRoles: data.Roles,
      groupRoles:data.GroupRoles,
      cancel: function (e) {
        e.preventDefault();
        userGroupsViewModel.editorWindow.close();
      },
      saveItem: function (e) {
        e.preventDefault();
        if (userGroupsViewModel.validator.validate()) {
          window.showOverlay();
          $.ajax({
            type: "PUT",
            url: "/api/group/edit/" + userGroupsViewModel.editorViewModel.id,
            beforeSend: function (req) {
              req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
            },
            dataType: "Json",
            data: {
              Id: userGroupsViewModel.editorViewModel.id,
              Name: userGroupsViewModel.editorViewModel.name,
              UserRoles: userGroupsViewModel.editorViewModel.selectedRoles.toJSON()
            }
          }).done(function () {
            window.hideOverlay();
            userGroupsViewModel.editorWindow.close();
            $("#groupGrid").data("kendoGrid").dataSource.read();
          });
        }
      }
    });
    kendo.bind($("#editor"), userGroupsViewModel.editorViewModel);
  });
  setValidator();
}

function setValidator() {
  userGroupsViewModel.validator = $("#editorform").kendoValidator({

    rules: {
      availability: function (input) {
        var validate = input.data('available');

        if (typeof validate !== 'undefined' && validate !== false) {
          var id = input.attr('id');
          if (userGroupsViewModel.editorViewModel.name === userGroupsViewModel.editorViewModel.oldname)
            return true;
          var cache = availability.cache[id] = availability.cache[id] || {};
          cache.checking = true;
          var settings = {
            url: '/api/group/check/'
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
      }
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
          userGroupsViewModel.validator.validateInput(element);
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
  userGroupsViewModel.init();
  kendo.bind($("#manageGroups"), userGroupsViewModel);
});