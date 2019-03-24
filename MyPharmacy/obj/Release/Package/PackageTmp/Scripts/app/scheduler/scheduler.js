$("a[href='/Calendar']").parent().addClass("active");
$("a[href='/Calendar/Index']").parent().addClass("active");
var authCookie;
var cookieId;
var viewModel = kendo.observable({
  init: init,
  editorWindow: null,
  selectedScenarios: [],
  createScenario: function () {
    var template = kendo.template($("#scenario-template").html());
    viewModel.editorWindow.content(template({}));
    viewModel.editorWindow.title("Create " + resources.Tags.Scenario.Header);
    viewModel.editorWindow.setOptions({
      width: 600
    });
    viewModel.createScenarioViewModel = kendo.observable({
      code: "",
      name: "",
      readOnly: false,
      isLockVisible: false,
      scenarioDate: null,
      codeLabel: resources.Tags.Scenario.Code.Title,
      nameLabel: resources.Tags.Scenario.Name.Title,
      scenarioDateLabel: resources.Tags.Scenario.ScenarioDate.Title,
      lockedLabel: resources.Tags.Scenario.Locked.Title,
      cancel: function () {
        viewModel.editorWindow.close();
      },
      submit: function () {
        if (viewModel.validator.validate()) {
          window.showOverlay();
          $.ajax({
            type: "POST",
            url: "/api/scenario/",
            beforeSend: function (req) {
              req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
            },
            dataType: "JSON",
            data: {
              Code: viewModel.createScenarioViewModel.code,
              Name: viewModel.createScenarioViewModel.name,
              ScenarioDateValueString: viewModel.createScenarioViewModel.scenarioDate == null ? null : viewModel.createScenarioViewModel.scenarioDate.toJSONLocal()
            }
          }).done(function () {
            window.hideOverlay();
            viewModel.editorWindow.close();
          });
        }
      }
    });
    setValidator('senariosForm', '/api/scenario/exists/{0}', viewModel.createScenarioViewModel);
    kendo.bind($("#senariosForm"), viewModel.createScenarioViewModel);
    viewModel.editorWindow.open().center();
  },
  openScenarios: function () {
    loadScenarios(false);
  },
  copyScenario: function () {
    var template = kendo.template($("#scenario-template").html());
    viewModel.editorWindow.content(template({}));
    viewModel.editorWindow.title("Copy " + resources.Tags.Scenario.Header);
    viewModel.editorWindow.setOptions({
      width: 800
    });
    viewModel.copyScenarioViewModel = kendo.observable({
      code: "",
      name: "",
      readOnly: true,
      isLockVisible: true,
      freq0: true,
      freq1: true,
      freq2: true,
      freq3: true,
      freq033: true,
      freq05: true,
      freq4: true,
      scenarioDate: null,
      showFrequencySection: true,
      codeLabel: resources.Tags.Scenario.Code.Title,
      nameLabel: resources.Tags.Scenario.Name.Title,
      scenarioDateLabel: resources.Tags.Scenario.ScenarioDate.Title,
      lockedLabel: resources.Tags.Scenario.Locked.Title,
      cancel: function () {
        viewModel.editorWindow.close();
      },
      submit: function () {
        if (viewModel.validator.validate()) {
          window.showOverlay();
          var frequencies = "";
          if (viewModel.copyScenarioViewModel.freq0) {
            frequencies += "0,";
          }
          if (viewModel.copyScenarioViewModel.freq1) {
            frequencies += "1,";
          }
          if (viewModel.copyScenarioViewModel.freq2) {
            frequencies += "2,";
          }
          if (viewModel.copyScenarioViewModel.freq3) {
            frequencies += "3,";
          }
          if (viewModel.copyScenarioViewModel.freq4) {
            frequencies += "4,";
          }
          if (viewModel.copyScenarioViewModel.freq033) {
            frequencies += "0.33,";
          }
          if (viewModel.copyScenarioViewModel.freq05) {
            frequencies += "0.5,";
          }
          $.ajax({
            type: "POST",
            url: "/api/scenario/" + viewModel.activeScenario.ScenarioId + "/copy",
            beforeSend: function (req) {
              req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
            },
            dataType: "JSON",
            data: {
              Code: viewModel.copyScenarioViewModel.code,
              Name: viewModel.copyScenarioViewModel.name,
              ReadOnly: viewModel.copyScenarioViewModel.readOnly,
              ScenarioDateValueString: viewModel.copyScenarioViewModel.scenarioDate == null ? null : viewModel.copyScenarioViewModel.scenarioDate.toJSONLocal(),
              CurrentDateString: viewModel.allocationViewModel.selectedDate.toJSONLocal(),
              Frequencies: frequencies
            }
          }).done(function (scenarioId) {
            window.hideOverlay();
            viewModel.editorWindow.close();
            viewModel.selectedScenarios.push(kendo.observable({
              ScenarioId: scenarioId,
              ReadOnly: viewModel.copyScenarioViewModel.readOnly,
              Name: viewModel.copyScenarioViewModel.name,
              Code: viewModel.copyScenarioViewModel.code,
              ScenarioDateString: viewModel.copyScenarioViewModel.scenarioDate == null ? null : kendo.toString(viewModel.copyScenarioViewModel.scenarioDate, "dd/MM/yyyy"),
              IsSelected: true
            }));
            createScenarioTabs();
          });
        }
      }
    });
    setValidator('senariosForm', '/api/scenario/exists/{0}', viewModel.copyScenarioViewModel);
    kendo.bind($("#senariosForm"), viewModel.copyScenarioViewModel);
    viewModel.editorWindow.open().center();
  },
  editScenario: function () {
    var template = kendo.template($("#scenario-template").html());
    viewModel.editorWindow.content(template({}));
    viewModel.editorWindow.title("Edit " + resources.Tags.Scenario.Header);
    viewModel.editorWindow.setOptions({
      width: 600
    });
    viewModel.editScenarioViewModel = kendo.observable({
      id: viewModel.activeScenario.ScenarioId,
      oldCode: viewModel.activeScenario.Code,
      code: viewModel.activeScenario.Code,
      name: viewModel.activeScenario.Name,
      showFrequencySection: false,
      readOnly: viewModel.activeScenario.ReadOnly && $('#isAdmin').val() !== 'True',
      scenarioDate: viewModel.activeScenario.ScenarioDateString == null ? null : kendo.parseDate(viewModel.activeScenario.ScenarioDateString, "dd/MM/yyyy"),
      codeLabel: resources.Tags.Scenario.Code.Title,
      nameLabel: resources.Tags.Scenario.Name.Title,
      scenarioDateLabel: resources.Tags.Scenario.ScenarioDate.Title,
      lockedLabel: resources.Tags.Scenario.Locked.Title,
      isLockVisible: false,
      cancel: function () {
        viewModel.editorWindow.close();
      },
      submit: function () {
        if (viewModel.validator.validate()) {
          window.showOverlay();
          $.ajax({
            type: "PUT",
            url: "/api/scenario/" + viewModel.editScenarioViewModel.id + "/update",
            beforeSend: function (req) {
              req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
            },
            dataType: "JSON",
            data: {
              ScenarioId: viewModel.editScenarioViewModel.id,
              Code: viewModel.editScenarioViewModel.code,
              Name: viewModel.editScenarioViewModel.name,
              ReadOnly: viewModel.editScenarioViewModel.readOnly,
              ScenarioDateValueString: viewModel.editScenarioViewModel.scenarioDate == null ? null : viewModel.editScenarioViewModel.scenarioDate.toJSONLocal()
            }
          }).done(function () {
            window.hideOverlay();
            viewModel.editorWindow.close();
            viewModel.activeScenario.set("Code", viewModel.editScenarioViewModel.code);
            viewModel.activeScenario.set("Name", viewModel.editScenarioViewModel.name);
            viewModel.activeScenario.set("ScenarioDateString", viewModel.editScenarioViewModel.scenarioDate == null ? null : kendo.toString(viewModel.editScenarioViewModel.scenarioDate, "dd/MM/yyyy"));
            viewModel.allocationViewModel.set("currentSenarioName", viewModel.editScenarioViewModel.name);
            viewModel.allocationViewModel.set("selectedDate", viewModel.activeScenario.ScenarioDateString == null ? new Date() : kendo.parseDate(viewModel.activeScenario.ScenarioDateString, "dd/MM/yyyy"));
            viewModel.allocationViewModel.set("isCallDayDatepickerVisible", viewModel.activeScenario.ScenarioDateString === null);
            viewModel.allocationViewModel.set("selectedDateText", viewModel.activeScenario.ScenarioDateString);
            $('#tabText-' + viewModel.editScenarioViewModel.id).text(viewModel.editScenarioViewModel.code);
            loadScheduler(viewModel.allocationViewModel.selectedAllocation, viewModel.allocationViewModel.selectedDate.toJSONLocal());
          });
        }
      }
    });
    setValidator('senariosForm', '/api/scenario/exists/{0}', viewModel.editScenarioViewModel);
    kendo.bind($("#senariosForm"), viewModel.editScenarioViewModel);
    viewModel.editorWindow.open().center();
  },
  deleteScenario: function () {
    window.confirmationWindow.content(window.windowTemplate({ message: "Are you sure you want to delete " + resources.Tags.Scenario.Header + " " + viewModel.activeScenario.Name + "?" }));
    window.confirmationWindow.title("Delete " + resources.Tags.Scenario.Header);
    window.confirmationWindow.open().center();
    $("#yesButton").click(function () {
      var scenarioId = viewModel.activeScenario.ScenarioId;
      $.ajax({
        type: "DELETE",
        url: "/api/scenario/" + scenarioId,
        beforeSend: function (req) {
          req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
        },
        dataType: "JSON",
      }).done(function () {
        viewModel.selectedScenarios = _.reject(viewModel.selectedScenarios, { ScenarioId: scenarioId });
        $("#tabStrip").data("kendoTabStrip").remove(viewModel.activeTabIndex);
        window.confirmationWindow.close();
        $("#tabStrip").data("kendoTabStrip").select(0);
      });
    });
    $("#noButton").click(function () {
      window.confirmationWindow.close();
    });
  },
  lockScenario: function () {
    unlockLockScenario(true);
  },
  unlockScenario: function () {
    unlockLockScenario(false);
  },
  swapCallDays: function () {
    var data = [
    { text: "Call Day 01", callDay: 1, week: 1 },
    { text: "Call Day 02", callDay: 2, week: 1 },
    { text: "Call Day 03", callDay: 3, week: 1 },
    { text: "Call Day 04", callDay: 4, week: 1 },
    { text: "Call Day 05", callDay: 5, week: 1 },
    { text: "Call Day 06", callDay: 6, week: 2 },
    { text: "Call Day 07", callDay: 7, week: 2 },
    { text: "Call Day 08", callDay: 8, week: 2 },
    { text: "Call Day 09", callDay: 9, week: 2 },
    { text: "Call Day 10", callDay: 10, week: 2 },
    { text: "Call Day 11", callDay: 11, week: 3 },
    { text: "Call Day 12", callDay: 12, week: 3 },
    { text: "Call Day 13", callDay: 13, week: 3 },
    { text: "Call Day 14", callDay: 14, week: 3 },
    { text: "Call Day 15", callDay: 15, week: 3 },
    { text: "Call Day 16", callDay: 16, week: 4 },
    { text: "Call Day 17", callDay: 17, week: 4 },
    { text: "Call Day 18", callDay: 18, week: 4 },
    { text: "Call Day 19", callDay: 19, week: 4 },
    { text: "Call Day 20", callDay: 20, week: 4 }
    ];

    var template = kendo.template($("#swap-visit-template").html());
    viewModel.editorWindow.content(template({}));
    viewModel.editorWindow.title("Swap Call-Days");
    viewModel.swapCallDayViewModel = kendo.observable({
      fromCalDays: data,
      selectedFromCallDay: data[0],
      toCalDays: _.reject(data, { callDay: 1 }),
      selectedToCallDay: _.reject(data, { callDay: 1 })[0],
      onToCallDayChange: function () {
        var filter = _.where(data, { week: viewModel.swapCallDayViewModel.selectedFromCallDay.week });
        viewModel.swapCallDayViewModel.set("toCalDays", _.reject(data, { callDay: viewModel.swapCallDayViewModel.selectedFromCallDay.callDay }));
        viewModel.swapCallDayViewModel.set("selectedToCallDay", _.reject(filter, { callDay: viewModel.swapCallDayViewModel.selectedFromCallDay.callDay })[0]);
      },
      cancel: function () {
        viewModel.editorWindow.close();
      },
      submit: function () {
        if (viewModel.swapCallDayViewModel.selectedFromCallDay.week !== viewModel.swapCallDayViewModel.selectedToCallDay.week) {
          swapCallDayVisits(viewModel.swapCallDayViewModel.selectedFromCallDay.callDay, viewModel.swapCallDayViewModel.selectedToCallDay.callDay, false);
          return;
        }
        window.confirmationWithCancelWindow.content(window.confirmationWithCancelWindowTemplate({ message: "Do you want to repeat the swap for all calendar days?" }));
        window.confirmationWithCancelWindow.title("Swap Calendar Call-Days");
        window.confirmationWithCancelWindow.open().center();
        $("#yesButtonConfirmtion").click(function () {
          window.confirmationWithCancelWindow.close();
          swapCallDayVisits(viewModel.swapCallDayViewModel.selectedFromCallDay.callDay, viewModel.swapCallDayViewModel.selectedToCallDay.callDay, true);
        });
        $("#noButtonConfirmtion").click(function () {
          window.confirmationWithCancelWindow.close();
          swapCallDayVisits(viewModel.swapCallDayViewModel.selectedFromCallDay.callDay, viewModel.swapCallDayViewModel.selectedToCallDay.callDay, false);
        });
        $("#cancelButtonConfirmtion").click(function () {
          window.confirmationWithCancelWindow.close();
        });
      }
    });
    kendo.bind($("#swapVisitForm"), viewModel.swapCallDayViewModel);
    viewModel.editorWindow.open().center();
  },
  activeScenario: null,
  activeTabIndex: null,
  isCopyVisible: false,
  isDeleteVisible: false,
  isEditVisible: false,
  isLockVisible: false,
  isSwapVisible: false,
  isUnlockVisible: false,
  allocationViewModel:
  {
    isAllocationsVisible: false,
    isCopyVisible: false,
    isCreateVisible: false,
    isEditVisible: false,
    isExportVisible: false,
    isDeleteVisible: false,
    isSchedulerVisible: false,
    isUnallocatedVisitsVisible: false,
    isNonCalledListVisible: false,
    selectedAllocation: null,
    selectedAllocationId: null,
    currentSenarioName: null,
    availableAllocations: [],
    visitTypes: [],
    callDayData: [],
    frequencies: [],
    reasons: [],
    selectedDate: null,
    selectedDateText: "",
    isCallDayDatepickerVisible: false,
    createAllocation: function () {
      var template = kendo.template($("#allocation-template").html());
      viewModel.editorWindow.content(template({}));
      viewModel.editorWindow.title("Create " + resources.Tags.Allocation.Header);
      viewModel.editorWindow.setOptions({
        width: 600
      });
      viewModel.createAllocationViewModel = kendo.observable({
        code: "",
        name: "",
        travelPercent: 0.1,
        codeLabel: resources.Tags.Allocation.Code.Title,
        nameLabel: resources.Tags.Allocation.Name.Title,
        colourCodeLabel: resources.Tags.Allocation.ColourCode.Title,
        travelPercentLabel: resources.Tags.Allocation.TravelPercent.Title,
        workloadTemplateLabel: resources.Tags.Allocation.WorkloadTemplate.Title,
        selectedWorkloadTemplateId: viewModel.allocationViewModel.workloadTemplates[0].WorkloadTemplateId,
        workloadTemplates: viewModel.allocationViewModel.workloadTemplates,
        selectedColor: "#ffffff",
        cancel: function () {
          viewModel.editorWindow.close();
        },
        submit: function () {
          if (viewModel.validator.validate()) {
            window.showOverlay();
            $.ajax({
              type: "POST",
              url: "/api/allocation/",
              beforeSend: function (req) {
                req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
              },
              dataType: "JSON",
              data: {
                Code: viewModel.createAllocationViewModel.code,
                Name: viewModel.createAllocationViewModel.name,
                TravelPercent: viewModel.createAllocationViewModel.travelPercent,
                ScenarioId: viewModel.activeScenario.ScenarioId,
                ColourCode: viewModel.createAllocationViewModel.selectedColor,
                WorkloadTemplateId: viewModel.createAllocationViewModel.selectedWorkloadTemplateId == -1 ? null : viewModel.createAllocationViewModel.selectedWorkloadTemplateId
              }
            }).done(function () {
              window.hideOverlay();
              viewModel.editorWindow.close();
              viewModel.allocationViewModel.allocations.read();
            });
          }
        }
      });
      setValidator('allocationForm', '/api/scenario/' + viewModel.activeScenario.ScenarioId + '/allocation/exists/{0}', viewModel.createAllocationViewModel);
      kendo.bind($("#allocationForm"), viewModel.createAllocationViewModel);
      viewModel.editorWindow.open().center();
    },
    copyAllocation: function () {
      var template = kendo.template($("#copy-allocation-template").html());
      viewModel.editorWindow.content(template({}));
      viewModel.editorWindow.title("Copy " + resources.Tags.Allocation.Header + " to Another " + resources.Tags.Scenario.Header);
      viewModel.editorWindow.setOptions({
        width: 700
      });
      var scenarios = _.reject(viewModel.selectedScenarios, { ScenarioId: viewModel.activeScenario.ScenarioId });
      var selectedSenarioId = scenarios.length == 0 ? 0 : scenarios[0].ScenarioId;
      viewModel.copyAllocationViewModel = kendo.observable({
        selectedSenarioId: selectedSenarioId,
        scenarios: scenarios,
        code: selectedSenarioId,
        freq0: true,
        freq1: true,
        freq2: true,
        freq3: true,
        freq033: true,
        freq05: true,
        freq4: true,
        cancel: function () {
          viewModel.editorWindow.close();
        },
        add: function () {
          if (viewModel.validator.validate()) {
            window.showOverlay();
            var frequencies = "";
            if (viewModel.copyAllocationViewModel.freq0) {
              frequencies += "0,";
            }
            if (viewModel.copyAllocationViewModel.freq1) {
              frequencies += "1,";
            }
            if (viewModel.copyAllocationViewModel.freq2) {
              frequencies += "2,";
            }
            if (viewModel.copyAllocationViewModel.freq3) {
              frequencies += "3,";
            }
            if (viewModel.copyAllocationViewModel.freq4) {
              frequencies += "4,";
            }
            if (viewModel.copyAllocationViewModel.freq033) {
              frequencies += "0.33,";
            }
            if (viewModel.copyAllocationViewModel.freq05) {
              frequencies += "0.5,";
            }
            $.ajax({
              type: "POST",
              url: "/api/allocation/" + viewModel.allocationViewModel.selectedAllocation.AllocationId + "/copy/" + viewModel.copyAllocationViewModel.selectedSenarioId + "?frequencies=" + frequencies,
              beforeSend: function (req) {
                req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
              },
              dataType: "JSON"
            }).done(function () {
              window.hideOverlay();
              viewModel.editorWindow.close();
              if (viewModel.activeScenario.ScenarioId === viewModel.copyAllocationViewModel.selectedSenarioId) {
                viewModel.allocationViewModel.allocations.read();
              }
            });
          }
        }
      });
      setValidator('copyAllocationForm', '/api/scenario/{0}/allocation/exists/' + viewModel.allocationViewModel.selectedAllocation.Code, viewModel.copyAllocationViewModel);
      kendo.bind($("#copyAllocationForm"), viewModel.copyAllocationViewModel);
      viewModel.editorWindow.open().center();
    },
    exportAllocation: function () {
      location.href = "/Calendar/Export?allocationId=" + viewModel.allocationViewModel.selectedAllocation.AllocationId + "&date=" + viewModel.allocationViewModel.selectedDate.toJSONLocal();
    },
    exportAllocationToPdf: function () {
      var domObjectToExport = $('#scheduler-' + viewModel.activeScenario.ScenarioId);
      var header = "<div class='exportHeader' style='text-align:center'><b>Sales Drive:</b>&nbsp;" + viewModel.activeScenario.Name + "&nbsp;&nbsp;&nbsp;<b>Territory:</b>&nbsp;" + viewModel.allocationViewModel.selectedAllocation.Name + "</div>";
      domObjectToExport.prepend(header);
      kendo.drawing.drawDOM(domObjectToExport).then(function (group) {
        kendo.drawing.pdf.saveAs(group, viewModel.activeScenario.Code + "_" + viewModel.allocationViewModel.selectedAllocation.Code + ".pdf");
        $('.exportHeader').remove();
      });

    },
    onExportSelect: function (e) {
      var menu = e.item.id;
      switch (menu) {
        case "exportToOutlook":
          location.href = "/Calendar/Export?allocationId=" + viewModel.allocationViewModel.selectedAllocation.AllocationId + "&date=" + viewModel.allocationViewModel.selectedDate.toJSONLocal();
          break;
        case "exportToPdf":
          var domObjectToExport = $('#scheduler-' + viewModel.activeScenario.ScenarioId);
          var header = "<div class='exportHeader' style='text-align:center'><b>Sales Drive:</b>&nbsp;" + viewModel.activeScenario.Name + "&nbsp;&nbsp;&nbsp;<b>Territory:</b>&nbsp;" + viewModel.allocationViewModel.selectedAllocation.Name + "</div>";
          domObjectToExport.prepend(header);
          kendo.drawing.drawDOM(domObjectToExport).then(function (group) {
            kendo.drawing.pdf.saveAs(group, viewModel.activeScenario.Code + "_" + viewModel.allocationViewModel.selectedAllocation.Code + ".pdf");
            $('.exportHeader').remove();
          });
          break;

        default:
      }
    },
    editAllocation: function () {
      var template = kendo.template($("#allocation-template").html());
      viewModel.editorWindow.content(template({}));
      viewModel.editorWindow.title("Edit " + resources.Tags.Allocation.Header);
      viewModel.editorWindow.setOptions({
        width: 600
      });
      viewModel.editAllocationViewModel = kendo.observable({
        id: viewModel.allocationViewModel.selectedAllocation.AllocationId,
        code: viewModel.allocationViewModel.selectedAllocation.Code,
        oldCode: viewModel.allocationViewModel.selectedAllocation.Code,
        name: viewModel.allocationViewModel.selectedAllocation.Name,
        travelPercent: viewModel.allocationViewModel.selectedAllocation.TravelPercent,
        selectedColor: viewModel.allocationViewModel.selectedAllocation.ColourCode,
        codeLabel: resources.Tags.Allocation.Code.Title,
        nameLabel: resources.Tags.Allocation.Name.Title,
        colourCodeLabel: resources.Tags.Allocation.ColourCode.Title,
        travelPercentLabel: resources.Tags.Allocation.TravelPercent.Title,
        workloadTemplateLabel: resources.Tags.Allocation.WorkloadTemplate.Title,
        selectedWorkloadTemplateId: viewModel.allocationViewModel.selectedAllocation.WorkloadTemplateId,
        workloadTemplates: viewModel.allocationViewModel.workloadTemplates,
        cancel: function () {
          viewModel.editorWindow.close();
        },
        submit: function () {
          if (viewModel.validator.validate()) {
            window.showOverlay();
            $.ajax({
              type: "PUT",
              url: "/api/allocation/" + viewModel.editAllocationViewModel.id + "/update",
              beforeSend: function (req) {
                req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
              },
              dataType: "JSON",
              data: {
                AllocationId: viewModel.editAllocationViewModel.id,
                Code: viewModel.editAllocationViewModel.code,
                Name: viewModel.editAllocationViewModel.name,
                TravelPercent: viewModel.editAllocationViewModel.travelPercent,
                ScenarioId: viewModel.activeScenario.ScenarioId,
                ColourCode: viewModel.editAllocationViewModel.selectedColor,
                WorkloadTemplateId: viewModel.editAllocationViewModel.selectedWorkloadTemplateId == -1 ? null : viewModel.editAllocationViewModel.selectedWorkloadTemplateId
              }
            }).done(function () {
              window.hideOverlay();
              viewModel.editorWindow.close();
              viewModel.allocationViewModel.allocations.remove(viewModel.allocationViewModel.selectedAllocation);
              viewModel.allocationViewModel.allocations.read();
            });
          }
        }
      });
      setValidator('allocationForm', '/api/scenario/' + viewModel.activeScenario.ScenarioId + '/allocation/exists/{0}', viewModel.editAllocationViewModel);
      kendo.bind($("#allocationForm"), viewModel.editAllocationViewModel);
      viewModel.editorWindow.open().center();
    },
    deleteAllocation: function () {
      window.confirmationWindow.content(window.windowTemplate({ message: "Are you sure you want to delete " + resources.Tags.Allocation.Header + " " + viewModel.allocationViewModel.selectedAllocation.Name + "?" }));
      window.confirmationWindow.title("Delete " + resources.Tags.Allocation.Header);
      window.confirmationWindow.open().center();
      $("#yesButton").click(function () {
        var allocationId = viewModel.allocationViewModel.selectedAllocation.AllocationId;
        $.ajax({
          type: "DELETE",
          url: "/api/allocation/" + allocationId,
          beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
          },
          dataType: "JSON",
        }).done(function () {
          window.confirmationWindow.close();
          viewModel.allocationViewModel.allocations.read();
        });
      });
      $("#noButton").click(function () {
        window.confirmationWindow.close();
      });
    },
    toggleSidebar: function () {
      var splitter = $('#scheduler-' + viewModel.activeScenario.ScenarioId).parent().parent().parent();
      var panes = splitter.children(".k-pane");

      var rightPane = panes[1];

      splitter.data("kendoSplitter").toggle(rightPane, $(rightPane).width() <= 0);
    },
    onChange: function () {
      loadScheduler(viewModel.allocationViewModel.selectedAllocation, viewModel.allocationViewModel.selectedDate.toJSONLocal());
      loadUnallocatedVisits(viewModel.allocationViewModel.selectedAllocation);
      loadNonCalledList(viewModel.allocationViewModel.selectedAllocation);
    },
    onDateChange: function () {
      loadScheduler(viewModel.allocationViewModel.selectedAllocation, viewModel.allocationViewModel.selectedDate.toJSONLocal());
    },
    onSelect: function (e) {
      var item = e.sender.dataItem(e.item);
      viewModel.allocationViewModel.set("selectedAllocationId", item.AllocationId);
      localStorage["app-selectedAllocationId" + "-" + $("#logged-username").text()] = kendo.stringify(item.AllocationId);
    },
    onDataBound: function (e) {
      viewModel.allocationViewModel.set("isAllocationsVisible", e.data.allocations.total() > 0);
      viewModel.allocationViewModel.set("isCopyVisible", e.data.allocations.total() > 0);
      viewModel.allocationViewModel.set("isExportVisible", e.data.allocations.total() > 0);
      viewModel.allocationViewModel.set("isEditVisible", e.data.allocations.total() > 0 && (!viewModel.activeScenario.ReadOnly || $('#isAdmin').val() === 'True'));
      viewModel.allocationViewModel.set("isDeleteVisible", e.data.allocations.total() > 0 && (!viewModel.activeScenario.ReadOnly || $('#isAdmin').val() === 'True'));
      viewModel.allocationViewModel.set("isSchedulerVisible", e.data.allocations.total() > 0);
      if (viewModel.allocationViewModel.selectedAllocationId != null) {
        var current = _.findWhere(e.data.allocations._data, { AllocationId: kendo.parseInt(viewModel.allocationViewModel.selectedAllocationId) });
        if (typeof current !== 'undefined' && current !== null) {
          viewModel.allocationViewModel.set("selectedAllocation", current);
        } else {
          viewModel.allocationViewModel.set("selectedAllocation", e.data.allocations._data.length > 0 ? e.data.allocations._data[0] : null);
          localStorage["app-" + cookieId + "-selectedAllocationId" + "-" + $("#logged-username").text()] = e.data.allocations._data.length > 0 ? kendo.stringify(e.data.allocations._data[0].AllocationId) : null;
        }
      } else {
        if (typeof localStorage["app-" + cookieId + "-selectedAllocationId" + "-" + $("#logged-username").text()] != 'undefined' && localStorage["app-" + cookieId + "-selectedAllocationId" + "-" + $("#logged-username").text()] !== null) {
          var selectedAllocationId = JSON.parse(localStorage["app-" + cookieId + "-selectedAllocationId" + "-" + $("#logged-username").text()]);
          var currentAllocation = _.findWhere(e.data.allocations._data, { AllocationId: kendo.parseInt(selectedAllocationId) });
          if (typeof currentAllocation !== 'undefined' && currentAllocation !== null) {
            viewModel.allocationViewModel.set("selectedAllocation", currentAllocation);
          } else {
            viewModel.allocationViewModel.set("selectedAllocation", e.data.allocations._data.length > 0 ? e.data.allocations._data[0] : null);
            localStorage["app-" + cookieId + "-selectedAllocationId" + "-" + $("#logged-username").text()] = e.data.allocations._data.length > 0 ? kendo.stringify(e.data.allocations._data[0].AllocationId) : null;
          }
        } else {
          viewModel.allocationViewModel.set("selectedAllocation", e.data.allocations._data.length > 0 ? e.data.allocations._data[0] : null);
          localStorage["app-" + cookieId + "-selectedAllocationId" + "-" + $("#logged-username").text()] = e.data.allocations._data.length > 0 ? kendo.stringify(e.data.allocations._data[0].AllocationId) : null;
        }
      }
      viewModel.allocationViewModel.set("availableAllocations", e.data.allocations._data);
      e.sender.trigger("change");
    }
  }
});

function swapCallDayVisits(fromCallDay, toCallDay, isRequiredToUpdateCalander) {
  if (viewModel.allocationViewModel.selectedAllocation == null) {
    viewModel.editorWindow.close();
    return;
  }
  window.showOverlay();
  $.ajax({
    type: "PUT",
    url: "/api/allocation/" + viewModel.allocationViewModel.selectedAllocation.AllocationId + "/swap?date=" + viewModel.allocationViewModel.selectedDate.toJSONLocal() + "&fromCallDay=" + fromCallDay + "&toCallDay=" + toCallDay + "&isRequiredToUpdateCalander=" + isRequiredToUpdateCalander,
    beforeSend: function (req) {
      req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
    },
    dataType: "JSON"
  }).done(function () {
    window.hideOverlay();
    viewModel.editorWindow.close();
    $("#scheduler-" + viewModel.allocationViewModel.selectedAllocation.ScenarioId).data("kendoScheduler").dataSource.read();
  });
}

function setValidator(formId, urlFormat, model) {
  viewModel.validator = $("#" + formId).kendoValidator({
    rules: {
      availability: function (input) {
        var validate = input.data('available');
        if (typeof validate !== 'undefined' && validate !== false) {
          var id = input.attr('id');
          if (model.code === model.oldCode)
            return true;
          var cache = availability.cache[id] = availability.cache[id] || {};
          cache.checking = true;
          if (cache.value === input.val() && cache.valid) {
            // the value is available
            return true;
          }
          if (cache.value === input.val() && !cache.valid) {
            // the value is not available
            cache.checking = false;
            return false;
          }
          availability.check(input, urlFormat.format(input.val()));
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
    check: function (element, url) {
      var id = element.attr('id');
      var cache = this.cache[id] = this.cache[id] || {};
      $.ajax({
        url: url,
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

function unlockLockScenario(lock) {
  $.ajax({
    type: "PUT",
    url: "/api/scenario/" + viewModel.activeScenario.ScenarioId + "?isLocked=" + lock,
    beforeSend: function (req) {
      req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
    },
    dataType: "JSON",
  }).done(function () {
    viewModel.editorWindow.close();
    viewModel.set("isEditVisible", !lock || $('#isAdmin').val() === 'True');
    viewModel.set("isDeleteVisible", !lock || $('#isAdmin').val() === 'True');
    viewModel.set("isLockVisible", !lock);
    viewModel.set("isUnlockVisible", lock);
    viewModel.set("isSwapVisible", !lock || $('#isAdmin').val() === 'True');
    viewModel.allocationViewModel.set("isCreateVisible", !lock || $('#isAdmin').val() === 'True');
    viewModel.allocationViewModel.set("isEditVisible", viewModel.allocationViewModel.selectedAllocation !== null && (!lock || $('#isAdmin').val() === 'True'));
    viewModel.allocationViewModel.set("isDeleteVisible", viewModel.allocationViewModel.selectedAllocation !== null && (!lock || $('#isAdmin').val() === 'True'));
    viewModel.activeScenario.set("ReadOnly", lock);
    if (lock) {
      $("#scheduler-" + viewModel.activeScenario.ScenarioId).find('.k-event .k-event-actions').hide();
      $("#lock-" + viewModel.activeScenario.ScenarioId).show();
    } else {
      $("#scheduler-" + viewModel.activeScenario.ScenarioId).find('.k-event .k-event-actions').show();
      $("#lock-" + viewModel.activeScenario.ScenarioId).hide();
    }
  });
}

function init() {
  var isAutoLoad = false;
  var options = localStorage["app-" + cookieId + "-Selected-Scenarios" + "-" + $("#logged-username").text()];
  if (options) {
    viewModel.selectedScenarios = JSON.parse(options);
    isAutoLoad = viewModel.selectedScenarios.length > 0;
  }
  loadScenarios(isAutoLoad);
}

function setActionButtons() {
  if (viewModel.activeScenario != null) {
    viewModel.set("isCopyVisible", true);
    viewModel.set("isEditVisible", !viewModel.activeScenario.ReadOnly || $('#isAdmin').val() === 'True');
    viewModel.set("isDeleteVisible", !viewModel.activeScenario.ReadOnly || $('#isAdmin').val() === 'True');
    viewModel.set("isSwapVisible", !viewModel.activeScenario.ReadOnly || $('#isAdmin').val() === 'True');
    viewModel.set("isLockVisible", (!viewModel.activeScenario.ReadOnly && $('#isAdmin').val() === 'True'));
    viewModel.set("isUnlockVisible", (viewModel.activeScenario.ReadOnly && $('#isAdmin').val() === 'True'));
    viewModel.allocationViewModel.set("isCreateVisible", !viewModel.activeScenario.ReadOnly || $('#isAdmin').val() === 'True');
  }
}

function changeActiveTab(e) {
  var item = $(e.item).closest(".k-item");
  var index = item.index();
  viewModel.allocationViewModel.set("selectedAllocationId", null);
  if (viewModel.selectedScenarios.length > 0) {
    viewModel.set("activeScenario", viewModel.selectedScenarios[index]);
    viewModel.activeTabIndex = index;
    localStorage["app-" + cookieId + "-Active-Scenario" + "-" + $("#logged-username").text()] = kendo.stringify(viewModel.selectedScenarios[index]);
  } else {
    viewModel.activeScenario = null;
    viewModel.activeTabIndex = null;
  }
  saveOrUpdateLocalStorageTabIndex();
  setActionButtons();
  var scenarioId = 0;
  if (viewModel.activeScenario != null) {
    scenarioId = viewModel.activeScenario.ScenarioId;
    viewModel.allocationViewModel.set("currentSenarioName", viewModel.activeScenario.Name);
    viewModel.allocationViewModel.set("selectedDate", viewModel.activeScenario.ScenarioDateString == null ? new Date() : kendo.parseDate(viewModel.activeScenario.ScenarioDateString, "dd/MM/yyyy"));
    viewModel.allocationViewModel.set("isCallDayDatepickerVisible", viewModel.activeScenario.ScenarioDateString === null);
    viewModel.allocationViewModel.set("selectedDateText", viewModel.activeScenario.ScenarioDateString);
  }
  viewModel.allocationViewModel.allocations = new kendo.data.DataSource({
    transport: {
      read: {
        dataType: "JSON",
        url: "/api/scenario/" + scenarioId + "/allocations",
        beforeSend: function (req) {
          req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
        }
      }
    }
  });
  viewModel.allocationViewModel.unallocatedVisits = new kendo.data.DataSource({
    transport: {
      read: {
        dataType: "JSON",
        url: "/api/allocation/-1/unallocatedVisits/?date=" + viewModel.allocationViewModel.selectedDate.toJSONLocal(),
        beforeSend: function (req) {
          req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
        }
      }
    }
  });

  viewModel.allocationViewModel.nonCalledList = new kendo.data.DataSource({
    transport: {
      read: {
        dataType: "JSON",
        url: "/api/allocation/-1/nonCalled",
        beforeSend: function (req) {
          req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
        }
      }
    },
    schema: {
      data: "Data", total: "Total",
      model: {
        id: "ContractId",
        fields: {
          ContractId: { type: 'number', editable: false },
          MapCode: { type: 'string', editable: false },
          VisitTimes: { type: 'string', editable: false },
          MapName: { type: 'string', editable: false }
        }
      }
    },
    pageSize: 20,
    serverPaging: true,
    serverFiltering: true,
    serverSorting: true,
    serverGrouping: false,
  });

  viewModel.allocationViewModel.nonCalledSearch = function (ev) {
    var search = $(ev.target).val();
    if (search != "") {
      viewModel.allocationViewModel.nonCalledList.filter({
        logic: "or",
        filters: [
          { field: "MapCode", operator: "contains", value: search },
          { field: "MapName", operator: "contains", value: search }
        ]
      });
    } else {
      viewModel.allocationViewModel.nonCalledList.filter({});
    }
  }

  viewModel.allocationViewModel.onNonCalledListDatabound = function (ev) {
    viewModel.allocationViewModel.set("isNonCalledListVisible", ev.data.nonCalledList.total() > 0);
    $('.contract-item').click(function () {
      $(this).siblings().removeClass("dragoption");
      $(this).addClass("dragoption");
    });
    $(".contract-item ").dblclick(function () {
      var uid = $(this).data("uid");
      var currentContract = viewModel.allocationViewModel.nonCalledList.getByUid(uid);
      var contractTemplate = kendo.template($("#contract-template").html());
      viewModel.editorWindow.content(contractTemplate({}));
      viewModel.editorWindow.title("Contract");
      viewModel.editorWindow.setOptions({
        width: 500
      });
      var visitTimesData = currentContract.VisitTimes != null ? currentContract.VisitTimes.split(",") : [];
      viewModel.contractViewModel = kendo.observable({
        contractId: currentContract.ContractId,
        allocationId: currentContract.AllocationId,
        allocation: currentContract.AllocationName,
        allocations: viewModel.allocationViewModel.availableAllocations,
        mappoint: currentContract.Mappoint,
        okButtonText: "Ok",
        frequencies: viewModel.allocationViewModel.frequencies,
        frequency: (currentContract.Frequency == null || currentContract.Frequency === 0) ? 0 : currentContract.Frequency,
        onFrequencyChange: function () {
          if (viewModel.contractViewModel.frequency === 0) {
            viewModel.contractViewModel.set("okButtonText", "Ok");
          } else {
            viewModel.contractViewModel.set("okButtonText", "Add Visit");
          }
        },
        visitTime: currentContract.VisitTime,
        visitTimes: toTextValueArray(visitTimesData),
        isVisitTimeDropdownVisible: visitTimesData.length > 0,
        isVisitTimeTextboxVisible: !visitTimesData.length > 0,
        isEditable: !viewModel.activeScenario.ReadOnly || $('#isAdmin').val() === 'True',
        isReadOnly: viewModel.activeScenario.ReadOnly && $('#isAdmin').val() !== 'True',
        vTime: currentContract.VisitTime,
        flagfall: currentContract.Flagfall,
        addVisits: function () {
          viewModel.editorWindow.close();
          if (viewModel.contractViewModel.frequency === 0) {
            return;
          }
          newVisitConfirmation();
        },
        ok: function () {
          viewModel.editorWindow.close();
        },
        cancel: function () {
          viewModel.editorWindow.close();
        },
      });
      kendo.bind($("#contractForm"), viewModel.contractViewModel);
      viewModel.editorWindow.open().center();
    });
  }

  viewModel.allocationViewModel.onUnallocatedVisitsDataBound = function (ev) {
    viewModel.allocationViewModel.set("isUnallocatedVisitsVisible", ev.data.unallocatedVisits.total() > 0);
    $('.list-item').click(function (event) {
      if (event.ctrlKey) {
        $(this).toggleClass("dragoption");
      } else {
        $(this).siblings().removeClass("dragoption");
        $(this).addClass("dragoption");
      }
    });
    $(".list-item").dblclick(function () {
      var uid = $(this).data("uid");
      var currentUnallocatedVisit = viewModel.allocationViewModel.unallocatedVisits.getByUid(uid);
      var currentScheduler = $("#scheduler-" + currentUnallocatedVisit.ScenarioId).data("kendoScheduler");
      var unassignedVisitTemplate = kendo.template($("#visit-template").html());
      viewModel.editorWindow.content(unassignedVisitTemplate({}));
      viewModel.editorWindow.title("Unassigned Visit");
      viewModel.editorWindow.setOptions({
        width: 500
      });
      var visitTimesData = currentUnallocatedVisit.VisitTimes != null ? currentUnallocatedVisit.VisitTimes.split(",") : [];

      viewModel.unallocatedVisitViewModel = kendo.observable({
        allocations: viewModel.allocationViewModel.availableAllocations,
        visitTypes: viewModel.allocationViewModel.visitTypes,
        frequencies: viewModel.allocationViewModel.frequencies,
        id: currentUnallocatedVisit.Id,
        visitId: currentUnallocatedVisit.Id,
        allocationId: currentUnallocatedVisit.AllocationId,
        mappointCode: currentUnallocatedVisit.MapCode,
        mappointName: currentUnallocatedVisit.MapName,
        mappointType: currentUnallocatedVisit.MappointType,
        mappointCodeLabel: resources.Tags.MapPoint.Header + " " + resources.Tags.MapPoint.Code.Title,
        mappointNameLabel: resources.Tags.MapPoint.Header + " " + resources.Tags.MapPoint.Name.Title,
        mapPointTypeLabel: resources.Tags.MapPoint.MapPointType.Title,
        detail1Label: resources.Tags.MapPoint.Detail1.Title,
        detail2Label: resources.Tags.MapPoint.Detail2.Title,
        detail3Label: resources.Tags.MapPoint.Detail3.Title,
        detail1: currentUnallocatedVisit.Detail1,
        detail2: currentUnallocatedVisit.Detail2,
        detail3: currentUnallocatedVisit.Detail3,
        frequency: currentUnallocatedVisit.Frequency,
        visitTimes: toTextValueArray(visitTimesData),
        isVisitTimeDropdownVisible: visitTimesData.length > 0,
        isVisitTimeTextboxVisible: !visitTimesData.length > 0,
        vTime: currentUnallocatedVisit.VisitTime,
        visitTime: currentUnallocatedVisit.VisitTime,
        flagfall: currentUnallocatedVisit.Flagfall,
        visitDate: null,
        sequence: currentUnallocatedVisit.Sequence,
        arrive: currentUnallocatedVisit.Arrive,
        depart: currentUnallocatedVisit.Depart,
        hasPendingActions: currentUnallocatedVisit.HasPendingActions,
        visitTypeId: currentUnallocatedVisit.VisitTypeId,
        isEditable: !viewModel.activeScenario.ReadOnly || $('#isAdmin').val() === 'True',
        isReadOnly: viewModel.activeScenario.ReadOnly && $('#isAdmin').val() !== 'True'
      });

      kendo.bind($("#visitForm"), viewModel.unallocatedVisitViewModel);
      if ($('#isReadOnly').val() === 'True') {
        $('#allocationDropDown').data("kendoDropDownList").readonly();
        $('#visitTypeDropDown').data("kendoDropDownList").readonly();
      }
      $('#unAllocateVisit').hide();
      $('.k-scheduler-cancel').unbind("click");
      $('.k-scheduler-cancel').bind("click", function () {
        viewModel.editorWindow.close();
      });
      $('.deleteVisit').unbind("click");
      $('.deleteVisit').bind("click", function () {
        if (viewModel.unallocatedVisitViewModel.frequency >= 2) {
          window.confirmationWithCancelWindow.content(window.confirmationWithCancelWindowTemplate({ message: "Do you want to delete related visits?" }));
          window.confirmationWithCancelWindow.title("Delete Related Visits");
          window.confirmationWithCancelWindow.open().center();
          $("#yesButtonConfirmtion").click(function () {
            window.confirmationWithCancelWindow.close();
            deleteVisit(viewModel.unallocatedVisitViewModel.visitId, currentScheduler, true);
          });
          $("#noButtonConfirmtion").click(function () {
            window.confirmationWithCancelWindow.close();
            deleteVisit(viewModel.unallocatedVisitViewModel.visitId, currentScheduler, false);
          });
          $("#cancelButtonConfirmtion").click(function () {
            window.confirmationWithCancelWindow.close();
          });
        } else {
          window.confirmationWindow.content(window.windowTemplate({ message: "Do you want to delete current unassigned visit?" }));
          window.confirmationWindow.title("Delete Unassigned Visit");
          window.confirmationWindow.open().center();
          $("#yesButton").click(function () {
            window.confirmationWindow.close();
            deleteVisit(viewModel.unallocatedVisitViewModel.visitId, currentScheduler, false);
          });
          $("#noButton").click(function () {
            window.confirmationWindow.close();
          });
        }
      });
      $('#updateVisit').unbind("click");
      $('#updateVisit').bind("click", function () {
        saveData(viewModel.unallocatedVisitViewModel, currentScheduler);
      });
      viewModel.editorWindow.open().center();
    });
    if ($('#isReadOnly').val() === 'False') {
      $(".list-item").kendoDraggable({
        hint: function () {
          var hint = $(".dragoptions").clone();
          hint.children().not(".dragoption").remove();
          return $(hint);
        },
        dragstart: function (event) {
          if ((viewModel.activeScenario.ReadOnly && $('#isAdmin').val() !== 'True') || event.sender.element[0].className === 'list-item') {
            event.preventDefault();
          }
        },
        drag: function (event) {
          var windowY = $(window).innerHeight();
          if ((event.clientY + 100) > windowY && (($(window).scrollTop() + $(window).height() + 100) < $(document).height())) {
            $(window).scrollTop($(window).scrollTop() + 20);
          } else if ((event.clientY - 200) < 0) {
            $(window).scrollTop($(window).scrollTop() - 20);
          }
        },
        cursorOffset: { top: 0, left: 0 }
      });
    }
  }
  viewModel.allocationViewModel.schedulerId = "scheduler-" + scenarioId;
  var template = kendo.template($("#tabTemplate").html());
  $(e.contentElement).html(template(viewModel.allocationViewModel));
  kendo.bind(e.contentElement, viewModel.allocationViewModel);
}

function loadScenarios(isAutoLoad) {
  $.ajax({
    type: "GET",
    url: "/api/scenarios",
    dataType: "JSON",
    beforeSend: function (req) {
      req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
    }
  }).done(function (scenarios) {
    var selected = [];
    $(scenarios).each(function () {
      var current = _.findWhere(viewModel.selectedScenarios, { ScenarioId: this.ScenarioId });
      if (typeof current !== 'undefined' && current !== null) {
        selected.push(this);
      }
    });
    viewModel.set("selectedScenarios", selected);
    var template = kendo.template($("#openScenarios-template").html());
    viewModel.editorWindow.content(template({}));
    viewModel.editorWindow.title("Open " + resources.Tags.Scenario.Header);
    viewModel.editorWindow.setOptions({
      width: 400
    });
    viewModel.openScenarioViewModel = kendo.observable({
      scenarios: scenarios,
      selected: selected,
      cancel: function () {
        viewModel.editorWindow.close();
      },
      save: function () {
        viewModel.selectedScenarios = viewModel.openScenarioViewModel.selected;
        saveOrUpdateLocalStorageSenarios();
        viewModel.editorWindow.close();
        createScenarioTabs(0);
      }
    });
    kendo.bind($("#openSenariosForm"), viewModel.openScenarioViewModel);
    if (isAutoLoad) {
      var tabIndex = localStorage["app-" + cookieId + "-Tab-Index" + "-" + $("#logged-username").text()];
      createScenarioTabs((typeof (tabIndex) != 'undefined' && tabIndex != null) ? tabIndex : 0);
      return;
    }
    viewModel.editorWindow.open().center();
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

function createScenarioTabs(tabIndex) {
  var currentTabstrip = $("#tabStrip").data("kendoTabStrip");
  if (currentTabstrip) {
    currentTabstrip.destroy();
  }
  $("#tabStrip").kendoTabStrip(
  {
    select: function (e) {
      changeActiveTab(e);
    }
  });
  var tabStrip = $("#tabStrip").data("kendoTabStrip");
  tabStrip.tabGroup.off("click", "[data-type='remove']");
  tabStrip.tabGroup.on("click", "[data-type='remove']", function (e) {
    e.preventDefault();
    e.stopPropagation();
    window.confirmationWindow.content(window.windowTemplate({ message: "Are you sure you want to close this " + resources.Tags.Scenario.Header + "?" }));
    window.confirmationWindow.title("Close " + resources.Tags.Scenario.Header);
    window.confirmationWindow.open().center();
    $("#yesButton").click(function () {
      var id = e.currentTarget.id;
      var scenarioId = kendo.parseInt(id);
      viewModel.selectedScenarios = _.reject(viewModel.selectedScenarios, { ScenarioId: scenarioId });
      saveOrUpdateLocalStorageSenarios();
      var item = $(e.target).closest(".k-item");
      tabStrip.remove(item.index());
      window.confirmationWindow.close();
      viewModel.activeTabIndex = $("#tabStrip").data("kendoTabStrip").select().index();
      saveOrUpdateLocalStorageTabIndex();
      if (viewModel.activeScenario.ScenarioId === scenarioId) {
        $("#tabStrip").data("kendoTabStrip").select(0);
      }
    });
    $("#noButton").click(function () {
      window.confirmationWindow.close();
    });
  });
  $($("#tabStrip").find(".k-item")).each(function () {
    var item = $(this).closest(".k-item");
    tabStrip.remove(item.index());
  });
  $(viewModel.selectedScenarios).each(function () {
    tabStrip.append({
      text: '<i id="lock-' + this.ScenarioId + '" class="fa fa-lock" aria-hidden="true"></i> <label id="tabText-' + this.ScenarioId + '" style="width: 150px; font-weight: bold;">' + this.Code + '</label><button id="' + this.ScenarioId + '" data-type="remove" class="k-button k-button-icon"><span class="k-icon k-i-close"></span></button>',
      encoded: false,
      content: ""
    });
    if (this.ReadOnly) {
      $("#lock-" + this.ScenarioId).show();
    } else {
      $("#lock-" + this.ScenarioId).hide();
    }
  });
  $("#tabStrip").data("kendoTabStrip").select(viewModel.selectedScenarios.length > tabIndex ? tabIndex : 0);
}

$(function () {
  authCookie = $.cookie(window.authCookieKeyName);
  cookieId = $('#cookieId').val();
  subscribeToSchedulerUpdate();
  loadCommonData();
  viewModel.editorWindow = $("#editorWindow").kendoWindow({
    modal: true,
    visible: false,
    resizable: false
  }).data("kendoWindow");
  viewModel.init();
  window.kendo.bind($("#schedulerView"), viewModel);
  kendo.bind($('#splitter'), {});
});

function loadUnallocatedVisits(allocation) {
  if (typeof allocation === 'undefined' || allocation === null) return;
  viewModel.allocationViewModel.unallocatedVisits.options.transport.read.url = "/api/allocation/" + allocation.AllocationId + "/unallocatedVisits/?date=" + viewModel.allocationViewModel.selectedDate.toJSONLocal();
  viewModel.allocationViewModel.unallocatedVisits.read();
}

function loadNonCalledList(allocation) {
  if (typeof allocation === 'undefined' || allocation === null) return;
  viewModel.allocationViewModel.nonCalledList.options.transport.read.url = "/api/allocation/" + allocation.AllocationId + "/nonCalled";
  viewModel.allocationViewModel.nonCalledList.read();
}

function loadScheduler(allocation, selectedDate) {
  if (typeof allocation === 'undefined' || allocation === null) return;
  $.when(loadCallDayData()).done(function () {
    var visits = new kendo.data.SchedulerDataSource({
      transport: {
        read: {
          dataType: "JSON",
          url: "/api/allocation/" + allocation.AllocationId + "/visits?date=" + selectedDate,
          beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
          }
        }
      },
      schema: {
        model: {
          id: "visitId",
          fields: {
            visitId: { from: "VisitId", type: "number" },
            title: { from: "Title" },
            start: { from: "Start", type: "date" },
            end: { from: "End", type: "date" },
            mappointCode: { from: "MappointCode" },
            mappointName: { from: "MappointName" },
            mappointType: { from: "MappointType" },
            detail1: { from: "Detail1" },
            detail2: { from: "Detail2" },
            detail3: { from: "Detail3" },
            frequency: { from: "Frequency", type: "number" },
            visitTime: { from: "VisitTime", type: "number" },
            flagfall: { from: "Flagfall", type: "number" },
            visitDate: { from: "VisitDateString" },
            arrive: { from: "ArriveString" },
            depart: { from: "DepartString" },
            travelTime: { from: "TravelTimeString" },
            distance: { from: "DistanceString" },
            tooltip: { from: "Tooltip" },
            sequence: { from: "Sequence", type: "number" },
            key: { from: "Key", type: "number" },
            hasRelatedVisits: { from: "HasRelatedVisits", type: "boolean" },
            hasPendingActions: { from: "HasPendingActions", type: "boolean" }
          }
        }
      }
    });
    var currentScheduler = $("#scheduler-" + allocation.ScenarioId).data("kendoScheduler");
    if (currentScheduler) {
      currentScheduler.dataSource.options.transport.read.url = "/api/allocation/" + allocation.AllocationId + "/visits?date=" + selectedDate;
      currentScheduler.dataSource.read();
      loadUnallocatedVisits(allocation);
    } else {
      currentScheduler = $("#scheduler-" + allocation.ScenarioId).kendoScheduler({
        date: new Date(2016, 1, 1),
        allDaySlot: false,
        views: [{ type: "month", selected: true, eventHeight: 20 }],
        footer: false,
        editable: {
          move: false,
          create: false,
          resize: false,
          confirmation: "Are you sure you want to delete this visit?",
          template: $("#visit-template").html()
        },
        remove: function (e) {
          e.preventDefault();
          if (e.event.frequency >= 2) {
            window.confirmationWithCancelWindow.content(window.confirmationWithCancelWindowTemplate({ message: "Do you want to delete related visits?" }));
            window.confirmationWithCancelWindow.title("Delete Related Visits");
            window.confirmationWithCancelWindow.open().center();
            $("#yesButtonConfirmtion").click(function () {
              window.confirmationWithCancelWindow.close();
              deleteVisit(e.event.id, currentScheduler, true);
            });
            $("#noButtonConfirmtion").click(function () {
              window.confirmationWithCancelWindow.close();
              deleteVisit(e.event.id, currentScheduler, false);
            });
            $("#cancelButtonConfirmtion").click(function () {
              window.confirmationWithCancelWindow.close();
            });
          } else {
            window.confirmationWindow.content(window.windowTemplate({ message: "Do you want to delete current visit?" }));
            window.confirmationWindow.title("Delete Visit");
            window.confirmationWindow.open().center();
            $("#yesButton").click(function () {
              window.confirmationWindow.close();
              deleteVisit(e.event.id, currentScheduler, false);
            });
            $("#noButton").click(function () {
              window.confirmationWindow.close();
            });
          }
        },
        edit: function (e) {
          if (e.event.id === -1) {
            e.preventDefault();
          }
          $('.k-popup-edit-form').css({ width: 500 });
          $('.k-edit-form-container').removeClass('k-edit-form-container').css('padding-left', 10).css('padding-right', 10);
          $('.k-edit-buttons').remove();
          $('.k-window-title').html("Visit");
          e.event.set('allocations', viewModel.allocationViewModel.availableAllocations);
          e.event.set('visitTypes', viewModel.allocationViewModel.visitTypes);
          e.event.set('frequencies', viewModel.allocationViewModel.frequencies);
          e.event.set('currentFrequency', e.event.frequency);
          e.event.set('allocationId', e.event.AllocationId);
          e.event.set('visitTypeId', e.event.VisitTypeId);
          e.event.set('isEditable', !viewModel.activeScenario.ReadOnly || $('#isAdmin').val() === 'True');
          e.event.set('isReadOnly', viewModel.activeScenario.ReadOnly && $('#isAdmin').val() !== 'True');
          e.event.set('visitTimes', toTextValueArray(e.event.VisitTimes));
          e.event.set('vTime', e.event.visitTime);
          e.event.set('isVisitTimeDropdownVisible', e.event.VisitTimes.length > 0);
          e.event.set('isVisitTimeTextboxVisible', !e.event.VisitTimes.length > 0);
          e.event.set('mappointCodeLabel', resources.Tags.MapPoint.Header + " " + resources.Tags.MapPoint.Code.Title);
          e.event.set('mappointNameLabel', resources.Tags.MapPoint.Header + " " + resources.Tags.MapPoint.Name.Title);
          e.event.set('mapPointTypeLabel', resources.Tags.MapPoint.MapPointType.Title);
          e.event.set('detail1Label', resources.Tags.MapPoint.Detail1.Title);
          e.event.set('detail2Label', resources.Tags.MapPoint.Detail2.Title);
          e.event.set('detail3Label', resources.Tags.MapPoint.Detail3.Title);

          $('#visitTypeDropDown').data("kendoDropDownList").readonly(viewModel.activeScenario.ReadOnly && $('#isAdmin').val() !== 'True');

          $('.deleteVisit').unbind("click");
          $('.deleteVisit').bind("click", function () {
            if (e.event.frequency >= 2) {
              window.confirmationWithCancelWindow.content(window.confirmationWithCancelWindowTemplate({ message: "Do you want to delete related visits?" }));
              window.confirmationWithCancelWindow.title("Delete Related Visits");
              window.confirmationWithCancelWindow.open().center();
              $("#yesButtonConfirmtion").click(function () {
                window.confirmationWithCancelWindow.close();
                deleteVisit(e.event.id, currentScheduler, true);
              });
              $("#noButtonConfirmtion").click(function () {
                window.confirmationWithCancelWindow.close();
                deleteVisit(e.event.id, currentScheduler, false);
              });
              $("#cancelButtonConfirmtion").click(function () {
                window.confirmationWithCancelWindow.close();
              });
            } else {
              window.confirmationWindow.content(window.windowTemplate({ message: "Do you want to delete current visit?" }));
              window.confirmationWindow.title("Delete Visit");
              window.confirmationWindow.open().center();
              $("#yesButton").click(function () {
                window.confirmationWindow.close();
                deleteVisit(e.event.id, currentScheduler, false);
              });
              $("#noButton").click(function () {
                window.confirmationWindow.close();
              });
            }
          });
          if ($('#isReviewActions').val() === 'True') {
            $('#unAllocateVisit').removeClass('k-scheduler-delete');
            $('#unAllocateVisit').unbind("click");
            $('#unAllocateVisit').bind("click", function () {
              visitsUnallocationConfirmation(e.event.visitId, -1, currentScheduler, e.event.hasRelatedVisits);
            });
          }

          if ($('#isReadOnly').val() === 'True') {
            $('#visitTypeDropDown').data("kendoDropDownList").readonly();
            $('#allocationDropDown').data("kendoDropDownList").readonly();
          }
        },
        save: function (e) {
          e.preventDefault();
          saveData(e.event, currentScheduler);
        },
        messages: {
          deleteWindowTitle: "Delete Visit",
          destroy: "Delete"
        },
        cancel: function (e) {
          e.preventDefault();
          if (currentScheduler.dataSource.hasChanges()) {
            currentScheduler.dataSource.cancelChanges();
          }
          currentScheduler.refresh();
        },
        eventTemplate: $("#event-template").html(),
        dataSource: visits,
        dataBinding: function (e) {
          var widget = $(e.sender.wrapper);
          widget.find('.k-scheduler-table .k-today').removeClass('k-today');
          widget.find('.k-scheduler-toolbar').hide();

          widget.find('table tbody tr').each(function () {
            $(this).find("td").eq(6).hide();
            $(this).find("td").eq(5).hide();
            $(this).find("td").eq(4).show();
            $(this).find("td").eq(3).show();
            $(this).find("td").eq(2).show();
            $(this).find("td").eq(1).show();
            $(this).find("td").eq(0).show();
          });
          if (e.sender._selectedViewName === "month") {
            widget.find('table tbody tr th').eq(6).hide();
            widget.find('table tbody tr th').eq(5).hide();
            var $rows = widget.find(".k-scheduler-table tr");
            $rows.eq(1).hide();
            $rows.eq(6).hide();
            var index = 0;
            widget.find('.k-nav-day').each(function () {
              if ($(this).parent().is(':visible')) {
                index++;
                $(this).text(index);
                $(this).attr("id", "callDayId-" + index);
                $(this).addClass("calldaylink");
                $(this).unbind("click");
                $("#callDaySleepoutId-" + index).remove();
                $(this).click(function () {
                  var id = $(this).attr("id").substring(10, $(this).attr("id").length);
                  if ($('#isReadOnly').val() === 'False') {
                    editCallDayData(id);
                  }
                });
              }
            });
          } else {
            widget.find('table tbody tr th').eq(7).hide();
            widget.find('table tbody tr th').eq(6).hide();
          }

        },
        dataBound: function (ev) {
          if (ev.sender._data.length > 0) {
            $(ev.sender._data).each(function (index, visit) {
              if (visit.visitId === -1) {
                $("div[data-id='" + visit.visitId + "']").parent().parent().css("background-color", 'transparent').css("border-radius", "5px").css("border", "none");
                $("div[data-id='" + visit.visitId + "']").parent().parent().find('.k-event-actions').hide();
              } else {
                $("div[data-id='" + visit.visitId + "']").parent().css("background-color", visit.ColorCode).css("border-radius", "5px").css("border", "none");
              }
            });
          }
          if ((viewModel.activeScenario.ReadOnly && $('#isAdmin').val() !== 'True') || $('#isReadOnly').val() === 'True') {
            ev.sender.wrapper.find('.k-event .k-event-actions').hide();
          }
          if ($('#isReadOnly').val() === 'False') {
            $(".k-event").kendoDraggable({
              hint: function () {
                var container = "<div class='dragoptions k-widget k-listview visits' role='listbox' style='margin: 5px;' data-template='listView-template' data-role='listview'>";
                var items = $('.k-event .dragoption').clone();
                $(items).each(function () {
                  $(this).addClass('dragEvent');
                  container += this.outerHTML;
                });
                container += '</div>';
                return container;
              },
              dragstart: function (e) {
                if ((viewModel.activeScenario.ReadOnly && $('#isAdmin').val() !== 'True') || $(e.currentTarget).find('.k-event-template').attr('data-id') == "-1" || $(e.currentTarget).find('.k-event-template')[0].className !== 'k-event-template dragoption') {
                  e.preventDefault();
                }
              },
              drag: function (e) {
                var windowY = $(window).innerHeight();
                if ((e.clientY + 100) > windowY && (($(window).scrollTop() + $(window).height() + 100) < $(document).height())) {
                  $(window).scrollTop($(window).scrollTop() + 20);
                } else if ((e.clientY - 200) < 0) {
                  $(window).scrollTop($(window).scrollTop() - 20);
                }
              },
              cursorOffset: { top: 0, left: 0 }
            });
          }
          $('.k-event-template').click(function (event) {
            if ($(this).attr('data-id') != "-1") {
              if (event.ctrlKey) {
                $(this).toggleClass("dragoption");
              } else {
                $('.k-event-template').removeClass("dragoption");
                $(this).addClass("dragoption");
              }
            }
          });
          if ($('#isReadOnly').val() === 'False') {
            $(".k-event").kendoDropTarget({
              dragenter: function (e) {
                if ($(e.dropTarget).find('.k-event-template').attr('data-key') !== $(e.draggable.hint).find('.k-event-template').attr('data-key')) {
                  var callDay = $(e.dropTarget).find('.k-event-template').attr('data-callDay');
                  if (validateVisitMoves(e, callDay) === true) {
                    $('#callDayId-' + callDay).parent().addClass("cell-dragdrop");
                  } else {
                    $('#callDayId-' + callDay).parent().addClass("notallowed");
                  }
                  return;
                }
                e.dropTarget.addClass("dragdrop");
              },
              dragleave: function (e) {
                var callDay = $(e.dropTarget).find('.k-event-template').attr('data-callDay');
                $('#callDayId-' + callDay).parent().removeClass("cell-dragdrop");
                $('#callDayId-' + callDay).parent().removeClass("notallowed");
                e.dropTarget.removeClass("dragdrop");
              },
              drop: function (e) {
                if (typeof e.draggable.hint === 'undefined') return;
                e.draggable.hint.hide();
                if ($(e.dropTarget).find('.k-event-template').attr('data-key') !== $(e.draggable.hint).find('.k-event-template').attr('data-key')) {
                  var callDay = $(e.dropTarget).find('.k-event-template').attr('data-callDay');
                  $('#callDayId-' + callDay).parent().removeClass("cell-dragdrop");
                  $('#callDayId-' + callDay).parent().removeClass("notallowed");
                  if (validateVisitMoves(e, callDay) != true) return;
                  callDayActionSetup(e, callDay, currentScheduler);
                  return;
                }
                e.dropTarget.removeClass("dragdrop");
                changeVisitSequence($(e.draggable.hint).find('.k-event-template').attr('data-id'), $(e.dropTarget).find('.k-event-template').attr('data-id'), currentScheduler);
              }
            });
          }
          if ($('#isReadOnly').val() === 'False') {
            $(".k-scheduler-content .k-scheduler-table > tbody tr td").kendoDropTarget({
              dragenter: function (e) {
                var newCallDay = e.dropTarget[0].firstElementChild.innerText;
                if (validateVisitMoves(e, newCallDay) === true) {
                  e.dropTarget.addClass("cell-dragdrop");
                } else {
                  e.dropTarget.addClass("notallowed");
                }
              },
              dragleave: function (e) {
                e.dropTarget.removeClass("cell-dragdrop");
                e.dropTarget.removeClass("notallowed");
              },
              drop: function (e) {
                if (typeof e.draggable.hint === 'undefined') return;
                var newCallDay = e.dropTarget[0].firstElementChild.innerText;
                e.draggable.hint.hide();
                e.dropTarget.removeClass("cell-dragdrop");
                e.dropTarget.removeClass("notallowed");
                if (validateVisitMoves(e, newCallDay) != true) return;
                callDayActionSetup(e, newCallDay, currentScheduler);
              }
            });
          }
          $('.sleepOut').remove();
          for (var i = 0; i < viewModel.allocationViewModel.callDayData.length; i++) {
            $("#callDayId-" + viewModel.allocationViewModel.callDayData[i].CallDayNumber).css("float", "right");
            if (viewModel.allocationViewModel.callDayData[i].IsBlank) {
              $("#callDayId-" + viewModel.allocationViewModel.callDayData[i].CallDayNumber).parent().append("<span id='callDaySleepoutId-" + viewModel.allocationViewModel.callDayData[i].CallDayNumber + "' class='sleepOut'></span><span class='callDaySummary'>Loading data...</span>");
            } else {
              $("#callDayId-" + viewModel.allocationViewModel.callDayData[i].CallDayNumber).parent().append("<span id='callDaySleepoutId-" + viewModel.allocationViewModel.callDayData[i].CallDayNumber + "' class='sleepOut'>" + viewModel.allocationViewModel.callDayData[i].SleepoutType + "</span><span class='callDaySummary'>Loading data...</span>");
            }
          }

          $('.k-scheduler-table tr td').css('position', 'relative');
          if ($('#isReviewActions').val() === 'True') {
            $('.k-event').each(function (index, obj) {
              $(obj.lastElementChild.lastElementChild.lastElementChild).removeClass('k-si-close').addClass('si-close');
              $(obj.lastElementChild.lastElementChild.lastElementChild).click(function () {
                if ($(obj.childNodes['2'].firstElementChild).data("hasrelatedvisits")) {
                  window.confirmationWithCancelWindow.content(window.confirmationWithCancelWindowTemplate({ message: "Do you want to delete related visits?" }));
                  window.confirmationWithCancelWindow.title("Delete Related Visits");
                  window.confirmationWithCancelWindow.open().center();
                  $("#yesButtonConfirmtion").click(function () {
                    window.confirmationWithCancelWindow.close();
                    deleteVisit($(obj.childNodes['2'].firstElementChild).data("id"), currentScheduler, true);
                  });
                  $("#noButtonConfirmtion").click(function () {
                    window.confirmationWithCancelWindow.close();
                    deleteVisit($(obj.childNodes['2'].firstElementChild).data("id"), currentScheduler, false);
                  });
                  $("#cancelButtonConfirmtion").click(function () {
                    window.confirmationWithCancelWindow.close();
                  });
                } else {
                  window.confirmationWindow.content(window.windowTemplate({ message: "Do you want to delete current visit?" }));
                  window.confirmationWindow.title("Delete Visit");
                  window.confirmationWindow.open().center();
                  $("#yesButton").click(function () {
                    window.confirmationWindow.close();
                    deleteVisit($(obj.childNodes['2'].firstElementChild).data("id"), currentScheduler, false);
                  });
                  $("#noButton").click(function () {
                    window.confirmationWindow.close();
                  });
                }
              });
            });
          }
          $('.actionTooltip').each(function () {
            if ($(this)[0].textContent.trim() !== "") {
              $(this).attr("data-toggle", "tooltip");
              $(this).attr("data-placement", "right");
              $(this).attr("title", $(this)[0].title);
            }
          });
          if (viewModel.allocationViewModel.selectedDate != null && viewModel.allocationViewModel.selectedAllocation != null) {
            $.ajax({
              type: "GET",
              url: "/api/scheduler/callDaySummary/allocation/" + viewModel.allocationViewModel.selectedAllocation.AllocationId + "/?date=" + viewModel.allocationViewModel.selectedDate.toJSONLocal(),
              dataType: "json",
              beforeSend: function (req) {
                req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
              }
            })
              .done(function (data) {
                $('.callDaySummary').remove();
                for (var j = 0; j < data.CallDaySummaryData.length; j++) {
                  if (!data.CallDaySummaryData[j].IsBlank)
                    $("#callDayId-" + data.CallDaySummaryData[j].CallDayNumber).parent().append("<span id=callDaySummaryId-" + data.CallDaySummaryData[j].CallDayNumber + " class='callDaySummary'>" + data.CallDaySummaryData[j].Summary + "</span>");
                }

              })
              .always(function () {

              })
              .fail(function () {
              });
          }
        }
      }).data("kendoScheduler");
    }
  });
}

function validateVisitMoves(e, newCallDay) {
  var isValid = true;
  var weekDayNumber = newCallDay % 5;
  var items = $(e.draggable.hint).find('.dragoption');
  $(items).each(function () {
    var dayAllow = $(this).attr('data-' + weekDayNumber);
    var currentCallDay = $(this).attr('data-callDay');
    if (currentCallDay == newCallDay) {
      isValid = false;
      return false;
    }
    if (dayAllow != "true") {
      isValid = false;
      return false;
    }
    return true;
  });
  return isValid;
}

function callDayActionSetup(e, newCallDay, scheduler) {
  var items = $(e.draggable.hint).find('.dragoption');
  var currentVisits = $("[data-callDay='" + newCallDay + "']");
  if (((currentVisits.length - 1) + items.length) > 20) {
    window.messageWindow.content(window.messageWindowTemplate({ message: "A maximum of 20 visits is allowed per call-day" }));
    window.messageWindow.title("Maximum Visits");
    $("#okButton").click(function () {
      window.messageWindow.close();
    });
    window.messageWindow.open().center();
    return;
  }
  var selected = $(e.draggable.hint).find('div');
  var visits = [];
  var hasSameCallDayVisitContracts = false;
  var hasRelatedVisits = "false";
  var canAllocateMultiple = "false";
  var message = "A related visit(s) already exists on this call-day. Do you want to continue with the allocation?";
  var title = "Related Visits";
  $(selected).each(function () {
    var visitId = $(this).attr('data-id');
    visits.push(visitId);
    var contractId = $(this).attr('data-contractId');
    if (hasRelatedVisits === "false") {
      hasRelatedVisits = $(this).attr('data-hasrelatedvisits');
    }
    if (canAllocateMultiple === "false") {
      canAllocateMultiple = $(this).attr('data-canallocatemultiple');
    }
    if (hasSameCallDayVisitContracts === false) {
      var sameCallDayVisitContracts = $("[data-callDay='" + newCallDay + "'][data-contractId='" + contractId + "']");
      hasSameCallDayVisitContracts = sameCallDayVisitContracts.length > 0;
    }
  });
  if (e.draggable.hint[0].className === 'dragoptions k-widget k-listview') {
    if (hasSameCallDayVisitContracts) {
      window.confirmationWindow.content(window.windowTemplate({ message: message }));
      window.confirmationWindow.title(title);
      window.confirmationWindow.setOptions({
        height: 140
      });
      window.confirmationWindow.open().center();
      $("#yesButton").click(function () {
        window.confirmationWindow.close();
        changeVisitAllocation(visits, newCallDay, scheduler, false);
      });
      $("#noButton").click(function () {
        window.confirmationWindow.close();
      });
    } else {
      if (canAllocateMultiple === "true") {
        allocateRelatedVisitsConfirmation(visits, newCallDay, scheduler);
      } else {
        changeVisitAllocation(visits, newCallDay, scheduler, false);
      }
    }
    return;
  }
  if (hasSameCallDayVisitContracts) {
    window.confirmationWindow.content(window.windowTemplate({ message: message }));
    window.confirmationWindow.title(title);
    window.confirmationWindow.setOptions({
      height: 140
    });
    window.confirmationWindow.open().center();
    $("#yesButton").click(function () {
      window.confirmationWindow.close();
      if (hasRelatedVisits === "true") {
        relatedVisitsConfirmation(visits, newCallDay, scheduler);
      } else {
        moveVisit(visits, newCallDay, false, scheduler);
      }
    });
    $("#noButton").click(function () {
      window.confirmationWindow.close();
    });
  } else {
    if (hasRelatedVisits === "true") {
      relatedVisitsConfirmation(visits, newCallDay, scheduler);
    } else {
      moveVisit(visits, newCallDay, false, scheduler);
    }
  }
}

function deleteVisit(visitId, scheduler, isRelatedVisitsDeleteRequired) {
  var text = "Delete Visit";
  var template = kendo.template($("#reasonSelection-template").html());
  viewModel.editorWindow.content(template({}));
  viewModel.editorWindow.setOptions({
    width: 500
  });
  viewModel.editorWindow.title(text);
  viewModel.deleteVisitViewModel = kendo.observable({
    reasons: _.where(viewModel.allocationViewModel.reasons, { ReasonTypeId: 2 }),
    selectedReasonId: null,
    sumbitButtonText: text,
    cancel: function () {
      viewModel.editorWindow.close();
    },
    submit: function (event) {
      event.preventDefault();
      if (viewModel.deleteVisitViewModel.validator.validate()) {
        window.showOverlay();
        $.ajax({
          type: "POST",
          url: "/api/visit/" + visitId + "/delete/" + viewModel.deleteVisitViewModel.selectedReasonId + "?isRelatedVisitsDeleteRequired=" + isRelatedVisitsDeleteRequired,
          dataType: "json",
          beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
          }
        })
        .done(function () {
          window.hideOverlay();
          viewModel.editorWindow.close();
          viewModel.allocationViewModel.unallocatedVisits.read();
          viewModel.allocationViewModel.nonCalledList.read();
          scheduler.refresh();
          scheduler.dataSource.read();
        })
        .fail(function () {
        });
      }
    }
  });

  kendo.bind($("#reasonSelectionForm"), viewModel.deleteVisitViewModel);
  viewModel.deleteVisitViewModel.validator = $("#reasonSelectionForm").kendoValidator().data("kendoValidator");
  viewModel.editorWindow.open().center();
}

function saveOrUpdateLocalStorageTabIndex() {
  localStorage["app-" + cookieId + "-Tab-Index" + "-" + $("#logged-username").text()] = kendo.stringify(viewModel.activeTabIndex);
}

function saveOrUpdateLocalStorageSenarios() {
  localStorage["app-" + cookieId + "-Selected-Scenarios" + "-" + $("#logged-username").text()] = kendo.stringify(viewModel.selectedScenarios);
}

function allocateRelatedVisitsConfirmation(visits, newCallDay, scheduler) {
  window.confirmationWithCancelWindow.content(window.confirmationWithCancelWindowTemplate({ message: "Do you want to allocate related visits?" }));
  window.confirmationWithCancelWindow.title("Allocate Visits");
  window.confirmationWithCancelWindow.open().center();
  $("#yesButtonConfirmtion").click(function () {
    window.confirmationWithCancelWindow.close();
    changeVisitAllocation(visits, newCallDay, scheduler, true);
  });
  $("#noButtonConfirmtion").click(function () {
    window.confirmationWithCancelWindow.close();
    changeVisitAllocation(visits, newCallDay, scheduler, false);
  });
  $("#cancelButtonConfirmtion").click(function () {
    window.confirmationWithCancelWindow.close();
  });
}

function relatedVisitsConfirmation(visits, newCallDay, scheduler) {
  window.confirmationWithCancelWindow.content(window.confirmationWithCancelWindowTemplate({ message: "Do you want to move related visits?" }));
  window.confirmationWithCancelWindow.title("Move Visits");
  window.confirmationWithCancelWindow.open().center();
  $("#yesButtonConfirmtion").click(function () {
    window.confirmationWithCancelWindow.close();
    moveVisit(visits, newCallDay, true, scheduler);
  });
  $("#noButtonConfirmtion").click(function () {
    window.confirmationWithCancelWindow.close();
    moveVisit(visits, newCallDay, false, scheduler);
  });
  $("#cancelButtonConfirmtion").click(function () {
    window.confirmationWithCancelWindow.close();
  });
}

function saveData(data, scheduler) {
  if (data.currentFrequency != data.frequency && data.frequency == 3) {
    window.messageWindow.content(window.messageWindowTemplate({ message: "Frequency of 3 is not allowed." }));
    window.messageWindow.title("Change Frequency");
    window.messageWindow.open().center();
    $("#okButton").click(function () {
      window.messageWindow.close();
    });
    return;
  }
  if (data.currentFrequency != data.frequency && data.currentFrequency < 1 && data.frequency >= 1) {
    window.confirmationWindow.content(window.windowTemplate({ message: "Do you want to increase the frequency from " + data.currentFrequency + " to " + data.frequency }));
    window.confirmationWindow.title("Change Frequency");
    window.confirmationWindow.open().center();
    $("#yesButton").click(function () {
      window.confirmationWindow.close();
      updateVisit(data, scheduler);
    });
    $("#noButton").click(function () {
      window.confirmationWindow.close();
    });
  } else {
    updateVisit(data, scheduler);
  }
}

function updateVisit(data, scheduler) {
  if (data.currentFrequency != data.frequency) {
    if (data.frequency === 0) {
      window.confirmationWindow.content(window.windowTemplate({ message: "Do you want to delete all the visits?" }));
      window.confirmationWindow.title("Delete Visits");
      window.confirmationWindow.open().center();
      $("#yesButton").click(function () {
        window.confirmationWindow.close();
        visitUpdateConfirmation(data.currentFrequency > data.frequency ? 2 : 3, data, scheduler);
      });
      $("#noButton").click(function () {
        window.confirmationWindow.close();
      });
    } else {
      visitUpdateConfirmation(data.currentFrequency > data.frequency ? 2 : 3, data, scheduler);
    }
  } else {
    window.showOverlay();
    $.ajax({
      type: "PUT",
      url: "/api/visit/" + data.id,
      dataType: "json",
      beforeSend: function (req) {
        req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
      },
      data:
      {
        VisitId: data.visitId,
        AllocationId: data.allocationId,
        VisitTypeId: data.visitTypeId,
        Frequency: data.frequency,
        VisitTime: data.isVisitTimeDropdownVisible ? data.vTime : data.visitTime
      }
    })
      .done(function () {
        window.hideOverlay();
        viewModel.editorWindow.close();
        viewModel.allocationViewModel.unallocatedVisits.read();
        scheduler.refresh();
        scheduler.dataSource.read();
      })
      .fail(function () {
      });
  }
}

function relatedVisitsUnallocationConfirmation(visits, newCallDay, scheduler, reasonId) {
  window.confirmationWithCancelWindow.content(window.confirmationWithCancelWindowTemplate({ message: "Do you want to unassign related visits?" }));
  window.confirmationWithCancelWindow.title("Unassign Related Visits");
  window.confirmationWithCancelWindow.open().center();
  $("#yesButtonConfirmtion").click(function () {
    window.confirmationWithCancelWindow.close();
    changeVisitAllocation(visits, newCallDay, scheduler, true, reasonId);
  });
  $("#noButtonConfirmtion").click(function () {
    window.confirmationWithCancelWindow.close();
    changeVisitAllocation(visits, newCallDay, scheduler, false, reasonId);
  });
  $("#cancelButtonConfirmtion").click(function () {
    window.confirmationWithCancelWindow.close();
  });
}

function visitsUnallocationConfirmation(visits, newCallDay, scheduler, isRelatedVisitsUpdateRequired) {
  var text = "Unassign Visit";
  var template = kendo.template($("#reasonSelection-template").html());
  viewModel.editorWindow.content(template({}));
  viewModel.editorWindow.setOptions({
    width: 500
  });
  viewModel.editorWindow.title(text);
  viewModel.unAllocationViewModel = kendo.observable({
    reasons: _.where(viewModel.allocationViewModel.reasons, { ReasonTypeId: 1 }),
    selectedReasonId: null,
    sumbitButtonText: text,
    cancel: function () {
      viewModel.editorWindow.close();
    },
    submit: function (event) {
      event.preventDefault();
      if (viewModel.unAllocationViewModel.validator.validate()) {
        if (isRelatedVisitsUpdateRequired)
          relatedVisitsUnallocationConfirmation(visits, newCallDay, scheduler, viewModel.unAllocationViewModel.selectedReasonId);
        else
          changeVisitAllocation(visits, newCallDay, scheduler, false, viewModel.unAllocationViewModel.selectedReasonId);
        viewModel.editorWindow.close();
      }
    }
  });

  kendo.bind($("#reasonSelectionForm"), viewModel.unAllocationViewModel);
  viewModel.unAllocationViewModel.validator = $("#reasonSelectionForm").kendoValidator().data("kendoValidator");
  viewModel.editorWindow.open().center();

}

function changeVisitAllocation(visits, newCallDay, scheduler, isRelatedVisitsUpdateRequired, reasonId) {
  kendo.ui.progress($('#' + scheduler.wrapper[0].id), true);
  $.ajax({
    type: "PUT",
    url: "/api/visits/allocation",
    dataType: "json",
    beforeSend: function (req) {
      req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
    },
    data:
    {
      Visits: visits,
      NewCallDay: newCallDay,
      Date: viewModel.allocationViewModel.selectedDate.toJSONLocal(),
      IsRelatedVisitsUpdateRequired: isRelatedVisitsUpdateRequired,
      ReasonId: reasonId
    }
  })
  .done(function () {
    viewModel.allocationViewModel.unallocatedVisits.read();
    kendo.ui.progress($('#' + scheduler.wrapper[0].id), false);
    scheduler.refresh();
    scheduler.dataSource.read();
  })
  .fail(function () {
  });
}

function moveVisit(visits, newCallDay, isRelatedVisitsUpdateRequired, scheduler) {
  kendo.ui.progress($('#' + scheduler.wrapper[0].id), true);
  $.ajax({
    type: "PUT",
    url: "/api/visits/move",
    dataType: "json",
    beforeSend: function (req) {
      req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
    },
    data:
    {
      Visits: visits,
      NewCallDay: newCallDay,
      Date: viewModel.allocationViewModel.selectedDate.toJSONLocal(),
      IsRelatedVisitsUpdateRequired: isRelatedVisitsUpdateRequired
    }
  })
  .done(function () {
    kendo.ui.progress($('#' + scheduler.wrapper[0].id), false);
    scheduler.refresh();
    scheduler.dataSource.read();
  })
  .fail(function () {
  });
}

function changeVisitSequence(id, visitId, scheduler) {
  kendo.ui.progress($('#' + scheduler.wrapper[0].id), true);
  $.ajax({
    type: "PUT",
    url: "/api/visit/" + id + "/sequence/" + visitId,
    dataType: "json",
    beforeSend: function (req) {
      req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
    }
  })
  .done(function () {
    kendo.ui.progress($('#' + scheduler.wrapper[0].id), false);
    scheduler.refresh();
    scheduler.dataSource.read();
  })
  .fail(function () {
  });
}

function editCallDayData(id) {
  var template = kendo.template($("#calldayData-template").html());
  viewModel.editorWindow.content(template({}));
  viewModel.editorWindow.title("Edit Callday");
  $.ajax({
    type: "GET",
    url: "/api/CalldayData/" + id + "/allocation/" + viewModel.allocationViewModel.selectedAllocation.AllocationId + "/?date=" + viewModel.allocationViewModel.selectedDate.toJSONLocal(),
    dataType: "JSON",
    beforeSend: function (req) {
      req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
    }
  }).done(function (calldayData) {
    viewModel.calldayDataViewModel = kendo.observable({
      sleepoutTypes: calldayData.SleepoutTypes,
      selectedSleepout: calldayData.SleepoutTypeID,
      dateString: kendo.toString(kendo.parseDate(calldayData.SelectedDate), "d/MM/yyyy"),
      date: kendo.parseDate(calldayData.SelectedDate),
      hasPendingActions: calldayData.HasPendingActions,
      cancel: function () {
        viewModel.editorWindow.close();
      },
      save: function () {
        $.ajax({
          type: "PUT",
          url: "/api/CalldayData/update",
          dataType: "json",
          data: {
            SleepoutTypeID: viewModel.calldayDataViewModel.selectedSleepout,
            SleepoutDate: viewModel.calldayDataViewModel.date.toJSONLocal(),
            AllocationId: viewModel.allocationViewModel.selectedAllocation.AllocationId
          },
          beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
          }
        })
  .done(function () {
    viewModel.editorWindow.close();

    $.when(loadCommonData(), loadCallDayData()).done(function () {
      loadScheduler(viewModel.allocationViewModel.selectedAllocation, viewModel.allocationViewModel.selectedDate.toJSONLocal());
      loadUnallocatedVisits(viewModel.allocationViewModel.selectedAllocation);
      loadNonCalledList(viewModel.allocationViewModel.selectedAllocation);
    });
  }).fail(function () { });
      }
    });
    kendo.bind($("#calldayDataForm"), viewModel.calldayDataViewModel);
    viewModel.editorWindow.open().center();
  });
}

function loadCommonData() {
  $.ajax({
    type: "GET",
    url: "/api/schedulerCommonData",
    beforeSend: function (req) {
      req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
    },
  }).done(function (data) {
    viewModel.allocationViewModel.set("visitTypes", data.VisitTypes);
    viewModel.allocationViewModel.set("reasons", data.Reasons);
    viewModel.allocationViewModel.set("frequencies", data.Frequencies);
    viewModel.allocationViewModel.set("workloadTemplates", data.WorkloadTemplates);
  });
}

function subscribeToSchedulerUpdate() {
  // Declare a proxy to reference the hub. 
  var update = $.connection.fieldForceOnlineHub;
  update.client.schedulerUpdate = function (allocationId, scenarioId) {
    if (allocationId === viewModel.allocationViewModel.selectedAllocation.AllocationId) {
      var scheduler = $("#scheduler-" + scenarioId).data("kendoScheduler");
      if (scheduler == null) return;
      kendo.ui.progress($('#' + scheduler.wrapper[0].id), false);
      scheduler.refresh();
      scheduler.dataSource.read();
      return;
    }
  };

  update.client.SchedulerRefresh = function () {
    $.when(loadCommonData(), loadCallDayData()).done(function () {
      loadScheduler(viewModel.allocationViewModel.selectedAllocation, viewModel.allocationViewModel.selectedDate.toJSONLocal());
      loadUnallocatedVisits(viewModel.allocationViewModel.selectedAllocation);
      loadNonCalledList(viewModel.allocationViewModel.selectedAllocation);
    });
  };

  $.connection.hub.start().done(function () { });
}

function loadCallDayData() {
  $.ajax({
    type: "GET",
    url: "/api/scheduler/calldaydata/allocation/" + viewModel.allocationViewModel.selectedAllocation.AllocationId + "/?date=" + viewModel.allocationViewModel.selectedDate.toJSONLocal(),
    beforeSend: function (req) {
      req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
    }
  }).done(function (data) {
    viewModel.allocationViewModel.set("callDayData", data.CallDayData);
  });
}

function toTextValueArray(srcArray) {
  var textValueArray = new Array();
  if (srcArray) {
    for (var i = 0; i < srcArray.length; i++) {
      var itemValue = { value: srcArray[i], text: srcArray[i] };
      textValueArray.push(itemValue);
    }
  }
  return textValueArray;
}

function newVisitConfirmation() {
  var text = "Add Visits";
  var template = kendo.template($("#reasonSelection-template").html());
  viewModel.editorWindow.content(template({}));
  viewModel.editorWindow.setOptions({
    width: 500
  });
  viewModel.editorWindow.title(text);
  viewModel.newVisitConfirmationViewModel = kendo.observable({
    reasons: _.where(viewModel.allocationViewModel.reasons, { ReasonTypeId: 3 }),
    selectedReasonId: null,
    sumbitButtonText: text,
    cancel: function () {
      viewModel.editorWindow.close();
    },
    submit: function (event) {
      event.preventDefault();
      if (viewModel.newVisitConfirmationViewModel.validator.validate()) {
        $.ajax({
          type: "POST",
          url: "/api/contract/" + viewModel.contractViewModel.contractId + "/newVisits/" + viewModel.contractViewModel.frequency + "/visitTime/" + (viewModel.contractViewModel.isVisitTimeDropdownVisible ? viewModel.contractViewModel.vTime : viewModel.contractViewModel.visitTime) + "/allocation/" + viewModel.contractViewModel.allocationId + "/reason/" + viewModel.newVisitConfirmationViewModel.selectedReasonId,
          dataType: "json",
          beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
          }
        })
        .done(function () {
          viewModel.allocationViewModel.nonCalledList.read();
          viewModel.allocationViewModel.unallocatedVisits.read();
        })
        .fail(function () {
        });
        viewModel.editorWindow.close();
      }
    }
  });

  kendo.bind($("#reasonSelectionForm"), viewModel.newVisitConfirmationViewModel);
  viewModel.newVisitConfirmationViewModel.validator = $("#reasonSelectionForm").kendoValidator().data("kendoValidator");
  viewModel.editorWindow.open().center();
}

function visitUpdateConfirmation(reasonTypeId, data, scheduler) {
  var text = "Confirm";
  var template = kendo.template($("#reasonSelection-template").html());
  viewModel.editorWindow.content(template({}));
  viewModel.editorWindow.setOptions({
    width: 500
  });
  viewModel.editorWindow.title(text);
  viewModel.visitUpdateConfirmationViewModel = kendo.observable({
    reasons: _.where(viewModel.allocationViewModel.reasons, { ReasonTypeId: reasonTypeId }),
    selectedReasonId: null,
    sumbitButtonText: text,
    cancel: function () {
      viewModel.editorWindow.close();
    },
    submit: function (event) {
      event.preventDefault();
      if (viewModel.visitUpdateConfirmationViewModel.validator.validate()) {
        window.showOverlay();
        $.ajax({
          type: "PUT",
          url: "/api/visit/" + data.id,
          dataType: "json",
          beforeSend: function (req) {
            req.setRequestHeader('Authorization', 'Bearer ' + authCookie);
          },
          data:
          {
            VisitId: data.visitId,
            AllocationId: data.allocationId,
            VisitTypeId: data.visitTypeId,
            Frequency: data.frequency,
            ReasonId: viewModel.visitUpdateConfirmationViewModel.selectedReasonId,
            VisitTime: data.isVisitTimeDropdownVisible ? data.vTime : data.visitTime
          }
        })
        .done(function () {
          window.hideOverlay();
          viewModel.editorWindow.close();
          viewModel.allocationViewModel.unallocatedVisits.read();
          scheduler.refresh();
          scheduler.dataSource.read();
        })
        .fail(function () {
        });
      }
    }
  });

  kendo.bind($("#reasonSelectionForm"), viewModel.visitUpdateConfirmationViewModel);
  viewModel.visitUpdateConfirmationViewModel.validator = $("#reasonSelectionForm").kendoValidator().data("kendoValidator");
  viewModel.editorWindow.open().center();
}