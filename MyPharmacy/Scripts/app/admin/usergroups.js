$("a[href='/Admin/UserGroups']").parent().parent().parent().addClass("active");
$("a[href='/Admin/UserGroups']").parent().addClass("active");
var authCookie;
var userGroupsViewModel = kendo.observable({
  init: init,
  editorWindow: null,
  dataGrid: null,
  groups: [],
  lookupData: null,
  validator: null,
  editorViewModel: null,
  createGroup: function (e) {
    e.preventDefault();
    showDetails({ GroupId: 0, Name: "", NotifyMethodId: -1, NotifyDelayDays: null, Roles: [], GroupRoles: [] });
  }
});

function init() {
  userGroupsViewModel.editorWindow = $("#editorwindow")
                     .kendoWindow({
                       title: "Edit",
                       modal: true,
                       visible: false,
                       resizable: false,
                       width: 600
                     }).data("kendoWindow");
  $.ajax({
    url: "/api/group/lookupData",
    dataType: "json",
    beforeSend: function (req) {
      req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
    }
  }).done(function (data) {
    userGroupsViewModel.lookupData = data;

    $("#groupGrid").kendoGrid({
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
      height: $(document).height() - 250,
      sortable: true,
      pageable: {
        refresh: true,
        pageSizes: true,
        buttonCount: 5
      },
      columns: [
      {
        field: "Id",
        title: "Group Id",
        hidden: true
      },
      {
        command: [
          {
            name: "Edit",
            text: "",
            imageClass: "fa fa-pencil",
            click: function (e) {
              var item = $("#groupGrid").data("kendoGrid").dataItem($(e.currentTarget).closest("tr"));
              showDetails(item);
            }
          },
          {
            name: "Delete",
            text: "",
            imageClass: "fa fa-trash",
            click: function (e) {
              e.preventDefault();
              var tr = $(e.target).closest("tr"); //get the row for deletion
              var data = this.dataItem(tr);
              window.confirmationWindow.content(window.windowTemplate({ message: "Are you sure you want to delete this user group?" }));
              window.confirmationWindow.title("Delete User Group");
              window.confirmationWindow.open().center();
              $("#yesButton").click(function () {
                $.ajax({
                  type: "DELETE",
                  url: "/api/group/delete/" + data.GroupId,
                  dataType: "JSON",
                  beforeSend: function (req) {
                    req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
                  }
                }).done(function () {
                  $("#groupGrid").data("kendoGrid").dataSource.read();
                });
                window.confirmationWindow.close();
              });
              $("#noButton").click(function () {
                window.confirmationWindow.close();
              });
            }
          }
        ], width: "95px"
      },
      {
        field: "Name",
        title: "Group Name",
        width: "250px"
      },
      {
        field: "NotifyMethod",
        title: "Notify Method",
        width: "200px"
      },
      {
        field: "NotifyDelayDays",
        title: "Notify Delay Days",
        width: "150px"
      },
      {
        title: "&nbsp;",
      }]
    });
  });
}

function showDetails(dataItem) {
  var template = kendo.template($("#editor-template").html());
  userGroupsViewModel.editorWindow.content(template({}));
  userGroupsViewModel.editorWindow.title(dataItem.GroupId == 0 ? "Add" : "Edit");
  initEditor(dataItem);
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
      id: data.GroupId,
      name: data.Name,
      actionButtonText: dataItem.GroupId == 0 ? "Create" : "Save",
      oldname: data.Name,
      showNotifyDelayDays: data.NotifyMethodId == 3,
      roles: userGroupsViewModel.lookupData.Roles,
      notifyMethods: userGroupsViewModel.lookupData.NotifyMethods,
      notifyMethod: data.NotifyMethod,
      notifyMethodId: data.NotifyMethodId,
      notifyDelayDays: data.NotifyDelayDays,
      selectedRoles: data.Roles,
      groupRoles: data.GroupRoles,
      changeNotifyMethod: function () {
        userGroupsViewModel.editorViewModel.set("showNotifyDelayDays", userGroupsViewModel.editorViewModel.notifyMethodId == 3);
        userGroupsViewModel.editorViewModel.set("notifyDelayDays", userGroupsViewModel.editorViewModel.notifyMethodId == 3 ? 0 : null);
      },
      cancel: function (e) {
        e.preventDefault();
        userGroupsViewModel.editorWindow.close();
      },
      saveItem: function (e) {
        e.preventDefault();
        if (userGroupsViewModel.validator.validate()) {
          window.showOverlay();
          $.ajax({
            type: dataItem.GroupId == 0 ? "POST" : "PUT",
            url: dataItem.GroupId == 0 ? "/api/group/create" : "/api/group/edit/" + userGroupsViewModel.editorViewModel.id,
            beforeSend: function (req) {
              req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
            },
            dataType: "Json",
            data: {
              Id: userGroupsViewModel.editorViewModel.id,
              Name: userGroupsViewModel.editorViewModel.name,
              NotifyDelayDays: userGroupsViewModel.editorViewModel.notifyDelayDays,
              NotifyMethodId: userGroupsViewModel.editorViewModel.notifyMethodId,
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
    userGroupsViewModel.editorWindow.open().center();
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
  $("#addNew").click(function (e) {
    userGroupsViewModel.createGroup(e);
  });
});