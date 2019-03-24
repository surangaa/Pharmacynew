$("a[href='/MasterData/WorkloadTemplates']").parent().parent().parent().addClass("active");
$("a[href='/MasterData/WorkloadTemplates']").parent().addClass("active");
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
  $("#workloadTemplatesGrid").kendoGrid({
    toolbar: kendo.template($("#gridtoolbar").html()),
    dataSource: new kendo.data.DataSource({
      type: "json",
      transport: {
        read: {
          url: "/api/masterdata/workloadTemplates",
          beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
          }
        }
      },
      schema: {
        data: "Data", total: "Total",
        model: {
          id: "WorkloadTemplateId",
          fields: {
            WorkloadTemplateId: { type: 'number', editable: false },
            AvailableMinutes: { type: 'number', editable: false },
            IgnoredMinutesStart: { type: 'number', editable: false },
            IgnoredMinutesEnd: { type: 'number', editable: false },
            IgnoredKmStart: { type: 'number', editable: false },
            IgnoredKmEnd: { type: 'number', editable: false },
            Code: { type: 'string', editable: false }
          }
        }
      },
      pageSize: localStorage["kendo-" + cookieId + "-WorkloadTemplatesGrid-pageSize" + "-" + $("#logged-username").text()] == null ? 20 : localStorage["kendo-" + cookieId + "-WorkloadTemplatesGrid-pageSize" + "-" + $("#logged-username").text()],
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
        localStorage["kendo-" + cookieId + "-WorkloadTemplatesGrid-options" + "-" + $("#logged-username").text()] = kendo.stringify($("#workloadTemplatesGrid").data("kendoGrid").getOptions().columns);
      }, 5);
    },
    columnResize: function () {
      localStorage["kendo-" + cookieId + "-WorkloadTemplatesGrid-options" + "-" + $("#logged-username").text()] = kendo.stringify($("#workloadTemplatesGrid").data("kendoGrid").getOptions().columns);
    },
    height: $(document).height() - 245,
    columns: [
        {
          command: [],
          title: "&nbsp;",
          width: "95px"
        },
        { field: "WorkloadTemplateId", hidden: true },
        { field: "Code", title: resources.Tags.WorkloadTemplate.Code.Title, width: "120px" },
        { field: "AvailableMinutes", title: resources.Tags.WorkloadTemplate.AvailableMinutes.Title, width: "200px" },
        { field: "IgnoredMinutesStart", title: resources.Tags.WorkloadTemplate.IgnoredMinutesStart.Title, width: "250px" },
        { field: "IgnoredMinutesEnd", title: resources.Tags.WorkloadTemplate.IgnoredMinutesEnd.Title, width: "250px" },
        { field: "IgnoredKmStart", title: resources.Tags.WorkloadTemplate.IgnoredKmStart.Title, width: "250px" },
        { field: "IgnoredKmEnd", title: resources.Tags.WorkloadTemplate.IgnoredKmEnd.Title, width: "250px" }
    ]
  });
  var columns = null;
  var options = localStorage["kendo-" + cookieId + "-WorkloadTemplatesGrid-options" + "-" + $("#logged-username").text()];
  if (options) {
    columns = JSON.parse(options);
  }
  else {
    columns = $("#workloadTemplatesGrid").data("kendoGrid").getOptions().columns;
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
            window.confirmationWindow.content(window.windowTemplate({ message: "Are you sure you want to remove this workload template?" }));
            window.confirmationWindow.title("Remove Workload Template");
            window.confirmationWindow.open().center();
            $("#yesButton").click(function () {
              $.ajax({
                type: "DELETE",
                url: "/api/masterdata/workloadTemplates?id=" + data.id,
                beforeSend: function (req) {
                  req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
                },
                dataType: "JSON",
              }).done(function () {
                window.confirmationWindow.close();
                $("#workloadTemplatesGrid").data("kendoGrid").dataSource.read();
              });
            });
            $("#noButton").click(function () {
              window.confirmationWindow.close();
            });
          }
        }

      ];
      setGridCommandToolTips('k-grid-Edit', "Edit", "workloadTemplatesGrid", index);
      setGridCommandToolTips('k-grid-Remove', "Remove", "workloadTemplatesGrid", index);
      return false;
    }
  });
  $("#workloadTemplatesGrid").data("kendoGrid").setOptions({
    columns: columns
  });

  $("#workloadTemplatesGrid").data("kendoGrid").wrapper.children(".k-grid-pager").find("select").data("kendoDropDownList").bind("change", function (e) {
    var pageSize = e.sender.value();
    localStorage["kendo-" + cookieId + "-WorkloadTemplatesGrid-pageSize" + "-" + $("#logged-username").text()] = pageSize;
  });

  $("#addnewrecord").click(function (e) {
    e.mode = viewModel.popUpModes.add;
    showDetails(e);
  });
}

function initEditor(dataItem) {
  viewModel.editorViewModel = kendo.observable({
    workloadTemplateId: dataItem.WorkloadTemplateId,
    originalCode: dataItem.Code,
    code: dataItem.Code,
    availableMinutes: dataItem.AvailableMinutes,
    ignoredMinutesStart: dataItem.IgnoredMinutesStart,
    ignoredMinutesEnd: dataItem.IgnoredMinutesEnd,
    ignoredKmStart: dataItem.IgnoredKmStart,
    ignoredKmEnd: dataItem.IgnoredKmEnd,
    addItem: function () {
      if (viewModel.validator.validate()) {
        window.showOverlay();
        $.ajax({
          type: "POST",
          url: "/api/masterdata/workloadTemplates/save/",
          beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
          },
          dataType: "json",
          data: {
            WorkloadTemplateId: viewModel.editorViewModel.WorkloadTemplateId,
            Code: viewModel.editorViewModel.code,
            AvailableMinutes: viewModel.editorViewModel.availableMinutes,
            IgnoredMinutesStart: viewModel.editorViewModel.ignoredMinutesStart,
            IgnoredMinutesEnd: viewModel.editorViewModel.ignoredMinutesEnd,
            IgnoredKmStart: viewModel.editorViewModel.ignoredKmStart,
            IgnoredKmEnd: viewModel.editorViewModel.ignoredKmEnd
          }
        }).done(function () {
          window.hideOverlay();
          viewModel.editorWindow.close();
          $("#workloadTemplatesGrid").data("kendoGrid").dataSource.read();
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
          url: "/api/masterdata/workloadTemplates/update/" + viewModel.editorViewModel.workloadTemplateId,
          beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
          },
          dataType: "json",
          data: {
            WorkloadTemplateId: viewModel.editorViewModel.workloadTemplateId,
            Code: viewModel.editorViewModel.code,
            AvailableMinutes: viewModel.editorViewModel.availableMinutes,
            IgnoredMinutesStart: viewModel.editorViewModel.ignoredMinutesStart,
            IgnoredMinutesEnd: viewModel.editorViewModel.ignoredMinutesEnd,
            IgnoredKmStart: viewModel.editorViewModel.ignoredKmStart,
            IgnoredKmEnd: viewModel.editorViewModel.ignoredKmEnd
          }
        }).done(function () {
          window.hideOverlay();
          viewModel.editorWindow.close();
          $("#workloadTemplatesGrid").data("kendoGrid").dataSource.read();
        });
      }
    }
  });
  kendo.bind($("#editor"), viewModel.editorViewModel);
}

function showDetails(e) {
  viewModel.editorWindow.mode = e.mode;
  var template = kendo.template($("#workloadTemplate-template").html());
  switch (e.mode) {
    case viewModel.popUpModes.add:
      e.preventDefault();
      var newItem = { WorkloadTemplateId: "", Code: "", AvailableMinutes: "", IgnoredMinutesStart: "", IgnoredMinutesEnd: "", IgnoredKmStart: "", IgnoredKmEnd: "" };
      viewModel.editorWindow.content(template({}));
      viewModel.editorWindow.title("Add Workload Template");
      initEditor(newItem);
      $("#popup-save-button").hide();
      viewModel.editorWindow.open().center();
      break;
    case viewModel.popUpModes.edit:
      e.preventDefault();
      var currentItem = $("#workloadTemplatesGrid").data("kendoGrid").dataItem($(e.currentTarget).closest("tr"));
      viewModel.editorWindow.content(template({}));
      viewModel.editorWindow.title("Edit Workload Template");
      initEditor(currentItem);
      $("#popup-add-button").hide();
      viewModel.editorWindow.open().center();
      break;
  }
  viewModel.validator = $("#workloadTemplateForm").kendoValidator({
    rules: {
      availability: function (input) {
        var validate = input.data('available');

        if (typeof validate !== 'undefined' && validate !== false) {
          var id = input.attr('id');
          if (viewModel.editorViewModel.code === viewModel.editorViewModel.originalCode)
            return true;
          var cache = availability.cache[id] = availability.cache[id] || {};
          cache.checking = true;
          var settings = {
            url: '/api/masterdata/workloadTemplates/check/',
            message: 'The code is not available'
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
        var id = input.attr('id');
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
      var id = element.attr('id');
      var cache = this.cache[id] = this.cache[id] || {};
      $.ajax({
        url: settings.url + '/' + element.val(),
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
  viewModel.init();
});