$("a[href='/Admin/Settings']").parent().parent().parent().addClass("active");
$("a[href='/Admin/Settings']").parent().addClass("active");
var authCookie;
var settingsViewModel = kendo.observable({
  init: init,
  editorWindow: null,
  colorEditorwindow: null,
  dataGrid: null,
  validator: null
});

function init() {
  settingsViewModel.editorWindow = $("#editorwindow")
                     .kendoWindow({
                       title: "Edit",
                       modal: true,
                       visible: false,
                       resizable: false,
                       width: 600,
                     }).data("kendoWindow");

  $("#settingsGrid").kendoGrid({
    dataSource: {
      type: "json",
      schema: {
        model: {
          id: "Key",
          fields: {
            Key: { type: "string", editable: false },
            Value: { type: "string" },
            Description: { type: "string", editable: false },
            Type: { type: "string", editable: false },
            ValidationRegex: { type: "string", editable: false },
            CssClass: { type: "string", editable: false }
          }
        }
      },
      transport: {
        read: {
          url: "/api/settings",
          beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
          }
        },
        update: {
          url: function (data) {
            return "/api/appsettings/" + data.Key;
          },
          dataType: "json",
          type: "PUT",
          beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
          },
          complete: function () {
            $("#settingsGrid").data("kendoGrid").dataSource.read();
          }
        }
      }
    },
    groupable: false,
    height: $(document).height() - 245,
    sortable: true,
    pageable: false,
    columns: [{
      field: "Key",
      title: "Key",
      width: "200px"
    }, {
      field: "Value",
      title: "Value"
    },
    {
      field: "Description",
      title: "Description"
    },
    {
      command: [
        {
          name: "Edit",
          text: "",
          imageClass: "glyphicon glyphicon-pencil",
          click: function (e) {
            showDetails(e);
          }
        }
      ], width: "200px"
    }]
  });

  settingsViewModel.colorEditorwindow = $("#colorEditorwindow")
                    .kendoWindow({
                      title: "Edit",
                      modal: true,
                      visible: false,
                      resizable: false,
                      width: 600,
                    }).data("kendoWindow");

  $("#colorSettingsGrid").kendoGrid({
    dataSource: {
      type: "json",
      schema: {
        model: {
          id: "Key",
          fields: {
            Key: { type: "string", editable: false },
            Value: { type: "string" },
            Description: { type: "string", editable: false },
            Type: { type: "string", editable: false },
            ValidationRegex: { type: "string", editable: false },
            CssClass: { type: "string", editable: false }
          }
        }
      },
      transport: {
        read: {
          url: "/api/colors",
          beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
          }
        },
        update: {
          url: function (data) {
            return "/api/appsettings/" + data.Key;
          },
          dataType: "json",
          type: "PUT",
          beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
          },
          complete: function () {
            $("#colorSettingsGrid").data("kendoGrid").dataSource.read();
          }
        }
      }
    },
    groupable: false,
    height: $(document).height() - 245,
    sortable: true,
    pageable: false,
    columns: [{
      field: "Key",
      title: "Key",
      width: "200px"
    }, {
      field: "Color",
      title: "Value"
    },
    {
      field: "Description",
      title: "Description"
    },
    {
      command: [
        {
          name: "Edit",
          text: "",
          imageClass: "glyphicon glyphicon-pencil",
          click: function (e) {
            showColorDetails(e);
          }
        }
      ], width: "200px"
    }],
    rowTemplate: '<tr role="row"><td role="gridcell">#: Key #</td><td role="gridcell"><div style="width: 40px; height: 20px; background: #: Value #;"></div></td><td role="gridcell">#:Description #</td><td role="gridcell"><a class="k-button k-button-icontext k-grid-Edit" href=""><span class=" glyphicon glyphicon-pencil"></span></a></td></tr>'
  });
}

function showDetails(e) {
  var template = kendo.template($("#editor-template").html());
  e.preventDefault();
  var dataItem = $("#settingsGrid").data("kendoGrid").dataItem($(e.currentTarget).closest("tr"));
  settingsViewModel.editorWindow.content(template(settingsViewModel));
  settingsViewModel.editorWindow.title("Edit Setting");
  initEditor(dataItem);
  settingsViewModel.editorWindow.open().center();
}

function showColorDetails(e) {
  var template = kendo.template($("#color-editor-template").html());
  e.preventDefault();
  var dataItem = $("#colorSettingsGrid").data("kendoGrid").dataItem($(e.currentTarget).closest("tr"));
  settingsViewModel.colorEditorwindow.content(template(settingsViewModel));
  settingsViewModel.colorEditorwindow.title("Edit Setting");
  initColorEditor(dataItem);
  settingsViewModel.colorEditorwindow.open().center();
}

function initEditor(data) {

  settingsViewModel.editorViewModel = kendo.observable({
    current: false,
    id: data.id,
    infoVisible: (data.Description === null || data.Description.length === 0) ? true : false,
    key: data.Key,
    value: data.Value,
    checkboxChecked: (data.Value === "true") ? true : false,
    cssClass: data.CssClass,
    description: data.Description,
    type: data.Type === undefined ? "text" : data.Type,
    validationRegex: data.ValidationRegex,
    idvisibile: "block",
    cancel: function (e) {
      e.preventDefault();
      settingsViewModel.editorWindow.close();
    },
    saveItem: function (e) {
      if (data.Type === "checkbox") {
        settingsViewModel.editorViewModel.set("value", settingsViewModel.editorViewModel.checkboxChecked);
      }
      e.preventDefault();
      if (settingsViewModel.validator.validate()) {
        $.ajax({
          type: "PUT",
          url: "/api/settings/" + data.Key,
          beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
          },
          dataType: "Json",
          data: {
            Key: settingsViewModel.editorViewModel.key,
            Value: settingsViewModel.editorViewModel.value
          }
        }).done(function () {
          settingsViewModel.editorWindow.close();
          $("#settingsGrid").data("kendoGrid").dataSource.read();
        });
      }
    }
  });




  kendo.bind($("#editor"), settingsViewModel.editorViewModel);
  setValidator();
}

function initColorEditor(data) {

  settingsViewModel.colorEditorViewModel = kendo.observable({
    current: false,
    id: data.id,
    infoVisible: (data.Description === null || data.Description.length === 0) ? true : false,
    key: data.Key,
    value: data.Value,
    checkboxChecked: (data.Value === "true") ? true : false,
    cssClass: data.CssClass,
    description: data.Description,
    type: data.Type === undefined ? "text" : data.Type,
    validationRegex: data.ValidationRegex,
    idvisibile: "block",
    cancel: function (e) {
      e.preventDefault();
      settingsViewModel.colorEditorwindow.close();
    },
    saveItem: function (e) {
      if (data.Type === "checkbox") {
        settingsViewModel.colorEditorViewModel.set("value", settingsViewModel.colorEditorViewModel.checkboxChecked);
      }
      e.preventDefault();

      $.ajax({
        type: "PUT",
        url: "/api/settings/" + data.Key,
        beforeSend: function (req) {
          req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
        },
        dataType: "Json",
        data: {
          Key: settingsViewModel.colorEditorViewModel.key,
          Value: settingsViewModel.colorEditorViewModel.value
        }
      }).done(function () {
        settingsViewModel.colorEditorwindow.close();
        $("#colorSettingsGrid").data("kendoGrid").dataSource.read();
      });
    }
  });
  kendo.bind($("#colorEditor"), settingsViewModel.colorEditorViewModel);
}

function setValidator() {
  settingsViewModel.validator = $("#editorform").kendoValidator({
    rules: {
      custom: function (input) {
        if (input.is("[name=value]")) {
          var regEx = new RegExp(input[0].pattern);

          if (regEx.test(input.val())) {

          } else {
            return false;
          }
        }
        return true;
      }
    }
  }).data("kendoValidator");
}


function getMessage(input) {
  return input.data("message");
}

$(function () {
  authCookie = $.cookie(window.authCookieKeyName);
  settingsViewModel.init();
  kendo.bind($("#manageSettings"), settingsViewModel);
});