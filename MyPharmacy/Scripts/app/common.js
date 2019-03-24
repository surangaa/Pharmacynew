var authCookieKeyName;
var userInfoCookieKeyName;
function loadingElement() {
  return $("<div class='k-loading-mask'><span class='k-loading-text'>Loading...</span><div class='k-loading-image'/><div class='k-loading-color'/></div>");
}

function showOverlay() {
  $('.k-window').append(loadingElement());
}

function hideOverlay() {
  $('.k-window').find(".k-loading-mask").remove();
}

function getSelectedValue(selectionObject) {
  return selectionObject.value === null || selectionObject.value.length == 0 ? selectionObject.dataSource[0].Id : selectionObject.value;
}

function integerOnly(id) {
  $("#" + id).keypress(function (e) {
    //if the letter is not digit then display error and don't type anything
    if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
      return false;
    }
  });
}

function toTextValueArray(srcArray, nameField, valueField) {
  var textValueArray = new Array();
  if (srcArray) {
    for (var i = 0; i < srcArray.length; i++) {
      srcArray[i]['value'] = srcArray[i][valueField];
      srcArray[i]['text'] = srcArray[i][nameField];
      textValueArray.push(srcArray[i]);
    }
  }
  return textValueArray;
}

$(function () {
  var cookieId = $('#cookieId').val();
  authCookieKeyName = "auth-" + cookieId;
  userInfoCookieKeyName = "user-Info-" + cookieId;
  $("span").tooltip();
  hoverOutline();
});

function extendListBoxObject(object, callback, validator, viewModel) {
  object.splice(object.length, 0, { Id: -1, Name: "" });
  $(object).each(function (index) {
    object[index].value = this.Name,
    object[index].initialValue = this.Name,
    object[index].showLabel = true,
    object[index].controlType = "TextBox",
    object[index].showEditField = false,
    object[index].showRemoveButton = this.Name !== "",
    object[index].clickAccept = function () {
      if (validator === null || typeof validator === 'undefined') {
        callback(object[index]);
        return;
      }
      if (validator.validate()) {
        callback(object[index]);
      }
    },
    object[index].clickCancel = function () {
      object[index].set("value", object[index].get("initialValue"));
      viewToggle(object[index], false, viewModel);
    },
    object[index].clickRemove = function () {
      object.splice(index, 1);
      callback(object[index]);
    },
    object[index].edit = function (event) {
      clearPreviousEditField(event, object[index], viewModel);
      viewToggle(object[index], true, viewModel);
    };
  });
}

function extendTextBoxObject(object, callback, validator, viewModel) {
  object.initialValue = object.value,
  object.showLabel = true,
  object.controlType = "TextBox",
  object.showEditField = false,
  object.clickAccept = function () {
    if (validator === null || typeof validator === 'undefined') {
      callback(object);
      return;
    }
    if (validator.validate()) {
      callback(object);
    }
  },
  object.clickCancel = function () {
    object.set("value", object.get("initialValue"));
    viewToggle(object, false, viewModel);
  },
  object.edit = function (event) {
    clearPreviousEditField(event, object, viewModel);
    viewToggle(object, true, viewModel);
  };
}

function extendRadioGroupObject(object, callback, validator, viewModel) {
  object.questionAnswers = new kendo.data.ObservableArray([]),
  object.initialValue = object.value,
  object.showLabel = true,
  object.controlType = "Radio",
  object.showEditField = false,
  object.clickAccept = function () {
    var selectedValue = $("input[name=" + object.id + "]:checked").val();
    object.set("value", typeof selectedValue === 'undefined' ? null : selectedValue);
    if (validator === null || typeof validator === 'undefined') {
      callback(object);
      return;
    }
    if (validator.validate()) {
      callback(object);
    }
  },
    object.clickCancel = function () {
      object.questionAnswers.forEach(function (item) {
        item.set("selectedValue", object.get("initialValue"));
      });
      $("input[name=" + object.id + "]:checked").each(function () {
        $(this).prop('checked', false);
      });
      if (object.initialValue !== "") {
        $("input[name=" + object.id + "][value=" + object.initialValue + "]").prop('checked', true);
      }
      object.set("value", object.get("initialValue"));
      viewToggle(object, false, viewModel);
    },
  object.edit = function (event) {
    clearPreviousEditField(event, object, viewModel);
    viewToggle(object, true, viewModel);
  };
  object.questionAnswerText.split(',').forEach(function (value) {
    object.questionAnswers.push({ name: object.id, value: value, selectedValue: object.value });
  });
}

function extendCheckBoxObject(object, callback, validator, viewModel) {
  object.displayText = object.value == false ? "No" : "Yes";
  object.initialValue = object.value,
  object.showLabel = true,
  object.controlType = "CheckBox",
  object.showEditField = false,
  object.clickAccept = function () {
    if (validator === null || typeof validator === 'undefined') {
      callback(object);
      return;
    }
    if (validator.validate()) {
      callback(object);
    }
  },
    object.clickCancel = function () {
      object.set("value", object.get("initialValue"));
      viewToggle(object, false, viewModel);
    },
  object.edit = function (event) {
    clearPreviousEditField(event, object, viewModel);
    viewToggle(object, true, viewModel);
  };
}

function extendDateTimePickerObject(object, callback, validator, viewModel) {
  object.selectedDateTime = object.value,
  object.initialValue = object.value,
  object.showLabel = true,
  object.controlType = "DateTimePicker",
  object.showEditField = false,
  object.clickAccept = function () {
    if (validator === null || typeof validator === 'undefined') {
      callback(object);
      return;
    }
    if (validator.validate()) {
      callback(object);
    }
  },
  object.clickCancel = function () {
    object.set("value", object.get("initialValue"));
    viewToggle(object, false, viewModel);
  },
  object.edit = function (event) {
    clearPreviousEditField(event, object, viewModel);
    viewToggle(object, true, viewModel);
  },
  object.getFormattedValue = function () {
    return object.value === object.selectedDateTime ? object.value : (object.value === null || typeof object.value === 'undefined') ? null : kendo.toString(object.value, "dd/MM/yyyy hh:mm tt");
  },
  object.getTicks = function () {
    var dateTime = kendo.parseDate(object.getFormattedValue(), "dd/MM/yyyy hh:mm tt");
    return (dateTime.getTime() * 10000) + 621355968000000000;
  };
}

function extendDropDownObject(object, callback, validator, viewModel) {
  object.selectedText = findSelectedDropdownText(object),
  object.initialValue = object.value,
  object.showLabel = true,
  object.controlType = "ComboBox",
  object.showEditField = false,
  object.clickAccept = function () {
    if (validator === null || typeof validator === 'undefined') {
      callback(object);
      return;
    }
    if (validator.validate()) {
      callback(object);
    }
  },
  object.clickCancel = function () {
    object.set("value", object.get("initialValue"));
    viewToggle(object, false, viewModel);
  },
  object.edit = function (event) {
    clearPreviousEditField(event, object, viewModel);
    viewToggle(object, true, viewModel);
  };
}

function afterCompleteTransaction(object, viewModel) {
  if (object.get("controlType") === "ComboBox") {
    object.set("selectedText", findSelectedDropdownText(object));
  }
  else if (object.get("controlType") === "DateTimePicker") {
    object.set("selectedDateTime", object.getFormattedValue());
  }
  else if (object.get("controlType") === "CheckBox") {
    object.set("displayText", object.value == false ? "No" : "Yes");
  }
  object.set("initialValue", object.get("value"));
  viewToggle(object, false, viewModel);
}

function findSelectedDropdownText(object) {
  if (object.value === null || typeof object.value === 'undefined') {
    return "";
  }
  var selectedItem = _.findWhere(object.dataSource, { Id: object.value });
  if (typeof selectedItem === 'undefined') {
    return "";
  } else {
    return selectedItem[(typeof object.text === 'undefined') ? "Name" : object.text];
  }
}

function clearPreviousEditField(event, object, viewModel) {
  var currentEditFieldObject = viewModel.get("currentEditField");
  if (currentEditFieldObject !== null && typeof currentEditFieldObject !== 'undefined') {
    currentEditFieldObject.set("value", currentEditFieldObject.get("initialValue"));
    if (currentEditFieldObject.get("controlType") === "Radio") {
      currentEditFieldObject.questionAnswers.forEach(function (item) {
        item.set("selectedValue", currentEditFieldObject.get("initialValue"));
      });
      $("input[name=" + currentEditFieldObject.id + "]:checked").each(function () {
        $(this).prop('checked', false);
      });
      if (currentEditFieldObject.initialValue !== "") {
        $("input[name=" + currentEditFieldObject.id + "][value=" + currentEditFieldObject.initialValue + "]").prop('checked', true);
      }
    }
    else if (currentEditFieldObject.get("controlType") === "Signature") {
      currentEditFieldObject.object.clearCanvas();
    }
    viewToggle(currentEditFieldObject, false, viewModel);
  }
  viewModel.currentEditField = object;
}

function viewToggle(element, value, viewModel) {
  element.set("showLabel", !value);
  element.set("showEditField", value);
  if (viewModel !== null && typeof viewModel !== 'undefined') {
    viewModel.set("editMode", value);
  }
  $("span").tooltip();
  window.hoverOutline();
  outlineEmptyFields();
}

function resetEditFields(event, viewModel) {
  if (_.contains(event.target.className, "k")) {
    return;
  }
  clearPreviousEditField(event, null, viewModel);
}

function hoverOutline() {
  $(".k-hover").hover(
  function () {
    if ($(this)[0].textContent.trim() !== "") {
      $(this).addClass('span-outline');
      $(this).children().css("padding-top", 7);
    }
  }, function () {
    if ($(this)[0].textContent.trim() !== "") {
      $(this).removeClass('span-outline');
      $(this).children().css("padding-top", 10);
    }
  }
);
}

function outlineEmptyFields() {
  $(".k-hover").each(function () {
    if ($(this)[0].textContent.trim() == "") {
      $(this).addClass('span-outline');
      $(this).css("padding-bottom", 12);
    } else {
      $(this).removeClass('span-outline');
      $(this).css("padding-bottom", 0);
    }
    $(this).css("min-width", 50);
  });
}

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getOptionalFieldsInitialValue(value) {
  return value === null ? "-1" : value;
}

function getSelectedValue(selectionObject) {
  return selectionObject.value === null || selectionObject.value.length == 0 ? selectionObject.dataSource[0].Id : selectionObject.value;
}

function displayNoResultsFound(grid) {
  // Get the number of Columns in the grid
  var dataSource = grid.data("kendoGrid").dataSource;
  var colCount = grid.find('.k-grid-header colgroup > col').length;

  // If there are no results place an indicator row
  if (dataSource._view.length == 0) {
    grid.find('.k-grid-content tbody')
        .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" style="text-align:center"><b>No Results Found!</b></td></tr>');
  }
}

// attach the .equals method to Array's prototype to call it on any array
function compareArray(arrayOne, arrayTwo) {
  // if the other array is a falsy value, return
  if (!arrayTwo)
    return false;

  // compare lengths - can save a lot of time 
  if (arrayOne.length != arrayTwo.length)
    return false;

  for (var i = 0, l = arrayOne.length; i < l; i++) {
    // Check if we have nested arrays
    if (this[i] instanceof Array && arrayTwo[i] instanceof Array) {
      // recurse into the nested arrays
      if (!arrayOne[i].equals(arrayTwo[i]))
        return false;
    }
    else if (arrayOne[i] != arrayTwo[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }
  return true;
}

Date.prototype.toJSONLocal = (function () {
  function addZ(n) {
    return (n < 10 ? '0' : '') + n;
  }

  return function () {
    return this.getFullYear() + '-' +
      addZ(this.getMonth() + 1) + '-' +
      addZ(this.getDate()) + ' ' + addZ(this.getHours()) + ':' + addZ(this.getMinutes()) + ':' + addZ(this.getSeconds());
  };
}());

kendo.ui.Tooltip.fn._show = function (show) {
  return function (target) {
    var e = {
      sender: this,
      target: target,
      preventDefault: function () {
        this.isDefaultPrevented = true;
      }
    };

    if (typeof this.options.beforeShow === "function") {
      this.options.beforeShow.call(this, e);
    }
    if (!e.isDefaultPrevented) {
      // only show the tooltip if preventDefault() wasn't called..
      show.call(this, target);
    }
  };
}(kendo.ui.Tooltip.fn._show);

function setGridCommandToolTips(selector, name, gridName, columnIndex) {
  $(document).kendoTooltip({
    filter: "." + selector, // if we filter as td it shows text present in each td of the table

    content: function (e) {
      var grid = $("#" + gridName).data("kendoGrid");
      var retStr;
      $.each(grid.columns[columnIndex].command, function (index, value) {
        if (value.name === name) {
          retStr = value.title;
          return false;
        }
      });
      return retStr;

    },
    beforeShow: function (e) {
      if ($(e.target).is(":visible") == false) {
        // don't show the tooltip if the button is hidden
        e.preventDefault();
      }
    },
    autoHide: true,
    showAfter: 1000,
    position: "top"
  }).data("kendoTooltip");
}

String.prototype.format = function () {
  var str = this;
  for (var i = 0; i < arguments.length; i++) {
    var reg = new RegExp("\\{" + i + "\\}", "gm");
    str = str.replace(reg, arguments[i]);
  }
  return str;
}

function compareDates(date, dates) {
  for (var i = 0; i < dates.length; i++) {
    if (dates[i].getDate() == date.getDate() &&
        dates[i].getMonth() == date.getMonth() &&
        dates[i].getYear() == date.getYear()) {
      return true;
    }
  }
}