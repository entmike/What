var newApp = function() {
	var appForm = {
		xtype : "form",
		id : "newAppForm",
		border : false,
		bodyStyle : "padding: 5px; background:transparent",
		url : "newApp",
		items : [
			{
				xtype : "textfield",
				msgTarget: "side",
				fieldLabel : "App Name",
				name : "appName",
				allowBlank : false
			},{
				xtype : "textfield",
				msgTarget: "side",
				fieldLabel : "Directory",
				name : "appdir",
				allowBlank : false
			}
		],
		
	}
	var w = new Ext.Window({
		title : "New App",
		modal : true,
		width : 340,
		autoHeight: true,
		layout : "form",
		closeAction : "close",
		bodyStyle : "padding:5px;",
		items : [ appForm ],
		bbar : {
			items : [
				"->", {	text : "Cancel", handler : function(){w.close()} }, "-",
				{
					text : "Create",
					handler : function(a,b) {
						Ext.getCmp("newAppForm").getForm().submit({
							waitMsg:'Creating Web App...',
							submitEmptyText: false,
							success: function(form, action) {
								w.close();
								Ext.Msg.alert('Success', action.result.msg);
							},
							failure: function(form, action) {
								Ext.Msg.alert('Error', action.result.msg);
							}
						});
					}
				}
			]
		}
	});
	w.show();
}