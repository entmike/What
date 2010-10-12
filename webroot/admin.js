Ext.BLANK_IMAGE_URL = '/ext-3.3.0/resources/images/default/s.gif';
Ext.onReady(function() {	// Main Entry Method
	Ext.QuickTips.init();	// Enable Quick Tooltips
	Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
	adminDashboard.init();
});
var adminDashboard = {
	dsServerStatus : new Ext.data.Store({
		url : "/getServerStatus",
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
		url : "/getEnv",
		autoLoad : true,
		reader : new Ext.data.JsonReader({
			root : "env",
			fields: []
		}),	
		listeners : {
			"load" : function() {
				Ext.getCmp("envPropertyGrid").setSource(this.reader.jsonData.env);
			}
		}
	}),
	dsServlets : new Ext.data.Store({ 			// Console Datastore
		url : "/getServlets",
		autoLoad: true,
		reader: new Ext.data.JsonReader({ 	// Console Reader Object
			root: 'servlets', 
			fields: ['rtype', 'name', 'persist', 'running', 'executions']
		}),
		listeners: {
			'load' : function() {
				// dsConsole.loadData(dsOpps.reader.jsonData);
			}
		}
	}), 
	init : function() {
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
									xtype : "grid",
									title : "Servlets",
									tbar : {
										items : [
											{
												text : "Refresh",
												handler: function(){
													adminDashboard.dsServlets.load();
												}
											}
										]
									},
									store : this.dsServlets,
									columns : [
										{ id: "servlet", header: "Servlet", width: 150, sortable: true, dataIndex : "name"},
										{ id: "persist", header: "Persistant", width: 50, sortable: true, dataIndex : "persist"},
										{ id: "running", header: "Running", width: 50, sortable: true, dataIndex : "running"},
										{ id: "executions", header: "Executions", width: 50, sortable: true, dataIndex : "executions"}
									]
								}
							]
						},{
							xtype : "panel",
							split : true,
							title : "Details",
							height : 200,
							region : "south"
						}
					]
				}
			]
		});
	}
}