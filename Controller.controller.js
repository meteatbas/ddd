sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/ToolbarSpacer",
	"sap/ui/table/Row",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/syncStyleClass",
	"sap/ui/core/Fragment"
], function(Controller, JSONModel, MessageToast, ToolbarSpacer, TableRow, jQuery,syncStyleClass,Fragment) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.DnD.Controller", {

		onInit: function() {
			var oView = this.getView();

			// set explored app's demo model on this sample
			this.oProductsModel = this.initSampleProductsModel();
			oView.setModel(this.oProductsModel);

		},

		onExit: function() {
			this.oProductsModel.destroy();
		},

		config: {
			initialRank: 0,
			defaultRank: 1024,
			rankAlgorithm: {
				Before: function(iRank) {
					return iRank + 1024;
				},
				Between: function(iRank1, iRank2) {
					// limited to 53 rows
					return (iRank1 + iRank2) / 2;
				},
				After: function(iRank) {
					return iRank / 2;
				}
			}
		},

		initSampleProductsModel: function() {
			var oData;
			jQuery.ajax({
				type: "GET",
				async: false,
				url: "http://localhost:8080/HibernateJakartaRS-1.0-SNAPSHOT/student/getStudent/1",
				dataType: "json",
				success: function(oResponse) {
					oData = {
						ProductCollection: oResponse
					};
				}
			});

			// prepare and initialize the rank property
			oData.ProductCollection.forEach(function(oProduct) {
				oProduct.Rank = this.config.initialRank;
			}, this);

			var oModel = new JSONModel();
			oModel.setData(oData);
			return oModel;
		},
		handleLiveSearch(oEvt) {
			var aFilters = [];
			var sQuery = oEvt.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filters = [new sap.ui.model.Filter("rollNumber", sap.ui.model.FilterOperator.Contains, sQuery),
					new sap.ui.model.Filter("firstName", sap.ui.model.FilterOperator.Contains, sQuery)];
				var oFilter = new sap.ui.model.Filter(filters, false);
				aFilters.push(filters);
			}

			// update list binding
			var list = this.getView().byId("table1").getBinding("rows").filter(oFilter);
			var binding = list.getBinding("rows");
			binding.filter(aFilters, "Application");
		},
		onPressAddRow: function() {
			var oModel = this.getView().getModel(),
				line = oModel.oData.ProductCollection[1]; //Just add to the end of the table a line like the second line
			oModel.oData.ProductCollection.push(line);
			oModel.refresh();
		},
		onAdd: function (event) {                               //to add a new row
			const model = event.getSource().getModel();
			const newArray = model.getProperty("/ProductCollection").concat({
				id: globalThis.crypto.randomUUID(),
				text: "My New Item",
			});
			model.setProperty("/ProductCollection", newArray, null, true);
			let line = model.oData.ProductCollection[1]
			line.studentId=null;
			// var oModel = this.getView().getModel()
			model.oData.ProductCollection.push(line);
			model.refresh()
		},
		onAddBtnPress: function() {
			const dialog = this.byId("dialog");
			syncStyleClass("sapUiSizeCompact", this.getView(), dialog);
			dialog.open();
		},
		onbuttonpress: function (oEvent) {
			var oView = this.getView();
			// var path = oEvent.getSource().getBindingContext("table1").getPath();
// create dialog lazily
			if (!this.byId("openDialog")) {
// load asynchronous XML fragment
				Fragment.load({
					id: oView.getId(),
					name: "inputdialog",
					controller: this
				}).then(function (oDialog) {
// connect dialog to the root view
//of this component (models, lifecycle)
					oView.addDependent(oDialog);
					oDialog.bindElement({
						path: "rows",
						model: "sample"
					});
					oDialog.open();
				});
			}
		},

		closeDialog: function () {
			this.byId("openDialog").destroy();
		},
		onDialogAddPress: function() {
			const dialog = this.byId("openDialog");
			const isInput = control => control.isA("sap.m.InputBase");
			const inputs = dialog.getControlsByFieldGroupId("inputs").filter(isInput);
			const invalidInput = inputs.find(c => c.getValueState() == "Error");
			if (invalidInput) {
				invalidInput.focus();
			} else {
				// const connid = dialog.getBindingContext("rows").getProperty("connid");
				this.getView().getModel().submitChanges({
					groupId: "addingFlight",
					success: this.onCreateSuccess.bind(this),
				});
			}
		},
		onCreateSuccess: function() {
			const message = `Flight ${2} Added`;
			sap.ui.require(["sap/m/MessageToast"], MT => MT.show(message));
			this.byId("dialog").close();
		}
	});

});
