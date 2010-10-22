Ext.BLANK_IMAGE_URL = 'ext-3.3.0/resources/images/default/s.gif';
Ext.onReady(function() {	// Main Entry Method
	Ext.QuickTips.init();	// Enable Quick Tooltips
	Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
	adminDashboard.init();
});
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
									xtype : "treepanel",
									title : "Applications",
									tbar : {
										items : [
											{
												text : "Refresh",
												handler: function(){
													// adminDashboard.dsApplications.load();
												}
											}
										]
									},
									animate:true, 
									autoScroll:true,
									loader: new Ext.tree.TreeLoader({
										dataUrl:'/Admin/getApplications',
										requestMethod : "GET"
									}),
									containerScroll: true,
									border: false,
									root: {
										nodeType: 'async',
										text: 'Applications',
										draggable: false,
										id: 'source'
									},
									dropConfig: {appendOnly:true}
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