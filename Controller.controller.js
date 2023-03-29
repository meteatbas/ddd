sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/ToolbarSpacer",
	"sap/ui/table/Row",
	"sap/ui/thirdparty/jquery"
], function(Controller, JSONModel, MessageToast, ToolbarSpacer, TableRow, jQuery) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.DnD.Controller", {

		onInit: function() {
			var oView = this.getView();

			// set explored app's demo model on this sample
			this.oProductsModel = this.initSampleProductsModel();
			oView.setModel(this.oProductsModel);

			// sap.ui.require(["sap/ui/table/sample/TableExampleUtils"], function(TableExampleUtils) {
			// 	var oTb = oView.byId("infobar");
			// 	oTb.addContent(new ToolbarSpacer());
			// 	oTb.addContent(TableExampleUtils.createInfoButton("sap/ui/table/sample/DnD"));
			// }, function(oError) { /*ignore*/ });
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
		}
	});

});
