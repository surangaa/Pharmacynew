$("a[href='/MasterData/Reasons']").parent().parent().parent().addClass("active");
$("a[href='/MasterData/Reasons']").parent().addClass("active");
var authCookie;
var viewModel = kendo.observable({
  init: init,
  editorWindow: null,
  dataGrid: null,
  reasons: null,
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

  viewModel.reasons = new kendo.data.DataSource({
    transport: {
      read: {
        dataType: "json",
        url: "/api/masterdata/reasons",
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
        id: "ReasonId",
        fields: {
          ReasonId: { editable: false, nullable: false, defaultValue: 0 },
          Code: { editable: true, validation: { required: true } },
          Name: { editable: true, validation: { required: true } }
        }
      }
    },
    pageSize: 20
  });

  viewModel.reasonTypes = new kendo.data.DataSource({
    transport: {
      read: {
        url: "/api/masterdata/reasontypes",
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
};

function bindGrid() {
  viewModel.dataGrid = $("#reasonGrid").kendoGrid({
    toolbar: kendo.template($("#gridtoolbar").html()),
    dataSource: viewModel.reasons,
    groupable: false,
    sortable: true,
    pageable: {
      refresh: true,
      pageSizes: true,
      buttonCount: 5
    },
    height: $(document).height() - 245,
    columns: [{
      field: "ReasonId",
      hidden: true
    }, {
      field: "Code",
      title: "Reason Code"
    }, {
      field: "Name",
      title: "Reason Name"
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
      var newItem = { ReasonId: "", Code: "" };
      viewModel.editorWindow.content(template(viewModel.reasons));
      viewModel.editorWindow.title("Add Reason");
      initEditor(newItem);
      $("#popup-save-button").hide();
      viewModel.editorWindow.open().center();
      break;
    case viewModel.popUpModes.edit:
      e.preventDefault();
      var currentItem = $("#reasonGrid").data("kendoGrid").dataItem($(e.currentTarget).closest("tr"));
      viewModel.editorWindow.content(template(viewModel.reasons));
      viewModel.editorWindow.title("Edit Reason");
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
            url: '/api/masterdata/reasons/check/',
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
    viewModel.editorViewModel = kendo.observable({
      current: false,
      reasonId: dataItem.ReasonId,
      code: dataItem.Code,
      originalCode: dataItem.Code,
      name: dataItem.Name,
      reasonTypes: viewModel.reasonTypes,
      selectedReasonTypes: dataItem.ReasonTypes,
      types: dataItem.Types,
      addItem: function () {
        if (viewModel.validator.validate()) {
          window.showOverlay();
          $.ajax({
            type: "POST",
            url: "/api/masterdata/reasons/save",
            beforeSend: function (req) {
              req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
            },
            dataType: "json",
            data: { ReasonId: viewModel.editorViewModel.reasonId, Code: viewModel.editorViewModel.code, Name: viewModel.editorViewModel.name, ReasonTypesStrings: viewModel.editorViewModel.selectedReasonTypes.toJSON() }
          }).done(function () {
            window.hideOverlay();
            viewModel.editorWindow.close();
            $("#reasonGrid").data("kendoGrid").dataSource.read();
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
            url: "/api/masterdata/reasons/update/" + viewModel.editorViewModel.reasonId,
            beforeSend: function (req) {
              req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
            },
            dataType: "json",
            data: { ReasonId: viewModel.editorViewModel.reasonId, Code: viewModel.editorViewModel.code, Name: viewModel.editorViewModel.name, ReasonTypesStrings: viewModel.editorViewModel.selectedReasonTypes.toJSON() }
          }).done(function () {
            window.hideOverlay();
            viewModel.editorWindow.close();
            $("#reasonGrid").data("kendoGrid").dataSource.read();
          });
        }
      }
    });
    kendo.bind($("#editor"), viewModel.editorViewModel);
    if ($('#isReadOnly').val() === 'true') {
      $('#type').data("kendoMultiSelect").readonly();
    }
  }
}

$(function () {
  authCookie = $.cookie(window.authCookieKeyName);
  viewModel.init();
  kendo.bind($("#managereasons"), viewModel);
});