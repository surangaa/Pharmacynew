$("a[href='/Workload']").parent().addClass("active");
var authCookie;
var cookieId;
var workloadViewModel = null;

$(function () {
  $("#exportExcelBtnId").click(function () {
    $("#workloadGrid").getKendoGrid().saveAsExcel();
  });

  $("#exportPdfBtnId").click(function () {
    $("#workloadGrid").getKendoGrid().saveAsPDF();
  });
  authCookie = $.cookie(window.authCookieKeyName);
  cookieId = $('#cookieId').val();
  workloadViewModel = kendo.observable({
    selectedScenario: null,
    selectedAllocations: [],
    scenarios: [],
    allocations: []
  });

  kendo.bind($('#workloadView'), workloadViewModel);

  workloadViewModel.scenarios = new kendo.data.DataSource({
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
          }
        }
      }
    }
  });
  workloadViewModel.scenarios.read();

  $('#allocations').multiselect({
    buttonWidth: '500px',
    maxHeight: 300,
    numberDisplayed: 5,
    buttonClass: 'btn multiselect-control'
  });

  $("#workloadGrid").kendoGrid({
    excel: {
      fileName: "WorkloadExport.xlsx",
      filterable: true,
      allPages: true
    },
    pdf: {
      allPages: true,
      fileName: "WorkloadExport.pdf"
    },
    dataSource: getWorkloadDataSource([]),
    reorderable: false,
    resizable: false,
    filterable: false,
    groupable: false,
    sortable: false,
    pageable: false,
    columns: [
      {
        field: "ScenarioName",
        title: resources.Tags.Workload.ScenarioName.Title,
        hidden: resources.Tags.Workload.ScenarioName.Hidden === 'True',
        width: "150px"
      },
      {
        field: "AllocationName",
        title: resources.Tags.Workload.AllocationName.Title,
        hidden: resources.Tags.Workload.AllocationName.Hidden === 'True',
        width: "150px"
      },
      {
        field: "WorkloadTemplate",
        title: resources.Tags.Workload.Template.Title,
        hidden: resources.Tags.Workload.Template.Hidden === 'True',
        width: "150px"
      },
      {
        field: "Visits",
        title: resources.Tags.Workload.Visits.Title,
        hidden: resources.Tags.Workload.Visits.Hidden === 'True',
        width: "60px"
      },
      {
        field: "TotalTime",
        title: resources.Tags.Workload.TotalTime.Title,
        hidden: resources.Tags.Workload.TotalTime.Hidden === 'True',
        format: "{0:n2}",
        width: "70px"
      },
      {
        field: "VisitTime",
        title: resources.Tags.Workload.VisitTime.Title,
        hidden: resources.Tags.Workload.VisitTime.Hidden === 'True',
        width: "70px"
      },
      {
        field: "Flagfall",
        title: resources.Tags.Workload.Flagfall.Title,
        hidden: resources.Tags.Workload.Flagfall.Hidden === 'True',
        width: "70px"
      },
      {
        field: "TravelTime",
        title: resources.Tags.Workload.TravelTime.Title,
        hidden: resources.Tags.Workload.TravelTime.Hidden === 'True',
        format: "{0:n2}",
        width: "80px"
      },
      {
        field: "Utilization",
        title: resources.Tags.Workload.Utilization.Title,
        hidden: resources.Tags.Workload.Utilization.Hidden === 'True',
        format: "{0:n2}",
        width: "80px"
      },
      {
        field: "TravelPercent",
        title: resources.Tags.Workload.TravelPercent.Title,
        hidden: resources.Tags.Workload.TravelPercent.Hidden === 'True',
        format: "{0:n2}",
        width: "70px"
      },
      {
        field: "Distance",
        title: resources.Tags.Workload.Distance.Title,
        hidden: resources.Tags.Workload.Distance.Hidden === 'True',
        format: "{0:n2}",
        width: "100px"
      },
      {
        field: "SleepOuts1",
        title: resources.Tags.Workload.SleepOuts1.Title,
        hidden: resources.Tags.Workload.SleepOuts1.Hidden === 'True',
        width: "70px"
      },
      {
        field: "SleepOuts2",
        title: resources.Tags.Workload.SleepOuts2.Title,
        hidden: resources.Tags.Workload.SleepOuts2.Hidden === 'True',
        width: "70px"
      }
    ]
  });

  $("#totalVisitChart").kendoChart({
    title: {
      text: "Total Visits"
    },
    categoryAxis: {
      labels: {
        rotation: -45    
      },
      field: "AllocationName"
    },
    dataSource: [],
    tooltip: {
      visible: true,
      template: "#= value #"
    },
    series: [{
      field: "Visits",
      color: "#EC7063"
    }]
  });

  $("#totalTimeChart").kendoChart({
    title: {
      text: "Total Times"
    },
    categoryAxis: {
      labels: {
        rotation: -45
      },
      field: "AllocationName"
    },
    dataSource: [],
    tooltip: {
      visible: true,
      template: "#= value #"
    },
    series: [{
      field: "TotalTime",
      color: "#AF7AC5"
    }]
  });

  $("#utilizationChart").kendoChart({
    title: {
      text: "Utilization"
    },
    categoryAxis: {
      labels: {
        rotation: -45
      },
      field: "AllocationName"
    },
    dataSource: [],
    tooltip: {
      visible: true,
      template: "#= value #"
    },
    series: [{
      field: "Utilization",
      color: "#5DADE2"
    }]
  });

  $("#visitTimeChart").kendoChart({
    title: {
      text: "Visit Times"
    },
    categoryAxis: {
      labels: {
        rotation: -45
      },
      field: "AllocationName"
    },
    dataSource: [],
    tooltip: {
      visible: true,
      template: "#= series.name #: #= value #"
    },
    seriesDefaults: {
      stack: true
    },
    series: [{
      name: "Flag Fall",
      field: "Flagfall",
      color: "#239B56"
    }, {
      name: "Visit Time",
      field: "VisitTime",
      color: "#B7950B"
    }, {
      name: "Travel Time",
      field: "TravelTime",
      color: "#D68910"
    }]
  });
});

function bindScenarioDropdown() {
  var scenarioDropdownlist = $("#scenarios").kendoComboBox({
    dataTextField: "Name",
    valuePrimitive: false,
    dataValueField: "ScenarioId",
    dataSource: workloadViewModel.scenarios,
    valueTemplate: '<span>[#: data.Code #] #: data.Name #</span>',
    template: '<span>[#: data.Code #] #: data.Name #</span>',
    change: function () {
      if (this.value() === "") {
        workloadViewModel.set("selectedScenario", null);
        workloadViewModel.set("selectedAllocations", []);
        return;
      }
      workloadViewModel.set("selectedAllocations", []);
      resetPageData();
      loadAllocations(workloadViewModel.selectedScenario.ScenarioId);
    }
  }).data("kendoComboBox");

  if (workloadViewModel.scenarios._data.length > 0) {
    workloadViewModel.set("selectedScenario", workloadViewModel.scenarios._data[0]);
    scenarioDropdownlist.trigger("change");
  }
}

function loadAllocations(scenario) {
  workloadViewModel.allocations = new kendo.data.DataSource({
    transport: {
      read: {
        url: "/api/scenario/" + scenario + "/allocations",
        dataType: "json",
        beforeSend: function (req) {
          req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
        },
        statusCode: {
          200: function () {
            bindAllocations(true);
          }
        }
      }
    }
  });
  workloadViewModel.allocations.read();
}

function bindAllocations(selectAll) {
  $('#allocations').multiselect('destroy');
  $('option', $('#allocations')).each(function () {
    $(this).remove();
  });
  $('#allocations').empty();
  var options = $("#allocations");
  if (workloadViewModel.allocations.data().length !== 0) {
    if (selectAll) {
      $.each(workloadViewModel.allocations._data, function (index, item) {
        workloadViewModel.selectedAllocations.push(item.AllocationId);
      });
    }
    $.each(workloadViewModel.allocations.data(), function () {
      var item = workloadViewModel.selectedAllocations.indexOf(this.AllocationId);
      if (item !== -1) {
        options.append($("<option selected='selected'></option>").val(this.AllocationId).text(this.Name));
      } else {
        options.append($("<option></option>").val(this.AllocationId).text(this.Name));
      }
    });
    loadWorkloadData(false);
  }
  var allocationDropdown = $('#allocations').multiselect({
    buttonWidth: '500px',
    includeSelectAllOption: true,
    disableIfEmpty: true,
    maxHeight: 300,
    numberDisplayed: 2,
    buttonClass: 'btn multiselect-control',
    enableCaseInsensitiveFiltering: true,
    onChange: function (option, checked) {
      if (option !== undefined && option != null) {
        if (checked) {
          workloadViewModel.selectedAllocations.push(kendo.parseInt(option.val()));
        } else {
          workloadViewModel.selectedAllocations.remove(kendo.parseInt(option.val()));
        }
      } else {
        workloadViewModel.set("selectedAllocations", []);
        if (checked) {
          $.each(workloadViewModel.allocations.data(), function () {
            workloadViewModel.selectedAllocations.push(this.AllocationId);
          });
        }
      }
    },
    onDropdownHide: function () {
      resetPageData();
      window.confirmationWindow.content(window.windowTemplate({ message: "Do you want to re-calculate workload data for the selected allocations? Otherwise existing data will be loaded" }));
      window.confirmationWindow.title("Load Workload Data");
      window.confirmationWindow.setOptions({
        height: 140
      });
      window.confirmationWindow.open().center();
      $("#yesButton").click(function () {
        window.confirmationWindow.close();
        loadWorkloadData(true);
      });
      $("#noButton").click(function () {
        window.confirmationWindow.close();
        loadWorkloadData(false);
      });
    }
  });
  allocationDropdown.multiselect('refresh');
  $('#allocations').trigger("change");
}

function resetPageData() {
  $("#workloadGrid").data("kendoGrid").setDataSource(getWorkloadDataSource([]));
  $("#totalVisitChart").data("kendoChart").setDataSource(getWorkloadDataSource([]));
  $("#totalTimeChart").data("kendoChart").setDataSource(getWorkloadDataSource([]));
  $("#utilizationChart").data("kendoChart").setDataSource(getWorkloadDataSource([]));
  $("#visitTimeChart").data("kendoChart").setDataSource(getWorkloadDataSource([]));
}

function loadWorkloadData(recalculate) {
  $('#workloadView').loader();
  $.ajax({
    type: "POST",
    url: "/api/workload/",
    beforeSend: function (req) {
      req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
    },
    dataType: "JSON",
    data: {
      SelectedAllocations: workloadViewModel.selectedAllocations.toJSON(),
      Recalculate: recalculate
    }
  }).done(function (data) {
    $.loader.close();
    $("#workloadGrid").data("kendoGrid").setDataSource(getWorkloadDataSource(data));
    $("#totalVisitChart").data("kendoChart").setDataSource(getWorkloadDataSource(data));
    $("#totalTimeChart").data("kendoChart").setDataSource(getWorkloadDataSource(data));
    $("#utilizationChart").data("kendoChart").setDataSource(getWorkloadDataSource(data));
    $("#visitTimeChart").data("kendoChart").setDataSource(getWorkloadDataSource(data));
  });
}

function getWorkloadDataSource(data) {
  return new kendo.data.DataSource({
    data: data,
    schema: {
      model: {
        id: "WorkloadId",
        fields: {
          WorkloadId: { type: "number" },
          Visits: { type: "number" },
          VisitTime: { type: "number" },
          Utilization: { type: "number" },
          TravelTime: { type: "number" },
          TravelPercent: { type: "number" },
          TotalTime: { type: "number" },
          SleepOuts2: { type: "number" },
          SleepOuts1: { type: "number" },
          Flagfall: { type: "number" },
          Distance: { type: "number" },
          WorkloadTemplate: { type: "string" },
          WorkloadTemplateId: { type: "number" },
          AllocationId: { type: "number" },
          AllocationName: { type: "string" },
          ScenarioName: { type: "string" },
          ScenarioId: { type: "number" }
        }
      }
    }
  });
}