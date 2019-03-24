$("a[href='/Import']").parent().addClass("active");
var authCookie = $.cookie(window.authCookieKeyName);
$(function () {
  initializeUpload();
});

function initializeUpload() {
  var validateUrl = "api/import/";
  var upload = $("#import").data("kendoUpload");
  if (upload == null) {
    $("#import").kendoUpload({
      async: {
        saveUrl: validateUrl,
        autoUpload: true,
        batch: true
      },
      localization: {
        select: "Import Files",
        headerStatusUploading: "Updating"
      },
      select: function () {
        if ($(".k-upload-files.k-reset").find("li").length > 0) {
          $(".k-upload-files.k-reset").find("li").remove();
        }
      },
      upload: function (e) {
        $("#import").data("kendoUpload").disable();
        $("#importView").loader();
        var xhr = e.XMLHttpRequest;
        var canSet = true;
        if (xhr) {
          xhr.addEventListener("readystatechange", function () {
            if (xhr.readyState == 1 /* OPENED */) {
              if (canSet) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + authCookie);
                canSet = false;
              }
            }
          });
        }
      },
      error: function (e) {
        var xhr = e.XMLHttpRequest;
        var errorMessage = "";
        // ReSharper disable UseOfImplicitGlobalInFunctionScope
        if (typeof InstallTrigger !== 'undefined') {
          // ReSharper restore UseOfImplicitGlobalInFunctionScope
          var xml = $.parseXML(xhr.responseText),
            $xml = $(xml),
            $test = $xml.find('Message');
          errorMessage = $test.text();
        } else {
          var data = $.parseJSON(xhr.responseText);
          errorMessage = data['Message'];
        }
        $('.k-warning').prop('title', errorMessage);
        $("#import").data("kendoUpload").enable();
        $.loader.close();
        if (xhr.status === 422) {
          window.confirmationWindow.content(window.windowTemplate({ message: "Same contracts already exists. Do you want to replace them?" }));
          window.confirmationWindow.title("Import Files");
          window.confirmationWindow.open().center();
          $("#yesButton").click(function () {
            window.confirmationWindow.close();
            e.sender.options.async.saveUrl = "/api/import?validate=false";
            setTimeout(function () {
              $(".k-file .k-icon").addClass("k-retry").click();
            }, 500);
          });
          $("#noButton").click(function () {
            window.confirmationWindow.close();
          });
          return;
        }
        window.messageWindow.content(window.messageWindowTemplate({ message: errorMessage }));
        window.messageWindow.title("Import Files");
        var factor = Math.floor(errorMessage.length / 50);
        window.messageWindow.setOptions({
          height: 125 + (factor * 20)
        });
        window.messageWindow.open().center();
        $("#okButton").click(function () {
          window.messageWindow.close();
        });
      },
      success: function (e) {
        $("#import").data("kendoUpload").enable();
        $.loader.close();
        if (e.response.length > 0) {
          $('#summaryWindow').kendoWindow({
            width: "600px",
            title: "Import Summary",
            modal: true
          }).data("kendoWindow").center().open();
          $("#summaryContent ul").empty();
          $.each(e.response, function (key, value) {
            $("#summaryContent ul").append('<li>' + value + '</li>');
          });
        }
      },
    });
  } else {
    $("#import").data("kendoUpload").options.async.saveUrl = validateUrl;
  }
}