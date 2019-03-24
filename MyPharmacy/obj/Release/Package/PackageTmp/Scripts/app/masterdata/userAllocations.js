$("a[href='/MasterData/UserAllocations']").parent().parent().parent().addClass("active");
$("a[href='/MasterData/UserAllocations']").parent().addClass("active");
var authCookie;
var cookieId;
var viewModel = kendo.observable({
  editorWindow: null,
  editViewModel: null,
  validator: null,
  popUpModes: { add: 1, edit: 0 },
  init: init,
  allocations: [],
  users: [],
  scenarios: []
});

function init() {
  $("#allocationsGrid").kendoGrid({
    toolbar: kendo.template($("#gridtoolbar").html()),
    dataSource: new kendo.data.DataSource({
      type: "json",
      transport: {
        read: {
          url: "/api/masterdata/userAllocations",
          beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
          }
        },
        update: {
          url: "/api/masterdata/userAllocations/update",
          dataType: "json",
          type: "PUT",
          contentType: 'application/json',
          beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
          }
        },
      },
      schema: {
        data: "Data", total: "Total",
        model: {
          id: "Id",
          fields: {
            UserId: { type: 'number', editable: false },
            AllocationId: { type: 'number', editable: false },
            ScenarioId: { type: 'number', editable: false },
            AllocationName: { type: 'string', editable: false },
            ScenarioName: { type: 'string', editable: false },
            UserName: { type: 'string', editable: false }
          }
        }
      },
      pageSize: localStorage["kendo-" + cookieId + "-AllocationsGrid-pageSize" + "-" + $("#logged-username").text()] == null ? 20 : localStorage["kendo-" + cookieId + "-AllocationsGrid-pageSize" + "-" + $("#logged-username").text()],
      serverPaging: true,
      serverFiltering: true,
      serverSorting: true,
      serverGrouping: false,
    }),
    filterable: {
      extra: false
    },
    groupable: false,
    sortable: true,
    pageable: {
      refresh: true,
      pageSizes: true,
      buttonCount: 5
    },
    columnReorder: function () {
      setTimeout(function () {
        localStorage["kendo-" + cookieId + "-AllocationsGrid-options" + "-" + $("#logged-username").text()] = kendo.stringify($("#allocationsGrid").data("kendoGrid").getOptions().columns);
      }, 5);
    },
    columnResize: function () {
      localStorage["kendo-" + cookieId + "-AllocationsGrid-options" + "-" + $("#logged-username").text()] = kendo.stringify($("#allocationsGrid").data("kendoGrid").getOptions().columns);
    },
    height: $(document).height() - 245,
    dataBound: function () {
      $("#allocationsGrid .k-grid-content tbody tr .k-grid-Remove").each(function () {
        if ($('#isReadOnly').val() === 'true') {
          $(this).hide();
        }
      });
    },
    columns: [
        {
          command: [],
          title: "&nbsp;",
          width: "95px"
        },
        { field: "Id", hidden: true },
        { field: "UserName", title: "User Name", width: "250px" },
        { field: "ScenarioName", title: resources.Tags.Scenario.Header, width: "300px" },
        { field: "AllocationName", title: resources.Tags.Allocation.Header }
    ]
  });
  var columns = null;
  var options = localStorage["kendo-" + cookieId + "-AllocationsGrid-options" + "-" + $("#logged-username").text()];
  if (options) {
    columns = JSON.parse(options);
  }
  else {
    columns = $("#allocationsGrid").data("kendoGrid").getOptions().columns;
  }

  $(columns).each(function (index) {
    if (columns[index].title === "&nbsp;") {
      columns[index].command = [
        {
          name: "Edit",
          text: "",
          title: "Edit",
          imageClass: "fa fa-pencil",
          click: function (e) {
            e.mode = viewModel.popUpModes.edit;
            showDetails(e);
          },
        },
        {
          name: "Remove",
          text: "",
          title: "Remove",
          imageClass: "fa fa-trash",
          click: function (e) {
            var tr = $(e.target).closest("tr");
            var data = this.dataItem(tr);
            window.confirmationWindow.content(window.windowTemplate({ message: "Are you sure you want to remove this " + resources.Tags.Allocation.Header + "?" }));
            window.confirmationWindow.title("Remove " + resources.Tags.Allocation.Header);
            window.confirmationWindow.open().center();
            $("#yesButton").click(function () {
              $.ajax({
                type: "DELETE",
                url: "/api/user/" + data.UserId + "/allocation/" + data.AllocationId,
                beforeSend: function (req) {
                  req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
                },
                dataType: "JSON",
              }).done(function () {
                window.confirmationWindow.close();
                $("#allocationsGrid").data("kendoGrid").dataSource.read();
              });
            });
            $("#noButton").click(function () {
              window.confirmationWindow.close();
            });
          }
        }

      ];
      setGridCommandToolTips('k-grid-Edit', "Edit", "allocationsGrid", index);
      setGridCommandToolTips('k-grid-Remove', "Remove", "allocationsGrid", index);
      return false;
    }
  });
  $("#allocationsGrid").data("kendoGrid").setOptions({
    columns: columns
  });

  $("#allocationsGrid").data("kendoGrid").wrapper.children(".k-grid-pager").find("select").data("kendoDropDownList").bind("change", function (e) {
    var pageSize = e.sender.value();
    localStorage["kendo-" + cookieId + "-AllocationsGrid-pageSize" + "-" + $("#logged-username").text()] = pageSize;
  });

  $("#addnewrecord").click(function (e) {
    e.mode = viewModel.popUpModes.add;
    showDetails(e);
  });
}

function initEditor(dataItem) {
  var allocationData = _.where(viewModel.allocations, { ScenarioId: (dataItem.AllocationId == "" ? viewModel.scenarios[0].Id : dataItem.ScenarioId) });
  viewModel.editorViewModel = kendo.observable({
    selectedUserId: dataItem.UserId == "" ? viewModel.users[0].Id : dataItem.UserId,
    originalUserId: dataItem.UserId,
    originalAllocationId: dataItem.AllocationId,
    selectedScenarioId: dataItem.ScenarioId == "" ? viewModel.scenarios[0].Id : dataItem.ScenarioId,
    allocations: allocationData,
    scenarios: viewModel.scenarios,
    selectedAllocationId: dataItem.AllocationId == "" ? allocationData[0].Id : dataItem.AllocationId,
    users: viewModel.users,
    changeScenario: function () {
      var filtered = _.where(viewModel.allocations, { ScenarioId: viewModel.editorViewModel.selectedScenarioId });
      viewModel.editorViewModel.set("allocations", filtered);
      if (filtered.length > 0) {
        viewModel.editorViewModel.set("selectedAllocationId", filtered[0].Id);
      }
    },
    addItem: function () {
      if (viewModel.validator.validate()) {
        window.showOverlay();
        $.ajax({
          type: "POST",
          url: "/api/user/" + viewModel.editorViewModel.selectedUserId + "/allocation/" + viewModel.editorViewModel.selectedAllocationId,
          beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
          },
        }).done(function () {
          window.hideOverlay();
          viewModel.editorWindow.close();
          $("#allocationsGrid").data("kendoGrid").dataSource.read();
        });
      }
    },
    cancel: function () {
      viewModel.editorWindow.close();
    },
    saveItem: function () {
      if (viewModel.validator.validate()) {
        window.showOverlay();
        $.ajax({
          type: "PUT",
          url: "/api/user/" + viewModel.editorViewModel.selectedUserId + "/allocation/" + viewModel.editorViewModel.selectedAllocationId + "?currentAllocationId=" + viewModel.editorViewModel.originalAllocationId,
          beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
          },
        }).done(function () {
          window.hideOverlay();
          viewModel.editorWindow.close();
          $("#allocationsGrid").data("kendoGrid").dataSource.read();
        });
      }
    }
  });
  kendo.bind($("#editor"), viewModel.editorViewModel);
}

function showDetails(e) {
  viewModel.editorWindow.mode = e.mode;
  var template = kendo.template($("#userAllocations-template").html());
  switch (e.mode) {
    case viewModel.popUpModes.add:
      e.preventDefault();
      var newItem = { AllocationId: "", UserId: "", ScenarioId: "" };
      viewModel.editorWindow.content(template({}));
      viewModel.editorWindow.title("Add User " + resources.Tags.Allocation.Header);
      initEditor(newItem);
      $("#popup-save-button").hide();
      viewModel.editorWindow.open().center();
      break;
    case viewModel.popUpModes.edit:
      e.preventDefault();
      var currentItem = $("#allocationsGrid").data("kendoGrid").dataItem($(e.currentTarget).closest("tr"));
      viewModel.editorWindow.content(template({}));
      viewModel.editorWindow.title("Edit User " + resources.Tags.Allocation.Header);
      initEditor(currentItem);
      $("#popup-add-button").hide();
      viewModel.editorWindow.open().center();
      break;
  }
  viewModel.validator = $("#userAllocationForm").kendoValidator({
    rules: {
      unique: function (input) {
        var validate = input.data('unique');
        if (typeof validate !== 'undefined' && validate !== false) {
          var id = input.attr('id');
          if (viewModel.editorViewModel.selectedUserId === "" || viewModel.editorViewModel.selectedAllocationId === "")
            return true;
          if (viewModel.editorViewModel.originalUserId === viewModel.editorViewModel.selectedUserId && viewModel.editorViewModel.originalAllocationId === viewModel.editorViewModel.selectedAllocationId)
            return true;
          var cache = unique.cache[id] = unique.cache[id] || {};
          cache.checking = true;
          if (cache.value === input.val() && cache.valid) {
            // the value is available
            return true;
          }
          if (cache.value === input.val() && !cache.valid) {
            // the value is not available
            cache.checking = false;
            return false;
          }
          unique.check(input);
          cache.value = "";
          return false;
        }
        return true;
      },
      validateUser: function (input) {
        if (input.is("[name=user]")) {
          if (typeof unique.cache["unique"] !== 'undefined') {
            unique.cache["unique"].value = input.val();
          }
          viewModel.validator.validateInput($("input[name=unique]"));
        }
        return true;
      },
      validateScenario: function (input) {
        if (input.is("[name=scenario]")) {
          if ($(input).data("kendoComboBox").selectedIndex == -1) {
            return false;
          }
        }
        return true;
      },
      validateAllocation: function (input) {
        if (input.is("[name=allocation]")) {
          if (typeof unique.cache["unique"] !== 'undefined') {
            unique.cache["unique"].value = input.val();
          }
          viewModel.validator.validateInput($("input[name=unique]"));
        }
        return true;
      },
    },
    messages: {
      validateScenario: "Select a valid " + resources.Tags.Scenario.Header,
      validateUser: "Select user",
      validateAllocation: "Select " + resources.Tags.Allocation.Header,
      unique: function (input) {
        var id = input.attr('id');
        var cache = unique.cache[id];
        if (cache.checking) {
          return "Checking...";
        }
        else {
          return "User is already allocated";
        }
      }
    }
  }).data("kendoValidator");

  var unique = {
    cache: {},
    check: function (element) {
      var id = element.attr('id');
      var cache = this.cache[id] = this.cache[id] || {};
      $.ajax({
        url: '/api/user/' + viewModel.editorViewModel.selectedUserId + '/allocation/' + viewModel.editorViewModel.selectedAllocationId + "/unique",
        dataType: 'json',
        beforeSend: function (req) {
          req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
        },
        success: function (data) {
          cache.valid = data;
          viewModel.validator.validateInput(element);
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
  if ($('#isReadOnly').val() === 'true') {
    $('#user').data("kendoDropDownList").readonly();
    $('#scenario').data("kendoComboBox").readonly();
    $('#allocation').data("kendoDropDownList").readonly();
  }
}

$(function () {
  authCookie = $.cookie(window.authCookieKeyName);
  cookieId = $('#cookieId').val();
  viewModel.editorWindow = $("#editorWindow").kendoWindow({
    modal: true,
    visible: false,
    resizable: false,
    width: 600
  }).data("kendoWindow");
  $.ajax({
    type: "GET",
    url: "/api/userAllocations/data",
    beforeSend: function (req) {
      req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
    },
  }).done(function (data) {
    viewModel.set("allocations", data.Allocations);
    viewModel.set("users", data.Users);
    viewModel.set("scenarios", data.Scenarios);
    viewModel.init();
  });
});