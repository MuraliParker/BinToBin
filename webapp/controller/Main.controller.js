sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, Controller, JSONModel) {
        "use strict";

        return BaseController.extend("bintobin.bin.to.bin.controller.Main", {
            oUIModel: null,
            onInit: function () {
                this.handleMessageView();
                this.setUIModel();
            },
            onExit: function () {
                this.getView().getModel('message').setData([]);
                this.setUIModel();
            },
            onScanSuccess: function (oEvent) {
                console.log("onScanSuccess", oEvent);
                var sProperty = this.getScanProperty(oEvent);
                if (sProperty) {
                    if (oEvent.getParameter("cancelled")) {
                        sap.m.MessageToast.show("Scan cancelled", { duration: 1000 });
                    } else {
                        if (oEvent.getParameter("text")) {
                            console.log("onScanSuccess", oEvent.getParameter("text"));
                            this.oUIModel.setProperty('/' + sProperty, oEvent.getParameter("text"));
                        } else {

                            sap.m.MessageToast.show("Empty Scan", { duration: 1000 });
                        }
                    }

                } else {
                    sap.m.MessageToast.show("Unable to determine scanned button", { duration: 1000 });
                }



            },
            getScanProperty: function (oEvent) {
                var sId = oEvent.getSource().getId();
                if (!sId) {
                    return null;
                }
                var aIdSplit = sId.split('--');
                var sButtonID = aIdSplit[aIdSplit.length - 1];

                if (sButtonID === "sourceBin") {
                    // return this.getView().byId("inSourceBin");
                    return "Vlpla";
                } else if (sButtonID === "prod") {
                    // return this.getView().byId("inProd");
                    return "Matid";
                } else if (sButtonID === "distrBin") {
                    // return this.getView().byId("inDestBin");
                    return "NLPLA";
                } else {
                    return null;
                }

            },
            onScanError: function (oEvent) {
                sap.m.MessageToast.show("Scan failed: " + oEvent, { duration: 1000 });

            },
            onScanLiveupdate: function (oEvent) {
                console.log("onScanLiveupdate", oEvent);

            },
            setUIModel: function () {
                this.oUIModel = new JSONModel({
                    Procty: '9999',
                    Vlpla: '',
                    PRODUCT: '',
                    NLPLA: '',
                    Reqqty: ''
                });

                this.getView().setModel(this.oUIModel);
            },
            handleMessageView: function () {
                var that = this;

                var aErrorMessages = [];

                var oMessageModel = new JSONModel();
                oMessageModel.setData(aErrorMessages);

                var oBackButton = new sap.m.Button({
                    icon: sap.ui.core.IconPool.getIconURI("nav-back"),
                    visible: false,
                    press: function () {
                        that.oMessageView.navigateBack();
                        this.setVisible(false);
                    }
                });


                var oMessageTemplate = new sap.m.MessageItem({
                    type: '{message>type}',
                    title: '{message>title}',
                    description: '{message>description}',
                    subtitle: '{message>subtitle}',
                    counter: '{message>counter}',
                    groupName: '{message>group}'
                });

                this.oMessageView = new sap.m.MessageView({
                    showDetailsPageHeader: false,
                    itemSelect: function () {
                        oBackButton.setVisible(true);
                    },
                    items: {
                        path: 'message>/',
                        template: oMessageTemplate
                    },
                    groupItems: true
                });

                this.getView().setModel(oMessageModel, "message");
                this.oMessageView.setModel(oMessageModel, "message");
                this.getView().addDependent(this.oMessageView);

                this.oDialog = new sap.m.Dialog({
                    content: this.oMessageView,
                    contentHeight: "80%",
                    contentWidth: "80%",
                    endButton: new sap.m.Button({
                        text: "Close",
                        press: function () {
                            this.getParent().close();
                        }
                    }),
                    customHeader: new sap.m.Bar({
                        contentLeft: [oBackButton],
                        contentMiddle: [
                            new sap.m.Text({ text: "Bin to Bin Transfer status" })
                        ]
                    }),
                    verticalScrolling: false
                });
            },
            // Display the button type according to the message with the highest severity
            // The priority of the message types are as follows: Error > Warning > Success > Info
            buttonTypeFormatter: function () {
                var sHighestSeverityIcon = "Neutral";
                var oMessageModel = this.getView().getModel("message");
                if (oMessageModel) {

                    var aMessages = oMessageModel.getData();

                    aMessages.forEach(function (sMessage) {

                        switch (sMessage.type) {
                            case "Error":
                                sHighestSeverityIcon = "Negative";
                                break;
                            case "Warning":
                                sHighestSeverityIcon = sHighestSeverityIcon !== "Negative" ? "Critical" : sHighestSeverityIcon;
                                break;
                            case "Success":
                                sHighestSeverityIcon = sHighestSeverityIcon !== "Negative" && sHighestSeverityIcon !== "Critical" ? "Success" : sHighestSeverityIcon;
                                break;
                            default:
                                sHighestSeverityIcon = !sHighestSeverityIcon ? "Neutral" : sHighestSeverityIcon;
                                break;
                        }
                    });

                }
                return sHighestSeverityIcon;
            },

            // Display the number of messages with the highest severity
            highestSeverityMessages: function () {
                var sHighestSeverityIconType = this.buttonTypeFormatter();
                var sHighestSeverityMessageType = "Information";

                switch (sHighestSeverityIconType) {
                    case "Negative":
                        sHighestSeverityMessageType = "Error";
                        break;
                    case "Critical":
                        sHighestSeverityMessageType = "Warning";
                        break;
                    case "Success":
                        sHighestSeverityMessageType = "Success";
                        break;
                    default:
                        sHighestSeverityMessageType = !sHighestSeverityMessageType ? "Information" : sHighestSeverityMessageType;
                        break;
                }
                var oMessageModel = this.getView().getModel("message");

                return oMessageModel.oData.reduce(function (iNumberOfMessages, oMessageItem) {
                    return oMessageItem.type === sHighestSeverityMessageType ? ++iNumberOfMessages : iNumberOfMessages;
                }, 0);
            },

            // Set the button icon according to the message with the highest severity
            buttonIconFormatter: function () {
                var sIcon = "sap-icon://message-information";
                var oMessageModel = this.getView().getModel("message");
                if (oMessageModel) {

                    var aMessages = oMessageModel.oData;
                    aMessages.forEach(function (sMessage) {
                        switch (sMessage.type) {
                            case "Error":
                                sIcon = "sap-icon://message-error";
                                break;
                            case "Warning":
                                sIcon = sIcon !== "sap-icon://message-error" ? "sap-icon://message-warning" : sIcon;
                                break;
                            case "Success":
                                sIcon = "sap-icon://message-error" && sIcon !== "sap-icon://message-warning" ? "sap-icon://message-success" : sIcon;
                                break;
                            default:
                                sIcon = !sIcon ? "sap-icon://message-information" : sIcon;
                                break;
                        }
                    });
                }
                return sIcon;
            },

            handleMessageViewPress: function (oEvent) {
                this.oMessageView.navigateBack();
                this.oDialog.open();
            },
            onChange: function (oEvent) {
                var value = oEvent.getParameter("value");
                if ((value[0] === "p") || (value[0] === "P")) {
                    this.getView().getModel().setProperty("/PRODUCT", value.substring(1));
                }
            },
            onExecute: function (oEvent) {
                console.log("onExecute:", oEvent);

                var oPostData = this.getView().getModel().getData();
                var oSrvModel = this.getOwnerComponent().getModel();
                oSrvModel.create("/createwhstaskSet", oPostData,
                    {
                        success: function (result) {
                            // everything is OK
                            var aMockMessages = [];
                            console.log("Succes:", result);
                            sap.m.MessageToast.show(this.getResourceBundle().getText("executeSuccess"));
                            aMockMessages.push({
                                type: result.Status,
                                title: result.Message,
                                description: result.Message,
                                subtitle: "",
                                counter: 1
                            });
                            // resetting the current model...

                            this.getView().getModel().setData({
                                Procty: '9999',
                                Vlpla: '',
                                PRODUCT: '',
                                NLPLA: '',
                                Reqqty: ''
                            });
                            this.getView().getModel('message').setData(aMockMessages);

                        }.bind(this),
                        error: function (err) {
                            // some error occuerd 
                            console.log("Error:", err);
                            var oError = {};
                            var aError = [];
                            var sErrMessage = "";
                            try {
                                oError = JSON.parse(err.responseText);
                                if (oError) {
                                    sErrMessage = oError.error.message.value;
                                }

                            } catch (error) {
                                var parser = new DOMParser();
                                var xmlDoc = parser.parseFromString(err.responseText, "text/xml");
                                sErrMessage = xmlDoc.getElementsByTagName('message')[0].childNodes[0].nodeValue;

                            }
                            aError.push({
                                type: 'Error',
                                title: err.message,
                                description: sErrMessage,
                                subtitle: err.statusCode + " : " + err.statusText,
                                counter: 1
                            });
                            this.getView().getModel('message').setData(aError);
                        }.bind(this),
                        async: true,  // execute async request to not stuck the main thread
                        urlParameters: {}  // send URL parameters if required 
                    });
            }
        });
    });
