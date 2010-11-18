Ext.BLANK_IMAGE_URL = 'ext-3.3.0/resources/images/default/s.gif';
Ext.onReady(function() {	// Main Entry Method
	Ext.QuickTips.init();	// Enable Quick Tooltips
	Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
	adminDashboard.init();
});
var getForm = function(options) {
	var methods = options.methodOptions.split(", ");
	var servletOptions = eval("("+options.servletOptions+")");
	var tabItems = [];
	for(var i=0;i<methods.length;i++) {
		var paramItems;
			switch(methods[i]) {
				case "GET" :
					paramItems = servletOptions.doGet; break;
				case "PUT" :
					paramItems = servletOptions.doPut; break;
				case "POST" :
					paramItems = servletOptions.doPost;break;
				case "DELETE" :
					paramItems = servletOptions.doDelete; break;
				default:
		};
		var formItems = [];
		if(paramItems) {
			for (var j=0;j<paramItems.length;j++) {
				var fieldLabel;
				var toolTip;
				if(typeof paramItems[j] == "string") {
					fieldLabel = paramItems[j];
					toolTip = paramItems[j];
				}else{
					fieldLabel = paramItems[j].name;
					toolTip = paramItems[j].description;
				}
				formItems.push({
					xtype : "textfield",
					fieldLabel : fieldLabel,
				});
			}
		}
		var formPanel = {
			title : methods[i],
			xtype : "form",
			defaultType : "textfield",
			bodyStyle : "padding:5px;",
			bbar : {
				items : [
					{
						text : "Execute",
						handler : function(a,b) {
							alert(a.toString());
							formPanel.getForm().submit({
								url:'xml-errors.xml',
								waitMsg:'Saving Data...',
								submitEmptyText: false
							});
						}
					}
				]
			}
		};
		if(formItems) formPanel.items = formItems;
		tabItems.push(formPanel);
	}
	var resultsPanel = {
		xtype : "panel",
		title : "Response",
		layout : "fit",
		border: false,
		region : "south",
		height : 100,
		split : true
	};
	var paramFieldSet = {
		id : "paramFieldSet",
		xtype : "fieldset",
		title : "Parameters",
		autoHeight : true,
		defaultType : "text",
		items : paramItems
	}
	var tabPanel = {
		xtype : "tabpanel",
		activeTab : 0,
		frame: true,
		items : tabItems,
		border: false,
		region : "center"
	};
	return [tabPanel, resultsPanel]
};
var adminDashboard = {
	dsServerStatus : new Ext.data.Store({
		url : "getServerStatus",
		autoLoad : true,
		reader : new Ext.data.JsonReader({
			root : "status",
			fields : []
		}),	
		listeners : {
			"load" : function() {
				Ext.getCmp("serverPropertyGrid").setSource(this.reader.jsonData.status);
			}
		}
	}),
	dsEnv : new Ext.data.Store({
		url : "getEnvironment",
		autoLoad : true,
		reader : new Ext.data.JsonReader({
			root : "environment",
			fields: []
		}),	
		listeners : {
			"load" : function() {
				Ext.getCmp("envPropertyGrid").setSource(this.reader.jsonData.environment);
			}
		}
	}),
	dsTraces : new Ext.data.Store({
		url : "getTraces",
		autoLoad : true,
		reader : new Ext.data.JsonReader({
			fields : [
				"id", "request", "response"
			]
		})
	}),
	dsSessions : new Ext.data.Store({
		url : "getSessions",
		autoLoad : true,
		reader : new Ext.data.JsonReader({
			fields : [
				"id", "createdOn", "lastAccessed"
			]
		})
	}),
	appTreeLoader : new Ext.tree.TreeLoader({
		dataUrl:'getApplications',
		requestMethod : "GET",
		uiProviders: {
			col : Ext.ux.tree.ColumnNodeUI
		}
	}),
	dsApplications : new Ext.data.Store({ 			// Console Datastore
		url : "getApplications",
		autoLoad: true,
		reader: new Ext.data.JsonReader({ 	// Console Reader Object
			root: 'applications', 
			fields: ['name']
		}),
		listeners: {
			'load' : function() {
				// dsConsole.loadData(dsOpps.reader.jsonData);
			}
		}
	}), 
	init : function() {
		SyntaxHighlighter.all();
		SyntaxHighlighter.defaults.toolbar = false;
		Ext.QuickTips.init();
		new Ext.Viewport({
			layout:'border', 
			items:[
				{ 
					xtype : "panel", 
					region: "west", 
					title : "Server Information", 
					width: 200,
					split: true,
					layout: "fit",
					tbar : {
						items : [
							{
								text : "Refresh",
								iconCls : "refreshButton",
								handler: function(){
									adminDashboard.dsServerStatus.load();
									adminDashboard.dsEnv.load();
								}
							}
						]
					},
					items : [
						{
							xtype : "tabpanel",
							border: false,
							activeTab : 0,
							items : [
								{
									title : "Status",
									id : "serverPropertyGrid",
									xtype : "propertygrid",
									source: {},
									listeners : {
										activate : function() { adminDashboard.dsServerStatus.load(); }
									}
								},{
									title : "Environment",
									id : "envPropertyGrid",
									xtype : "propertygrid",
									source: {},
									listeners : {
										activate : function() { adminDashboard.dsEnv.load(); }
									}
								}
							]
						}
					]
				},{
					xtype : "panel",
					region : "center",
					layout : "border",
					border: false,
					items : [
						{
							xtype : "tabpanel",
							region : "center",
							activeTab : 0,
							items : [
								{
									// Wrapper Panel
									xtype:"panel",
									title:"Applications",
									layout: "border",
									border : false,
									items:[
										{
											xtype : "panel",
											border : false,
											autoScroll : true,
											id : "appDetails",
											split : true,
											title : "Details",
											height : 200,
											region : "south",
											tpl : new Ext.Template("<div>Hello {0}.</div>")
										},
										new Ext.ux.tree.ColumnTree({
											id : "applicationTree",
											region : "center",
											rootVisible : false,
                                            autoheight : true,
											border : false,
											defaults : {border: true},
											autoScroll:true,
											tbar : {
												items : [
													{
														text : "Refresh",
														iconCls : "refreshButton",
														handler: function(){
															adminDashboard.appTreeLoader.load(Ext.getCmp("applicationTree").getRootNode());
														}
													},
													"-",
													{
														text : "Restart All Apps",
														iconCls : "restartButton",
														handler : function() {
															Ext.Ajax.request({
																url: 'restartApps',
																method : "GET",
																success : function(response, opts) {
																	Ext.Msg.alert('Status', Ext.decode(response.responseText).msg);
																},
																failure : function(response, opts) {
																	alert('server-side failure with status code ' + response.status);
																}
															});
														}
													}
												]
											},
											autoExpandColumn : "filename",
											columns:[{
												header:'Component',
												width:300,
												dataIndex:'component'
											},{
												header:'Description',
												width:200,
												dataIndex:'description'
                                            }],
											loader: adminDashboard.appTreeLoader,
											root: new Ext.tree.AsyncTreeNode({
												text: 'Apps'
											}),
											listeners : {
                                                click : function(node, event){
												if(node.attributes.type == "webApp") {
													var details = Ext.getCmp("appDetails");
													details.removeAll(true);
													details.add({
														xtype : "panel",
														layout : "fit",
														tbar : {
															items : [
																{
																	text : "Restart",
																	iconCls : "restartButton",
																	handler : function() {
																		Ext.Ajax.request({
																			url: 'restartApp',
																			params : {
																				webApp : node.attributes.text																			},
																			method : "GET",
																			success : function(response, opts) {
																				Ext.Msg.alert('Status', Ext.decode(response.responseText).msg);
																			},
																			failure : function(response, opts) {
																				alert('server-side failure with status code ' + response.status);
																			}
																		});
																	}
																}
															]
														}
													});
													new Ext.Template(
														'<div style="padding: 5px;font-size:8pt;font-family:Arial, Tahoma, Verdana">',
														'<strong>{text}</strong> - {description}',
														'</div>'
													).overwrite(details.body, node.attributes);
													Ext.getCmp("appDetails").doLayout();
												}
												if(node.attributes.type == "servlet") {
														var details = Ext.getCmp("appDetails");
														details.removeAll(true);
														details.add({
															xtype : "panel",
															layout : "fit",
															tbar : {
																items : [
																	{
																		text : "Restart",
																		iconCls : "restartButton",
																		handler : function() {
																			Ext.Ajax.request({
																				url: 'restartServlet',
																				params : {
																					webApp : node.parentNode.parentNode.attributes.text,
																					servlet : node.attributes.text
																				},
																				method : "GET",
																				success : function(response, opts) {
																					Ext.Msg.alert('Status', Ext.decode(response.responseText).msg);
																				},
																				failure : function(response, opts) {
																					alert('server-side failure with status code ' + response.status);
																				}
																			});
																		}
																	},"-",{
																		text : "Options",
																		iconCls : "optionsButton",
																		handler : function() {
																			var reqURL = node.parentNode.parentNode.attributes.path +
																			node.attributes.Mappings[0];
																			Ext.Ajax.request({
																				method : "OPTIONS",
																				url : "/" + reqURL,
																				callback : function(options, success, response) {
																					alert(response.getResponseHeader("Allow"));
																					var servletOptions = response.getResponseHeader("Servlet-Parameters");
																					if(servletOptions) alert(servletOptions);
																				}
																			});
																		}
																	},"-",{
																		text : "Test",
																		iconCls : "testButton",
																		handler : function() {
																			var reqURL = node.parentNode.parentNode.attributes.path +
																			node.attributes.Mappings[0];
																			Ext.Ajax.request({
																				method : "OPTIONS",
																				url : reqURL,
																				callback : function(options, success, response) {
																					var allow = response.getResponseHeader("Allow");
																					var servletOptions = response.getResponseHeader("Servlet-Parameters");
																					var testWin = new Ext.Window({
																						title : "Test Servlet",
																						height : 400,
																						layout : "border",
																						border : true,
																						width : "80%",
																						closeAction : "close",
																						items : getForm({
																							methodOptions : allow,
																							servletOptions : servletOptions
																						})
																					});
																					testWin.show();
																				}
																			});
																		}
																	},"-",{
																		text : "Edit",
																		iconCls : "codeeditButton",
																		handler : function() {
																			Ext.Ajax.request({
																				url: 'editServlet',
																				params : {
																					webApp : node.parentNode.parentNode.attributes.text,
																					servlet : node.attributes.text
																				},
																				method : "GET",
																				success : function(response, opts) {
																					var servletOptions = Ext.decode(response.responseText).servletOptions;
																					var editWin = new Ext.Window({
																						title : "Edit",
																						modal : true,
																						width : "80%",
																						height : 400,
																						closeAction : "close",
																						bodyStyle : "padding:5px",
																						items : [
																							{xtype:"form",labelAlign: 'top',border: false,id:"editSource",
																							items : [
																								{ xtype : "hidden", name : "servlet", value : node.attributes.text },
																								{ xtype : "hidden", name : "webApp", value : node.parentNode.parentNode.attributes.text },
																								{
																									fieldLabel: 'Source',
																									name:"source",
																									xtype : "textarea",
																									cls : "bespin",
																									style : {
																										fontFamily : "Courier New"
																									},
																									anchor : "100%",
																									height : "100%",
																									name: 'source',
																									value : servletOptions,
																									allowBlank:false
																								}
																							]}
																						],
																						buttons : [
																							{
																								text : "Cancel",
																								handler : function() {editWin.close();}
																							},"-",{
																								text : "Save",
																								handler : function() {
																									es = Ext.getCmp("editSource").getForm();
																									es.submit({
																										url : "editServlet",
																										success : function(form, action){
																											Ext.Msg.alert("Success", action.result.msg);
																											editWin.close();
																										}
																									});
																								}
																							}
																						]
																					});
																					editWin.show();
																				},
																				failure : function(response, opts) {
																					alert('server-side failure with status code ' + response.status);
																				}
																			});
																		}
																	}
																]
															}
														});
														new Ext.Template(
															'<div style="padding: 5px;font-size:8pt;font-family:Arial, Tahoma, Verdana">',
															'<strong>{text}</strong> - {description}',
															'</div>'
														).overwrite(details.body, node.attributes);
														Ext.getCmp("appDetails").doLayout();
													}
													if(node.attributes.type == "servletOption"){
														var params = {
															webApp : node.parentNode.parentNode.parentNode.parentNode.attributes.text,
															servlet : node.parentNode.parentNode.attributes.text,
															option : node.attributes.text
														};
														Ext.Ajax.request({
															url: 'getServletOption',
															params : params,
															method : "GET",
															success: function(response, opts) {
																var obj = Ext.decode(response.responseText);
																obj.source = Ext.util.Format.htmlEncode(obj.source);
																new Ext.Template(
																	'<pre class="brush: js;" style="font-size:8pt;margin:0px;">{source}</pre>'
																).overwrite(Ext.getCmp("appDetails").body, obj);
																SyntaxHighlighter.highlight();
															},
															failure: function(response, opts) {
																alert('server-side failure with status code ' + response.status);
															}
														});
													}
                                                }
                                            }
										})
									]
								},{	// Wrapper Panel
									xtype:"panel",
									title:"MIMEs",
									layout: "fit",
									items:[
										new Ext.ux.tree.ColumnTree({
											border : false,
											//rootVisible:false,
											autoheight: true,
											//title: "MIMEs",
											tbar : {
												items : "Stub"
											},
											//layout: "fit",
											autoScroll:true,
											autoExpandColumn : "filename",
											columns:[{
												header:'File Name',
												width:300,
												dataIndex:'filename'
											},{
												header:'File Size',
												width:100,
												dataIndex:'filesize',
												renderer : function (value, metaData, record, rowIndex, colIndex, store) {
													// provide the logic depending on business rules
													// name of your own choosing to manipulate the cell depending upon
													// the data in the underlying Record object.
													// if (value == 'whatever') {
														//metaData.css : String : A CSS class name to add to the TD element of the cell.
														//metaData.attr : String : An html attribute definition string to apply to
														//                         the data container element within the table
														//                         cell (e.g. 'style="color:red;"').
														// metaData.css = 'name-of-css-class-you-will-define';
													// }
													amount = value.toString();
													amount = amount.replace(/^0+/, ''); 
													amount += '';
													x = amount.split('.');
													x1 = x[0];
													x2 = x.length > 1 ? '.' + x[1] : '';
													var rgx = /(\d+)(\d{3})/;
													while (rgx.test(x1)) x1 = x1.replace(rgx, '$1' + ',' + '$2');
													return x1 + x2;
											   }
											},{
												header:'Permissions',
												width:100,
												dataIndex:'permissions',
												renderer : function (value, metaData, record, rowIndex, colIndex, store) {
													return "<span style=\"font-family: Courier New\">" + value + "</span>";
												}
											}],
											loader: new Ext.tree.TreeLoader(
												{
													dataUrl:'getMIMEs',
													requestMethod : "GET",
													uiProviders: {
														col : Ext.ux.tree.ColumnNodeUI
													}
												}
											),
											root: new Ext.tree.AsyncTreeNode({
												text: 'MIMEs'
											})
										})
									]
								},{
									xtype : "grid",
									store : this.dsTraces,
									autoExpandColumn : 1,
									columns : [
										{
										id : "id", header : "ID", dataIndex : "id", width : 30, sortable : true
										},{
										header : "Request", dataIndex : "request", sortable : true
										},{
										header : "Response", dataIndex : "response", width : 75, sortable : true
										}
									],
									title : "Trace Logs",
									tbar : {
										items : [
											{
												text : "Toggle Trace",
												iconCls : "logButton",
												allowDepress : true,
												enableToggle : true,
												toggleHandler : function(button, state) {
													button.disable();
													Ext.Ajax.request({
														url: 'setTrace',
														params : {
															traceStatus : state
														},
														method : "GET",
														success : function(response, opts) {
															// Ext.Msg.alert('Status', Ext.decode(response.responseText).msg);
															button.enable();
														},
														failure : function(response, opts) {
															alert('server-side failure with status code ' + response.status);
															button.enable();
														}
													});
												}
											},"-",{
												text : "Refresh",
												iconCls : "refreshButton",
												handler : function() {
													adminDashboard.dsTraces.load();
												}
											}
										]
									}
								},{
									title : "Sessions",
									xtype : "grid",
									tbar : {
										items : [
											{
												text : "Refresh",
												iconCls : "refreshButton",
												handler : function() {
													adminDashboard.dsSessions.load();
												}
											}
										]
									},
									store : this.dsSessions,
									// autoExpandColumn : 1,
									columns : [
										{
										id : "id", header : "JESSIONID", dataIndex : "id", width : 250, sortable : true
										},{
										header : "Created On", dataIndex : "createdOn", sortable : true, width: 150
										},{
										header : "Last Accessed", dataIndex : "lastAccessed", width : 150, sortable : true
										}
									],
								}
							]
						}
					]
				}
			]
		});
	}
};