$("a[href='/MasterData/Frequencies']").parent().parent().parent().addClass("active");
$("a[href='/MasterData/Frequencies']").parent().addClass("active");
var authCookie;
var viewModel = kendo.observable({
  init: init,
  editorWindow: null,
  dataGrid: null,
  frequencies: null,
  reasonTypes: null,
  validator: null,
  editorViewModel: null,
  popUpModes: { add: 1, edit: 0 }
});

function init() {
  viewModel.editorWindow = $("#editorwindow").kendoWindow({
    title: "Edit",
    modal: true,
    visible: false,
    resizable: false,
    width: 600
  }).data("kendoWindow");

  viewModel.frequencies = new kendo.data.DataSource({
    transport: {
      read: {
        dataType: "json",
        url: "/api/masterdata/frequency",
        beforeSend: function (req) {
          req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
        }
      }
    },
    pageSize: 20,
    serverPaging: false,
    serverFiltering: false,
    serverSorting: false,
    serverGrouping: false
  });

  bindGrid();
}

function bindGrid() {
  viewModel.dataGrid = $("#frequencyGrid").kendoGrid({
    dataSource: viewModel.frequencies,
    groupable: false,
    sortable: true,
    pageable: false,
    filterable: false,
    height: $(document).height() - 245,
    columns: [
      {
        field: "Id",
        hidden: true
      }, {
        field: "Value",
        title: "Frequency"
      }, {
        field: "Name",
        title: "Frequency Name"
      },
      {
        field: "IsActive",
        title: "Status",
        template: '<span class="label #= IsActive ? "label-success": "label-warning" # "style="font-size: 11px;">#= Status #</span>',
        width: "200px",
        filterable: false
      },
      {
        command: [
          {
            name: "Edit",
            text: "",
            imageClass: "fa fa-pencil",
            click: function (e) {
              e.mode = viewModel.popUpModes.edit;
              showDetails(e);
            }
          }
        ]
      }]
  });
};

function showDetails(e) {
  viewModel.editorWindow.mode = e.mode;
  var template = kendo.template($("#editor-template").html());
  switch (e.mode) {
    case viewModel.popUpModes.edit:
      e.preventDefault();
      var currentItem = $("#frequencyGrid").data("kendoGrid").dataItem($(e.currentTarget).closest("tr"));
      viewModel.editorWindow.content(template({}));
      viewModel.editorWindow.title("Edit Frequency");
      initEditor(currentItem);
      viewModel.editorWindow.open().center();
      break;
  }

  viewModel.validator = $("#editorform").kendoValidator({}).data("kendoValidator");

  function initEditor(dataItem) {
    viewModel.editorViewModel = kendo.observable({
      id: dataItem.Id,
      name: dataItem.Name,
      value: dataItem.Value,
      isActive: dataItem.IsActive,
      statuses: [{ text: "Active", value: "true" }, { text: "Inactive", value: "false" }],
      cancel: function () {
        viewModel.editorWindow.close();
      },
      saveItem: function () {
        if (viewModel.validator.validate()) {
          window.showOverlay();
          $.ajax({
            type: "PUT",
            url: "/api/masterdata/frequency/" + viewModel.editorViewModel.id,
            beforeSend: function (req) {
              req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
            },
            dataType: "json",
            data: {
              Id: viewModel.editorViewModel.id,
              Value: viewModel.editorViewModel.value,
              Name: viewModel.editorViewModel.name,
              IsActive: viewModel.editorViewModel.isActive
            }
          }).done(function () {
            window.hideOverlay();
            viewModel.editorWindow.close();
            $("#frequencyGrid").data("kendoGrid").dataSource.read();
          });
        }
      }
    });
    kendo.bind($("#editor"), viewModel.editorViewModel);
    if ($('#isReadOnly').val() === 'true') {
      $('#status').data("kendoDropDownList").readonly();
    }
  }
}

$(function () {
  authCookie = $.cookie(window.authCookieKeyName);
  viewModel.init();
  kendo.bind($("#frequencyView"), viewModel);
});