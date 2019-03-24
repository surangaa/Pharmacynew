$("a[href='/MasterData/MapPointTypes']").parent().parent().parent().addClass("active");
$("a[href='/MasterData/MapPointTypes']").parent().addClass("active");
var authCookie;
var viewModel = kendo.observable({
  init: init,
  editorWindow: null,
  dataGrid: null,
  mapPointTypes: null,
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

  viewModel.mapPointTypes = new kendo.data.DataSource({
    transport: {
      read: {
        dataType: "json",
        url: "/api/masterdata/mappointtypes",
        beforeSend: function (req) {
          req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
        }
      },
      parameterMap: function (data) {
        return kendo.stringify(data);
      }
    },
    schema: {
      data: function (data) {
        return data || [];
      },
      model: {
        id: "MapPointTypeId",
        fields: {
          MapPointTypeId: { editable: false, nullable: false, defaultValue: 0 },
          Name: { editable: true, validation: { required: true } },
          VisitTimes: { editable: true }
        }
      }
    },
    pageSize: 20
  });

  bindGrid();

  $("#addnewrecord").click(function (e) {
    e.mode = viewModel.popUpModes.add;
    showDetails(e);
  });
};

function bindGrid() {
  viewModel.dataGrid = $("#mapPointTypeGrid").kendoGrid({
    toolbar: kendo.template($("#gridtoolbar").html()),
    dataSource: viewModel.mapPointTypes,
    groupable: false,
    sortable: true,
    pageable: {
      refresh: true,
      pageSizes: true,
      buttonCount: 5
    },
    height: $(document).height() - 245,
    columns: [{
      field: "MapPointTypeId",
      hidden: true
    }, {
      field: "Name",
      title: resources.Tags.MapPointType.Name.Title
    },
    {
      field: "VisitTimes",
      title: resources.Tags.MapPointType.VisitTimes.Title
    }
    , {
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
      var newItem = { MapPointTypeId: "", Name: "", VisitTimes: "" };
      viewModel.editorWindow.content(template(viewModel.mapPointTypes));
      viewModel.editorWindow.title("Add " + $('#typeName').val());
      initEditor(newItem);
      $("#popup-save-button").hide();
      viewModel.editorWindow.open().center();
      break;
    case viewModel.popUpModes.edit:
      e.preventDefault();
      var currentItem = $("#mapPointTypeGrid").data("kendoGrid").dataItem($(e.currentTarget).closest("tr"));
      viewModel.editorWindow.content(template(viewModel.mapPointTypes));
      viewModel.editorWindow.title("Edit " + $('#typeName').val());
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
          if (viewModel.editorViewModel.name === viewModel.editorViewModel.originalName)
            return true;
          var cache = availability.cache[id] = availability.cache[id] || {};
          cache.checking = true;
          var settings = {
            url: '/api/masterdata/mappointtypes/check/',
            message: 'The name is not available'
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
    var resourceStrings = resources.Tags.MapPointType;
    viewModel.editorViewModel = kendo.observable({
      current: false,
      mapPointTypeId: dataItem.MapPointTypeId,
      name: dataItem.Name,
      nameText: resourceStrings.Name.Title,
      originalName: dataItem.Name,
      visitTimes: dataItem.VisitTimes,
      visitTimesText: resourceStrings.VisitTimes.Title,
      addItem: function () {
        if (viewModel.validator.validate()) {
          window.showOverlay();
          $.ajax({
            type: "POST",
            url: "/api/masterdata/mappointtypes/save",
            beforeSend: function (req) {
              req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
            },
            dataType: "json",
            data: { MapPointTypeId: viewModel.editorViewModel.mapPointTypeId, Name: viewModel.editorViewModel.name, VisitTimes: viewModel.editorViewModel.visitTimes }
          }).done(function () {
            window.hideOverlay();
            viewModel.editorWindow.close();
            $("#mapPointTypeGrid").data("kendoGrid").dataSource.read();
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
            url: "/api/masterdata/mappointtypes/update/" + viewModel.editorViewModel.mapPointTypeId,
            beforeSend: function (req) {
              req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
            },
            dataType: "json",
            data: { MapPointTypeId: viewModel.editorViewModel.mapPointTypeId, Name: viewModel.editorViewModel.name, VisitTimes: viewModel.editorViewModel.visitTimes }
          }).done(function () {
            window.hideOverlay();
            viewModel.editorWindow.close();
            $("#mapPointTypeGrid").data("kendoGrid").dataSource.read();
          });
        }
      }
    });
    kendo.bind($("#editor"), viewModel.editorViewModel);
  }
}

$(function () {
  authCookie = $.cookie(window.authCookieKeyName);
  viewModel.init();
  kendo.bind($("#managemappointtypes"), viewModel);
});