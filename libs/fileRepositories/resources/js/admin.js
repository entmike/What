// Blank Image URL
Ext.BLANK_IMAGE_URL = 'ext-3.3.0/resources/images/default/s.gif';
Ext.onReady(function() {	// Main Entry Method
	Ext.QuickTips.init();	// Enable Quick Tooltips
	Ext.state.Manager.setProvider(new Ext.state.CookieProvider());	// Cookie Provider
	adminDashboard.init();	// Init Admin Dashboard
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
					fieldLabel : fieldLabel
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
	// Renderers
	fileSizeRenderer : function (value, metaData, record, rowIndex, colIndex, store) {
		amount = value.toString();
		amount = amount.replace(/^0+/, ''); 
		amount += '';
		x = amount.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) x1 = x1.replace(rgx, '$1' + ',' + '$2');
		return x1 + x2;
	},
	// Server Status Data Store
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
	// Environment Data Store
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
	// Traces Data Store
	dsTraces : new Ext.data.Store({
		url : "getTraces",
		autoLoad : true,
		reader : new Ext.data.JsonReader({
			fields : [
				"id", "remoteAddress", "request", "response"
			]
		})
	}),
	// Databases Data Store
	dsDatabases : new Ext.data.Store({
		url : "getDatabases",
		autoLoad : true,
		reader : new Ext.data.JsonReader({
			root : "result.databases",
			fields : [
				"name", "sizeOnDisk", "empty"
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
		// Initialize SyntaxHighlighter plugin
		SyntaxHighlighter.all();
		// Suppress SyntaxHighlighter Toolbar
		SyntaxHighlighter.defaults.toolbar = false;
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
								applicationsTab
								,{	// Wrapper Panel
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
												renderer : adminDashboard.fileSizeRenderer
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
									xtype : "panel",
									title : "Trace Logs",
									layout : "border",
									items :[
										{
												xtype : "panel",
												border : false,
												autoScroll : true,
												id : "traceDetails",
												split : true,
												title : "Details",
												height : 200,
												region : "south",
												bodyStyle : "padding: 5px;font-size:8pt;font-family: Arial, Tahoma, Verdana;",
												tpl : new Ext.Template("<div>Hello {0}.</div>")
										},{
											xtype : "grid",
											region : "center",
											store : this.dsTraces,
											listeners : {
												rowclick : function(grid, rowIndex, event) {
													var traceID = grid.getSelectionModel().getSelected().get("id");
													Ext.Ajax.request({
															url: 'getTrace',
															params : {id : traceID},
															method : "GET",
															success: function(response, opts) {
																var obj = Ext.decode(response.responseText);
																var request = obj.request;
																new Ext.Template(
																	'<b>Request ID:{id}</b><br/>',
																	'<b>Remote Address:</b> {remoteAddress}<br/>',
																	'<b>URL:</b> {URL}<br/>',
																	'<b>Method:</b> {method}<br/>',
																	'<b>Querystring:</b> {queryString}<br/>',
																	'<b>Request Headers:</b><br/>'
																).overwrite(Ext.getCmp("traceDetails").body, request);
																for(name in request.headers){
																	var o = {name: name, value : request.headers[name]};
																	new Ext.Template(
																	'<b>{name}:</b> {value}<br/>'
																	).append(Ext.getCmp("traceDetails").body, o);
																}
															},
															failure: function(response, opts) {
																alert('server-side failure with status code ' + response.status);
															}
														});
													
												}
											},
											autoExpandColumn : 2,
											columns : [
												{
												id : "id", header : "ID", dataIndex : "id", width : 30, sortable : true
												},{
												header : "Remote Address", dataIndex : "remoteAddress", width: 100, sortable : true
												},{
												header : "Request", dataIndex : "request", sortable : true
												},{
												header : "Response", dataIndex : "response", width : 75, sortable : true
												}
											],
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
													},"-",{
														text : "Purge Trace Log",
														iconCls : "purgeButton",
														handler : function() {
															Ext.Ajax.request({
																url: 'purgeTraces',
																method : "GET",
																success : function(response, opts) {
																	adminDashboard.dsTraces.load();
																},
																failure : function(response, opts) {
																	alert('server-side failure with status code ' + response.status);
																}
															});
														}
													}
												]
											}
										}
									]
								},{
									title : "Databases",
									xtype : "grid",
									tbar : {
										items : [
											{
												text : "Refresh",
												iconCls : "refreshButton",
												handler : function() {
													adminDashboard.dsDatabases.load();
												}
											}
										]
									},
									store : this.dsDatabases,
									// autoExpandColumn : 1,
									columns : [
										{
											header : "Database", dataIndex : "name", sortable : true, width: 150
										},{
											header : "Size", dataIndex : "sizeOnDisk", width : 150, sortable : true,
											renderer : adminDashboard.fileSizeRenderer
										},{
											header : "Empty?", dataIndex : "empty", sortable : true, width : 50
										}
									]
								}
							]
						}
					]
				}
			]
		});
	}
};