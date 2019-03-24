$("a[href='/Review']").parent().addClass("active");
$("a[href='/Review/Index']").parent().addClass("active");
var authCookie;
var cookieId;
var viewModel = kendo.observable({
  init: init,
  ActionStatuses: [],
  ActionTypes: [],
  Reasons: [],
  editorWindow: null,
  editViewModel: null
});

$(function () {
  authCookie = $.cookie(window.authCookieKeyName);
  cookieId = $('#cookieId').val();
  subscribeToActionUpdate();
  viewModel.editorWindow = $("#editorWindow").kendoWindow({
    width: 600,
    modal: true,
    visible: false,
    resizable: false
  }).data("kendoWindow");
  $.ajax({
    type: "GET",
    url: "/api/reviewData",
    beforeSend: function (req) {
      req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
    },
  }).done(function (data) {
    viewModel.set("Statuses", data.Statuses);
    viewModel.set("ActionStatuses", data.ActionStatuses);
    viewModel.set("ActionTypes", data.ActionTypes);
    viewModel.set("Reasons", data.Reasons);
    viewModel.init();
  });
});

function changeActionStatus(actionId, statusId) {
  $.ajax({
    type: "PUT",
    url: "/api/actions/" + actionId + "/status?statusId=" + statusId,
    beforeSend: function (req) {
      req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
    },
    dataType: "Json"
  }).done(function () {
    $("#reviewGrid").data("kendoGrid").dataSource.read();
  });
}

function init() {
  var grid = $("#reviewGrid").data("kendoGrid");
  if (grid) {
    //destroy the previous Grid instance
    grid.destroy();
  }
  $("#reviewGrid").kendoGrid({
    dataSource: new kendo.data.DataSource({
      type: "json",
      transport: {
        read: {
          url: "/api/actions",
          beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
          }
        }
      },
      schema: {
        data: "Data", total: "Total"
      },
      filter: { field: "ActionStatusName", operator: "eq", value: "For Review" },
      pageSize: localStorage["kendo-" + cookieId + "-ReviewGrid-pageSize" + "-" + $("#logged-username").text()] == null ? 20 : localStorage["kendo-" + cookieId + "-ReviewGrid-pageSize" + "-" + $("#logged-username").text()],
      serverPaging: true,
      serverFiltering: true,
      serverSorting: true,
      serverGrouping: false,
    }),
    filterable: {
      extra: false
    },
    sortable: false,
    pageable: {
      input: true,
      numeric: true,
      refresh: true,
      pageSizes: JSON.parse($('#pageSizes').val()),
      buttonCount: 5
    },
    columnReorder: function () {
      setTimeout(function () {
        localStorage["kendo-" + cookieId + "-ReviewGrid-options" + "-" + $("#logged-username").text()] = kendo.stringify($("#reviewGrid").data("kendoGrid").getOptions().columns);
      }, 5);
    },
    columnResize: function () {
      localStorage["kendo-" + cookieId + "-ReviewGrid-options" + "-" + $("#logged-username").text()] = kendo.stringify($("#reviewGrid").data("kendoGrid").getOptions().columns);
    },
    dataBound: function () {
      $("#reviewGrid .k-grid-content tbody tr .k-grid-Approve").each(function () {
        var currentDataItem = $("#reviewGrid").data("kendoGrid").dataItem($(this).closest("tr"));
        if (currentDataItem.ActionStatusId != 20 || $('#reviewActionsRole').val() == 'True' || $('#isReadOnly').val() === 'true') {
          $(this).hide();
        }
      });
      $("#reviewGrid .k-grid-content tbody tr .k-grid-Reject").each(function () {
        var currentDataItem = $("#reviewGrid").data("kendoGrid").dataItem($(this).closest("tr"));
        if (currentDataItem.ActionStatusId != 20 || $('#reviewActionsRole').val() == 'True' || $('#isReadOnly').val() === 'true') {
          $(this).hide();
        }
      });
      $("#reviewGrid .k-grid-content tbody tr .k-grid-Cancel").each(function () {
        var currentDataItem = $("#reviewGrid").data("kendoGrid").dataItem($(this).closest("tr") || $('#isReadOnly').val() === 'true');
        if (currentDataItem.ActionStatusId != 20 || currentDataItem.InitiatedById.toString() !== $('#currentUserId').val()) {
          $(this).hide();
        }
      });
    },
    selectable: "row",
    reorderable: true,
    resizable: true,
    height: $(document).height() - 245,
    columns: [
        {
          command: [],
          title: "&nbsp;",
          width: "130px"
        },
        { field: "ActionId", hidden: true },
        { field: "ActionStatusId", hidden: true },
        {
          field: "ActionStatusName",
          title: "Status",
          width: "100px",
          filterable: {
            dataSource: new kendo.data.DataSource({
              data: viewModel.ActionStatuses
            }),
            multi: true
          }
        },
        { field: "ScenarioName", title: resources.Tags.Scenario.Header, width: "150px" },
        { field: "AllocationName", title: resources.Tags.Allocation.Header, width: "150px" },
        { field: "MappointCode", title: resources.Tags.MapPoint.Header + " Code", width: "120px" },
        { field: "MappointName", title: resources.Tags.MapPoint.Header + " Name", width: "120px" },
        {
          field: "ActionTypeName",
          title: "Action Type",
          width: "170px",
          filterable: {
            dataSource: new kendo.data.DataSource({
              data: viewModel.ActionTypes
            }),
            multi: true
          }
        },
        { field: "OldValue", title: "Old Value", width: "100px" },
        { field: "NewValue", title: "New Value", width: "100px" },
        { field: "Reason", title: "Reason", width: "150px" }
    ]
  });
  var columns = null;
  var options = localStorage["kendo-" + cookieId + "-ReviewGrid-options" + "-" + $("#logged-username").text()];
  if (options) {
    columns = JSON.parse(options);
  }
  else {
    columns = $("#reviewGrid").data("kendoGrid").getOptions().columns;
  }
  $(columns).each(function (index) {
    if (columns[index].title === "&nbsp;") {
      columns[index].command = [
        {
          name: "Approve",
          text: "",
          title: "Approve",
          imageClass: "fa fa-check text-success",
          click: function (e) {
            var item = $("#reviewGrid").data("kendoGrid").dataItem($(e.currentTarget).closest("tr"));
            changeActionStatus(item.ActionId, 30);
          }
        },
        {
          name: "Reject",
          text: "",
          title: "Reject",
          imageClass: "fa fa-trash",
          click: function (e) {
            var item = $("#reviewGrid").data("kendoGrid").dataItem($(e.currentTarget).closest("tr"));
            changeActionStatus(item.ActionId, 40);
          }
        },
        {
          name: "Cancel",
          text: "",
          title: "Cancel",
          imageClass: "fa fa-times text-danger",
          click: function (e) {
            var item = $("#reviewGrid").data("kendoGrid").dataItem($(e.currentTarget).closest("tr"));
            changeActionStatus(item.ActionId, 50);
          }
        },
        {
          name: "Edit",
          text: "",
          title: "Edit",
          imageClass: "fa fa-pencil",
          click: function (e) {
            var item = $("#reviewGrid").data("kendoGrid").dataItem($(e.currentTarget).closest("tr"));
            var template = kendo.template($("#action-template").html());
            viewModel.editorWindow.content(template({}));
            viewModel.editorWindow.title("Edit Action");
            viewModel.editViewModel = kendo.observable({
              actionId: item.ActionId,
              actionType: item.ActionTypeName,
              actionStatusName: item.ActionStatusName,
              actionStatusId: item.ActionStatusId,
              canChangeStatus: (item.ActionStatusId === 20 && $('#reviewActionsRole').val() !== 'True'),
              canCancel: (item.ActionStatusId === 20 && item.InitiatedById.toString() === $('#currentUserId').val()),
              actionStatuses: viewModel.Statuses,
              reasons: viewModel.Reasons,
              comment: item.Comment,
              reviewedOnString: item.ReviewedOnString,
              reviewedBy: item.ReviewedBy,
              mappointName: item.MappointName,
              allocationName: item.AllocationName,
              scenarioName: item.ScenarioName,
              newValue: item.NewValue,
              oldValue: item.OldValue,
              initiatedOnString: item.InitiatedOnString,
              initiatedBy: item.InitiatedBy,
              reasonId: item.ReasonId == null ? -1 : item.ReasonId,
              changeStatusToCancel: function () {
                viewModel.editorWindow.close();
                changeActionStatus(item.ActionId, 50);
              },
              cancel: function () {
                viewModel.editorWindow.close();
              },
              submit: function () {
                window.showOverlay();
                $.ajax({
                  type: "PUT",
                  url: "/api/actions/" + viewModel.editViewModel.actionId,
                  beforeSend: function (req) {
                    req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
                  },
                  dataType: "JSON",
                  data: {
                    ActionId: viewModel.editViewModel.actionId,
                    ReasonId: viewModel.editViewModel.reasonId,
                    ActionStatusId: viewModel.editViewModel.actionStatusId,
                    Comment: viewModel.editViewModel.comment
                  }
                }).done(function () {
                  window.hideOverlay();
                  viewModel.editorWindow.close();
                  $("#reviewGrid").data("kendoGrid").dataSource.read();
                });
              }
            });
            kendo.bind($("#actionForm"), viewModel.editViewModel);
            if ($('#isReadOnly').val() === 'true') {
              $('#actionStatus').data("kendoDropDownList").readonly();
              $('#reasondropdown').data("kendoDropDownList").readonly();
            }
            viewModel.editorWindow.open().center();
          }
        }
      ];
      setGridCommandToolTips('k-grid-Approve', "Approve", "reviewGrid", index);
      setGridCommandToolTips('k-grid-Reject', "Reject", "reviewGrid", index);
      setGridCommandToolTips('k-grid-Cancel', "Cancel", "reviewGrid", index);
      setGridCommandToolTips('k-grid-Edit', "Edit", "reviewGrid", index);
      return false;
    }
  });

  $("#reviewGrid").data("kendoGrid").setOptions({
    columns: columns
  });

  $("#reviewGrid").data("kendoGrid").wrapper.children(".k-grid-pager").find("select").data("kendoDropDownList").bind("change", function (e) {
    var pageSize = e.sender.value();
    localStorage["kendo-" + cookieId + "-ReviewGrid-pageSize" + "-" + $("#logged-username").text()] = pageSize;
  });
}

function subscribeToActionUpdate() {
  // Declare a proxy to reference the hub. 
  var update = $.connection.fieldForceOnlineHub;
  update.client.actionUpdate = function () {
    $("#reviewGrid").data("kendoGrid").dataSource.read();
    return;
  };
  $.connection.hub.start().done(function () { });
}