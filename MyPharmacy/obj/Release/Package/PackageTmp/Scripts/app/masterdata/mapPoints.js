$("a[href='/MasterData/MapPoints']").parent().parent().parent().addClass("active");
$("a[href='/MasterData/MapPoints']").parent().addClass("active");
var authCookie;
var cookieId;
var viewModel = kendo.observable({
  init: init,
  editorWindow: null,
  dataGrid: null,
  mapPoints: null,
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

  viewModel.mapPoints = new kendo.data.DataSource({
    transport: {
      read: {
        dataType: "json",
        url: "/api/masterdata/mappoints",
        beforeSend: function (req) {
          req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
        }
      }
    },
    schema: {
      data: "Data",
      total: "Total"
    },
    pageSize: localStorage["kendo-" + cookieId + "-MapPointGrid-pageSize" + "-" + $("#logged-username").text()] == null ? 20 : localStorage["kendo-" + cookieId + "-MapPointGrid-pageSize" + "-" + $("#logged-username").text()],
    serverPaging: true,
    serverFiltering: true,
    serverSorting: true,
    serverGrouping: false
  });

  viewModel.mapPointTypes = new kendo.data.DataSource({
    transport: {
      read: {
        url: "/api/masterdata/mappointtypes",
        dataType: "json",
        beforeSend: function (req) {
          req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
        }
      }
    }
  });

  bindGrid();

  $("#addnewrecord").click(function (e) {
    e.mode = viewModel.popUpModes.add;
    showDetails(e);
  });

  $("#mapPointGrid").data("kendoGrid").wrapper.children(".k-grid-pager").find("select").data("kendoDropDownList").bind("change", function (e) {
    var pageSize = e.sender.value();
    localStorage["kendo-" + cookieId + "-MapPointGrid-pageSize" + "-" + $("#logged-username").text()] = pageSize;
  });
}

function bindGrid() {
  var resourceStrings = resources.Tags.MapPoint;
  viewModel.dataGrid = $("#mapPointGrid").kendoGrid({
    //toolbar: kendo.template($("#gridtoolbar").html()),
    dataSource: viewModel.mapPoints,
    groupable: false,
    sortable: true,
    pageable: {
      refresh: true,
      pageSizes: true,
      buttonCount: 5
    },
    filterable: {
      extra: false
    },
    height: $(document).height() - 245,
    columns: [
      {
        field: "MapPointId",
        hidden: true
      }, {
        field: "Code",
        title: resourceStrings.Code.Title
      }, {
        field: "Name",
        title: resourceStrings.Name.Title
      },
      {
        field: "MapPointTypeName",
        title: resourceStrings.MapPointType.Title
      },
      {
        field: "IsActive",
        title: resourceStrings.IsActive.Title,
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
    case viewModel.popUpModes.add:
      e.preventDefault();
      var newItem = {
        MapPointId: "", Code: "", MapPointTypeId: "", Name: "", Address: "", X: "", Y: "", Detail1: "", Detail2: "", Detail3: "", Detail4: "", Detail5: "", IsActive: true, AllowCallMon: "", AllowCallTue: "", AllowCallWed: "", AllowCallThu: "", AllowCallFri: "", AllowCallSat: "", AllowCallSun: ""

      };
      viewModel.editorWindow.content(template(viewModel.mapPoints));
      viewModel.editorWindow.title("Add " + resources.Tags.MapPoint.Header);
      initEditor(newItem);
      $("#popup-save-button").hide();
      viewModel.editorWindow.open().center();
      break;
    case viewModel.popUpModes.edit:
      e.preventDefault();
      var currentItem = $("#mapPointGrid").data("kendoGrid").dataItem($(e.currentTarget).closest("tr"));
      viewModel.editorWindow.content(template(viewModel.mapPoints));
      viewModel.editorWindow.title("Edit " + resources.Tags.MapPoint.Header);
      initEditor(currentItem);
      $("#popup-add-button").hide();
      viewModel.editorWindow.open().center();
      break;
  }

  viewModel.validator = $("#editorform").kendoValidator({
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
            url: '/api/masterdata/mapPoints/check/',
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

  function initEditor(dataItem) {
    var resourceStrings = resources.Tags.MapPoint;
    viewModel.editorViewModel = kendo.observable({
      current: false,
      mapPointId: dataItem.MapPointId,
      code: dataItem.Code,
      codeText: resourceStrings.Code.Title,
      originalCode: dataItem.Code,
      name: dataItem.Name,
      nameText: resourceStrings.Name.Title,
      address: dataItem.Address,
      addressText: resourceStrings.Address.Title,
      x: dataItem.X,
      xText: resourceStrings.X.Title,
      y: dataItem.Y,
      yText: resourceStrings.Y.Title,
      isActive: dataItem.IsActive,
      isActiveText: resourceStrings.IsActive.Title,
      detail1: dataItem.Detail1,
      detail1Text: resourceStrings.Detail1.Title,
      detail2: dataItem.Detail2,
      detail2Text: resourceStrings.Detail2.Title,
      detail3: dataItem.Detail3,
      detail3Text: resourceStrings.Detail3.Title,
      detail4: dataItem.Detail4,
      detail4Text: resourceStrings.Detail4.Title,
      detail5: dataItem.Detail5,
      detail5Text: resourceStrings.Detail5.Title,
      AllowCallsOnText: resourceStrings.AllowCallsOn.Title,
      allowCallMon: dataItem.AllowCallMon,
      allowCallMonText: resourceStrings.AllowCallMon.Title,
      allowCallTue: dataItem.AllowCallTue,
      allowCallTueText: resourceStrings.AllowCallTue.Title,
      allowCallWed: dataItem.AllowCallWed,
      allowCallWedText: resourceStrings.AllowCallWed.Title,
      allowCallThu: dataItem.AllowCallThu,
      allowCallThuText: resourceStrings.AllowCallThu.Title,
      allowCallFri: dataItem.AllowCallFri,
      allowCallFriText: resourceStrings.AllowCallFri.Title,
      allowCallSat: dataItem.AllowCallSat,
      allowCallSatText: resourceStrings.AllowCallSat.Title,
      allowCallSun: dataItem.AllowCallSun,
      allowCallSunText: resourceStrings.AllowCallSun.Title,
      mapPointTypes: viewModel.mapPointTypes,
      mapPointTypesText: resourceStrings.MapPointType.Title,
      selectedMapPointType: dataItem.MapPointTypeId,
      statuses: [{ text: "Active", value: "true" }, { text: "Inactive", value: "false" }],
      addItem: function () {
        if (viewModel.validator.validate()) {
          window.showOverlay();
          $.ajax({
            type: "POST",
            url: "/api/masterdata/mapPoints/save",
            beforeSend: function (req) {
              req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
            },
            dataType: "json",
            data: {
              Code: viewModel.editorViewModel.code,
              Name: viewModel.editorViewModel.name,
              Address: viewModel.editorViewModel.address,
              X: viewModel.editorViewModel.x,
              Y: viewModel.editorViewModel.y,
              IsActive: viewModel.editorViewModel.isActive,
              MapPointTypeId: viewModel.editorViewModel.selectedMapPointType,
              Detail1: viewModel.editorViewModel.detail1,
              Detail2: viewModel.editorViewModel.detail2,
              Detail3: viewModel.editorViewModel.detail3,
              Detail4: viewModel.editorViewModel.detail4,
              Detail5: viewModel.editorViewModel.detail5,
              AllowCallMon: viewModel.editorViewModel.allowCallMon,
              AllowCallTue: viewModel.editorViewModel.allowCallTue,
              AllowCallWed: viewModel.editorViewModel.allowCallWed,
              AllowCallThu: viewModel.editorViewModel.allowCallThu,
              AllowCallFri: viewModel.editorViewModel.allowCallFri,
              AllowCallSat: viewModel.editorViewModel.allowCallSat,
              AllowCallSun: viewModel.editorViewModel.allowCallSun
            }
          }).done(function () {
            window.hideOverlay();
            viewModel.editorWindow.close();
            $("#mapPointGrid").data("kendoGrid").dataSource.read();
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
            url: "/api/masterdata/mapPoints/update/" + viewModel.editorViewModel.mapPointId,
            beforeSend: function (req) {
              req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
            },
            dataType: "json",
            data: {
              MapPointId: viewModel.editorViewModel.mapPointId,
              Code: viewModel.editorViewModel.code,
              Name: viewModel.editorViewModel.name,
              Address: viewModel.editorViewModel.address,
              X: viewModel.editorViewModel.x,
              Y: viewModel.editorViewModel.y,
              IsActive: viewModel.editorViewModel.isActive,
              MapPointTypeId: viewModel.editorViewModel.selectedMapPointType,
              Detail1: viewModel.editorViewModel.detail1,
              Detail2: viewModel.editorViewModel.detail2,
              Detail3: viewModel.editorViewModel.detail3,
              Detail4: viewModel.editorViewModel.detail4,
              Detail5: viewModel.editorViewModel.detail5,
              AllowCallMon: viewModel.editorViewModel.allowCallMon,
              AllowCallTue: viewModel.editorViewModel.allowCallTue,
              AllowCallWed: viewModel.editorViewModel.allowCallWed,
              AllowCallThu: viewModel.editorViewModel.allowCallThu,
              AllowCallFri: viewModel.editorViewModel.allowCallFri,
              AllowCallSat: viewModel.editorViewModel.allowCallSat,
              AllowCallSun: viewModel.editorViewModel.allowCallSun
            }
          }).done(function () {
            window.hideOverlay();
            viewModel.editorWindow.close();
            $("#mapPointGrid").data("kendoGrid").dataSource.read();
          });
        }
      }
    });
    kendo.bind($("#editor"), viewModel.editorViewModel);

    if ($('#isReadOnly').val() === 'true') {
      $('#status').data("kendoDropDownList").readonly();
      $('#mapPointType').data("kendoDropDownList").readonly();
    }
  }
}

$(function () {
  authCookie = $.cookie(window.authCookieKeyName);
  cookieId = $('#cookieId').val();
  viewModel.init();
  kendo.bind($("#managemapPoints"), viewModel);
});