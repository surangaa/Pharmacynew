$("a[href='/Map']").parent().addClass("active");
var authCookie;
var cookieId;
var mapViewModel = null;
var map = null;
var markers = [];
var polyList = [];
function windowClose() {
  location.reload();
}

function windowActivate() {
  $(".k-upload-selected").hide();
  $(".k-upload-files").hide();
}

$(function () {
  authCookie = $.cookie(window.authCookieKeyName);
  cookieId = $('#cookieId').val();
  var height = $(document).height();
  $('#map-canvas').height(height - 340);
  var mapOptions = {
    center: { lat: -25, lng: 134 },
    zoom: 4
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
  mapViewModel = kendo.observable({
    selectedScenario: null,
    selectedAllocation: [],
    scenarios: [],
    allocations: [],
    mapPoints: [],
    activeCallDays: [],
    displayCallDays: null,
    callDayDataSource: null,
    isCallDayDatepickerVisible: true,
    selectedDateText: null,
    selectedDate: new Date(),
    onDateChange: function () {
      markMapPoints();
    },
  });

  kendo.bind($('#mapsView'), mapViewModel);

  $('#mapsView').loader();
  mapViewModel.scenarios = new kendo.data.DataSource({
    transport: {
      read: {
        url: "/api/scenarios",
        dataType: "json",
        beforeSend: function (req) {
          req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
        },
        statusCode: {
          200: function () {
            bindScenarioDropdown();
            $.loader.close();
          }
        }
      }
    }
  });
  mapViewModel.scenarios.read();

  $('#allocations').multiselect({
    buttonWidth: '500px',
    maxHeight: 300,
    numberDisplayed: 2,
    buttonClass: 'btn multiselect-control'
  });
});

function loadAllocations(scenario) {
  mapViewModel.allocations = new kendo.data.DataSource({
    transport: {
      read: {
        url: "/api/scenario/" + scenario + "/allocations",
        dataType: "json",
        beforeSend: function (req) {
          req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
        },
        statusCode: {
          200: function () {
            bindAllocations();
          }
        }
      }
    }
  });
  mapViewModel.allocations.read();
}

function addMarker(location, markerToDraw) {
  var icon, marker;
  if (mapViewModel.selectedAllocation.length !== 1) {
    icon = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=|" + markerToDraw.ColourCode.replace('#', '');
    marker = new google.maps.Marker({
      position: location,
      map: map,
      draggable: $('#isReadOnly').val() === 'True' ? false : true,
      id: markerToDraw.MapPointId,
      icon: new google.maps.MarkerImage(icon),
      code: markerToDraw.Code,
      name: markerToDraw.Name,
      address: markerToDraw.Address,
      details1: markerToDraw.Detail1,
      details2: markerToDraw.Detail2,
      details3: markerToDraw.Detail3,
      details4: markerToDraw.Detail4,
      details5: markerToDraw.Detail5,
      userName: markerToDraw.UserName,
      parentUserName: markerToDraw.ParentUserName,
      frequency: markerToDraw.Frequency,
      visitTime: markerToDraw.VisitTime
    });
    attachMessage(marker);
    markers.push(marker);
  } else {

    if (mapViewModel.activeCallDays.length === 0 || mapViewModel.activeCallDays.indexOf(markerToDraw.Ticks) !== -1) {
      if (markerToDraw.Ticks !== mapViewModel.displayCallDays && mapViewModel.displayCallDays !== null) {
        icon = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=|C3C3C3";
      } else {
        var current = _.findWhere(mapViewModel.callDayDataSource._data, { Key: markerToDraw.Ticks });
        icon = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=|" + current.ColourCode.replace('#', '');
      }
      marker = new google.maps.Marker({
        position: location,
        map: map,
        id: markerToDraw.MapPointId,
        draggable: $('#isReadOnly').val() === 'True' ? false : true,
        icon: icon,
        //animation: google.maps.Animation.DROP,
        code: markerToDraw.Code,
        name: markerToDraw.Name,
        address: markerToDraw.Address,
        details1: markerToDraw.Detail1,
        details2: markerToDraw.Detail2,
        details3: markerToDraw.Detail3,
        details4: markerToDraw.Detail4,
        details5: markerToDraw.Detail5,
        userName: markerToDraw.UserName,
        parentUserName: markerToDraw.ParentUserName,
        frequency: markerToDraw.Frequency,
        visitTime: markerToDraw.VisitTime
      });
      if (markerToDraw.Ticks === mapViewModel.displayCallDays) {
        marker.setZIndex(10000);
      }
      attachMessage(marker);
      markers.push(marker);
    }
  }
}

// Sets the map on all markers in the array.
function setAllMap(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setAllMap(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setAllMap(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}

function bindScenarioDropdown() {
  var scenarioDropdownlist = $("#scenarios").kendoComboBox({
    dataTextField: "Name",
    valuePrimitive: false,
    dataValueField: "ScenarioId",
    dataSource: mapViewModel.scenarios,
    valueTemplate: '<span>[#: data.Code #] #: data.Name #</span>',
    template: '<span>[#: data.Code #] #: data.Name #</span>',
    change: function () {
      if (this.value() === "") {
        mapViewModel.set("selectedScenario", null);
        mapViewModel.set("selectedAllocation", []);
        deleteMarkers();
        return;
      }
      mapViewModel.set("selectedAllocation", []);
      loadAllocations(mapViewModel.selectedScenario.ScenarioId);
      mapViewModel.set("selectedDate", mapViewModel.selectedScenario.ScenarioDateString == null ? new Date() : kendo.parseDate(mapViewModel.selectedScenario.ScenarioDateString, "dd/MM/yyyy"));
      mapViewModel.set("isCallDayDatepickerVisible", mapViewModel.selectedScenario.ScenarioDateString === null);
      mapViewModel.set("selectedDateText", mapViewModel.selectedScenario.ScenarioDateString);
    }
  }).data("kendoComboBox");

  if (typeof localStorage["app-" + cookieId + "-Active-Scenario" + "-" + $("#logged-username").text()] != 'undefined' && localStorage["app-" + cookieId + "-Active-Scenario" + "-" + $("#logged-username").text()] !== null) {
    mapViewModel.set("selectedScenario", JSON.parse(localStorage["app-" + cookieId + "-Active-Scenario" + "-" + $("#logged-username").text()]));
    scenarioDropdownlist.trigger("change");
  }
}

function bindAllocations() {
  $('#allocations').multiselect('destroy');
  $('option', $('#allocations')).each(function () {
    $(this).remove();
  });
  $('#allocations').empty();
  var options = $("#allocations");
  if (mapViewModel.allocations.data().length !== 0) {
    if (typeof localStorage["app-" + cookieId + "-selectedAllocationId" + "-" + $("#logged-username").text()] != 'undefined' && localStorage["app-" + cookieId + "-selectedAllocationId" + "-" + $("#logged-username").text()] !== null) {
      var selectedAllocationId = JSON.parse(localStorage["app-" + cookieId + "-selectedAllocationId" + "-" + $("#logged-username").text()]);
      var current = _.findWhere(mapViewModel.allocations._data, { AllocationId: selectedAllocationId });
      if (typeof current !== 'undefined' && current !== null) {
        mapViewModel.selectedAllocation.push(selectedAllocationId + "");
      }
    }
    $.each(mapViewModel.allocations.data(), function () {
      var item = mapViewModel.selectedAllocation.indexOf(kendo.toString(this.AllocationId, "n0"));
      if (item !== -1) {
        options.append($("<option selected='selected'></option>").val(this.AllocationId).text(this.Name));
      } else {
        options.append($("<option></option>").val(this.AllocationId).text(this.Name));
      }
    });
  }
  markMapPoints();
  $('#allocations').multiselect({
    buttonWidth: '500px',
    includeSelectAllOption: true,
    disableIfEmpty: true,
    maxHeight: 300,
    numberDisplayed: 2,
    buttonClass: 'btn multiselect-control',
    enableCaseInsensitiveFiltering: true,
    onChange: function (option, checked) {
      if (option !== undefined) {
        if (checked) {
          mapViewModel.selectedAllocation.push(option.val() + "");
        } else {
          mapViewModel.selectedAllocation.remove(option.val() + "");
        }
      } else {
        mapViewModel.set("selectedAllocation", []);
        if (checked) {
          $.each(mapViewModel.allocations.data(), function () {
            mapViewModel.selectedAllocation.push(this.AllocationId + "");
          });
        }
      }
      markMapPoints();
    }
  });
  $("#allocations").multiselect('refresh');
}

function markMapPoints() {
  if (mapViewModel.selectedAllocation.length === 0) {
    $('#map-area').removeClass("col-xs-10").addClass("col-xs-12");
    $('#grid-area').removeClass("col-xs-2");
    $('#grid-area').hide();
    deleteMarkers();
    return;
  } else if (mapViewModel.selectedAllocation.length === 1) {
    $('#map-area').removeClass("col-xs-12").addClass("col-xs-10");
    $('#grid-area').addClass("col-xs-2");
    $('#grid-area').show();
    bindCallDayGrid();
  } else {
    $('#map-area').removeClass("col-xs-10").addClass("col-xs-12");
    $('#grid-area').removeClass("col-xs-2");
    $('#grid-area').hide();
  }
  $('#mapsView').loader();
  $.ajax({
    url: "/api/map/getMapPoints",
    dataType: "json",
    type: "POST",
    beforeSend: function (req) {
      req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
    },
    data: {
      Scenario: mapViewModel.selectedScenario.ScenarioId,
      SelectedDate: mapViewModel.selectedDate.toJSONLocal(),
      Allocation: mapViewModel.selectedAllocation.length > 0 ? mapViewModel.selectedAllocation.toJSON() : []
    }
  }).done(function (data) {
    for (var y = 0; y < polyList.length; y++) {
      polyList[y].setMap(null);
    }

    mapViewModel.set("mapPoints", data);
    deleteMarkers();
    for (var i = 0; i < mapViewModel.mapPoints.length; i++) {
      var latlng = new google.maps.LatLng(mapViewModel.mapPoints[i].Y, mapViewModel.mapPoints[i].X);
      addMarker(latlng, mapViewModel.mapPoints[i]);
    }
    $.loader.close();

  });
}

function reDrawMarkers() {
  $('#mapsView').loader();
  for (var i = 0; i < mapViewModel.mapPoints.length; i++) {
    var latlng = new google.maps.LatLng(mapViewModel.mapPoints[i].Y, mapViewModel.mapPoints[i].X);
    addMarker(latlng, mapViewModel.mapPoints[i]);
  }
  $.loader.close();
}

function zoomToMapMarkers() {
  if (mapViewModel.mapPoints.length === 0) return;
  $('#mapsView').loader();
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < mapViewModel.mapPoints.length; i++) {
    var latlng = new google.maps.LatLng(mapViewModel.mapPoints[i].Y, mapViewModel.mapPoints[i].X);
    if (mapViewModel.activeCallDays.length === 0 || mapViewModel.activeCallDays.indexOf(mapViewModel.mapPoints[i].Ticks) !== -1) {
      bounds.extend(latlng);
    }
  }
  map.fitBounds(bounds);
  $.loader.close();
}

var x;
var y;
var initX;
var initY;
var currentLocationWindow = null;
function setLocationWindowContent(x, y) {
  var content = '<table class="mapMarkerWindow"><tbody><tr><td class="mapWindowCol">X:</td><td><input type="number" name="lng" id="lngId" class="k-textbox" onchange="changeX(this)" value=' + x + '></td></tr><tr><td class="mapWindowCol">Y:</td><td><input type="number" name="lat" id="latId" class="k-textbox" onchange="changeY(this)" value=' + y + '></td></tr></tbody></table>';
  return content;
}

function changeX(value) {
  x = value.value;
}

function changeY(value) {
  y = value.value;
}

function changeMappointLocation(mappointId) {
  if (x <= 155 && x >= 110 && y <= -10 && y >= -45) {
    $.ajax({
      type: "PUT",
      url: "/api/mappoint?mappointId=" + mappointId + "&x=" + x + "&y=" + y,
      beforeSend: function (req) {
        req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
      },
      dataType: "json",
    }).done(function () {
      var current = _.findWhere(markers, { id: mappointId });
      if (current != null) {
        var latlng = new google.maps.LatLng(y, x);
        current.setPosition(latlng);
        currentLocationWindow.close();
      }
    });
  } else {
    window.messageWindow.content(window.messageWindowTemplate({ message: "Location not acceptable : (Max X: 155, Min X: 110 and Max Y: -10, Min Y: -45)" }));
    window.messageWindow.title("Update Location");
    window.messageWindow.setOptions({
      height: 140
    });
    window.messageWindow.open().center();
    $("#okButton").click(function () {
      window.messageWindow.close();
    });
  }
}

function attachMessage(marker) {
  marker.locationWindow = new google.maps.InfoWindow({});
  var infowindow = new google.maps.InfoWindow({});
  infowindow.setContent("<table class='mapMarkerWindow'><tr><td class='mapWindowCol'>" + resources.Tags.MapPoint.Code.Title + "</td><td>" + (marker.code || "") + "</td></tr><tr><td class='mapWindowCol'>" + resources.Tags.MapPoint.Name.Title
    + "</td><td>" + (marker.name || "") + "</td></tr><tr><td class='mapWindowCol'>" + resources.Tags.MapPoint.Address.Title + "</td><td>" + (marker.address || "") + "</td></tr><tr><td class='mapWindowCol'>" + resources.Tags.MapPoint.Detail1.Title + "</td><td>"
    + (marker.details1 || "") + "</td></tr><tr><td class='mapWindowCol'>" + resources.Tags.MapPoint.Detail2.Title + "</td><td>" + (marker.details2 || "") + "</td></tr><tr><td class='mapWindowCol'>" + resources.Tags.MapPoint.Detail3.Title + "</td><td>" + (marker.details3 || "")
    //+ "</td></tr><tr><td class='mapWindowCol'>" + resources.Tags.MapPoint.Detail4.Title + "</td><td>" + (marker.details4 || "") + "</td></tr><tr><td class='mapWindowCol'>" + resources.Tags.MapPoint.Detail5.Title + "</td><td>" + (marker.details5 || "")
    + "</td></tr><tr><td class='mapWindowCol'>" + resources.Tags.MapPoint.UserName.Title + "</td><td>" + (marker.userName || "") + "</td></tr><tr><td class='mapWindowCol'>" + resources.Tags.MapPoint.ParentUserName.Title + "</td><td>" + (marker.parentUserName || "")
    + "</td></tr><tr><td class='mapWindowCol'>" + resources.Tags.Contract.Frequency.Title + "</td><td>" + (marker.frequency || "") + "</td></tr><tr><td class='mapWindowCol'>" + resources.Tags.Contract.VisitTime.Title + "</td><td>" + (marker.visitTime || "") + "</td></tr></table>");
  marker.addListener('click', function () {
    infowindow.open(marker.get('map'), marker);
  });

  marker.addListener('dragstart', function (e) {
    x = e.latLng.lng();
    initX = e.latLng.lng();
    y = e.latLng.lat();
    initY = e.latLng.lat();
    if (currentLocationWindow != null) {
      currentLocationWindow.close();
    }
    currentLocationWindow = marker.locationWindow;
    marker.locationWindow.setContent(setLocationWindowContent(x, y));
    marker.locationWindow.open(marker.get('map'), marker);
  });

  google.maps.event.addListener(marker.locationWindow, 'closeclick', function () {
    var latlng = new google.maps.LatLng(initY, initX);
    marker.setPosition(latlng);
  });

  marker.addListener('drag', function (e) {
    x = e.latLng.lng();
    y = e.latLng.lat();
    marker.locationWindow.setContent(setLocationWindowContent(x, y));
  });

  marker.addListener('dragend', function (e) {
    x = e.latLng.lng();
    y = e.latLng.lat();
    var content = setLocationWindowContent(x, y) + ' <input class="k-button" style="margin-top: 5px; float: right;" type="button" onclick="changeMappointLocation(' + marker.id + ')" value="Ok"/>';
    marker.locationWindow.setContent(content);
  });
}

function bindCallDayGrid() {
  var dataSource = new kendo.data.DataSource({
    type: "json",
    transport: {
      read: {
        url: "/api/map/getCallDays?date=" + mapViewModel.selectedDate.toJSONLocal(),
        beforeSend: function (req) {
          req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
        }
      }
    },
    schema: {
      model: {
        fields: {
          CallDay: { type: "int" },
          Active: { type: "boolean" },
          Display: { type: "boolean" },
          Date: { type: "date" },
          ColourCode: { type: "string" }
        }
      }
    }
  });

  mapViewModel.set("callDayDataSource", dataSource);
  mapViewModel.set("activeCallDays", []);
  mapViewModel.set("displayCallDays", null);
  var grid = $("#calldayGrid").kendoGrid({
    dataSource: mapViewModel.callDayDataSource,
    pageable: false,
    columns: [
      {
        field: 'Active', width: 40, template: '<input type="checkbox" #= Active ? "checked=checked" : "" # class="checkActive"></input>', attributes: {
          "class": "table-cell",
          style: "text-align: center"
        },
        headerTemplate: "<input type='checkbox' id='chkSelectAll' onclick='checkAll(this)'/>&nbsp;Active"
      },
      {
        field: 'CallDay', title: "Call Day", width: 40, attributes: {
          "class": "table-cell",
          style: "text-align: center"
        }
      },
      {
        field: 'Display', title: "Highlight", width: 40, template: '<input type="checkbox" #= Display ? "checked=checked" : "" # class="checkDisplay" #=DisplayDisable ? "disabled":""#></input>', attributes: {
          "class": "table-cell",
          style: "text-align: center"
        }
      }],
    editable: false,
    dataBound: function () {
      $('.checkActive').change(function () {
        setActive(this);
      });
      $('.checkDisplay').change(function () {
        setDisplay(this);
      });
    }
  }).data("kendoGrid");

  grid.table.on("click", ".selectAll", function () {
    var checkbox = $(this);
    if (checkbox.is(':checked')) {
      grid.table.find("tr")
          .find("td:first input")
          .attr("checked", checkbox.is(":checked"));

    }
    else {
      grid.table.find("tr")
          .find("td:first input")
          .attr("checked", checkbox.is(":checked"));
    }
  });
}

function setActive(selected) {
  var checked = selected.checked,
      row = $(selected).closest("tr"),
      grid = $("#calldayGrid").data("kendoGrid"),
      dataItem = grid.dataItem(row);
  if (dataItem !== null && dataItem !== undefined) {
    dataItem.set('Active', checked);
    if (checked) {
      dataItem.set('DisplayDisable', false);
    } else {
      dataItem.set('DisplayDisable', true);
    }
  }
  mapViewModel.set("activeCallDays", []);
  for (var i = 0; i < mapViewModel.callDayDataSource._total; i++) {
    var item = $('#calldayGrid').data().kendoGrid.dataSource.data()[i];
    if (item.Active)
      mapViewModel.activeCallDays.push(item.Key);
  }
  deleteMarkers();
  reDrawMarkers();
}

function setDisplay(selected) {
  var checked = selected.checked,
      row = $(selected).closest("tr"),
      grid = $("#calldayGrid").data("kendoGrid"),
      dataItem = grid.dataItem(row);
  if (dataItem !== null && dataItem !== undefined) {
    if (checked) {
      mapViewModel.set("displayCallDays", dataItem.Key);
    } else {
      mapViewModel.set("displayCallDays", null);
    }
    dataItem.set('Display', checked);
    dataItem.set('dirty', false);
    for (var i = 0; i < mapViewModel.callDayDataSource._total; i++) {
      var item = $('#calldayGrid').data().kendoGrid.dataSource.data()[i];
      if (item.CallDay !== dataItem.CallDay) {
        item.set('Display', false);
      }
    }
  }
  deleteMarkers();
  reDrawMarkers();
}

function checkAll(ele) {
  $('#mapsView').loader();
  var checked = $(ele).is(':checked');
  for (var i = 0; i < mapViewModel.callDayDataSource._total; i++) {
    var item = $('#calldayGrid').data().kendoGrid.dataSource.data()[i];
    item.set('Active', checked);
    if (checked)
      item.set('DisplayDisable', false);
    else {
      item.set('DisplayDisable', true);
      item.set('Display', false);
    }
  }
  if (!checked) {
    mapViewModel.set("activeCallDays", []);
    mapViewModel.set("displayCallDays", null);
  }
  $.loader.close();
  deleteMarkers();
  reDrawMarkers();
}