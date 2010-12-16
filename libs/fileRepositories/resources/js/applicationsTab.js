var applicationsTab = {
	// Wrapper Panel
	xtype:"panel",
	title:"Applications",
	layout: "border",
	border : false,
	items:[
		{	// App Details Panel
			xtype : "panel",
			border : false,
			autoScroll : true,
			id : "appDetails",
			split : true,
			title : "Details",
			height : 200,
			region : "south"
		},
		new Ext.ux.tree.ColumnTree({
			// App Tree
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
						text : "New App...",
						handler : newApp,
						iconCls : "newWebAppButton"
					},"-",{
						text : "Refresh",
						iconCls : "refreshButton",
						handler: function(){
							adminDashboard.appTreeLoader.load(Ext.getCmp("applicationTree").getRootNode());
						}
					},"-",{
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
			autoExpandColumn : "description",
			columns:[{
				header:'Component',
				width:300,
				dataIndex:'component'
			},{
				header:'Description',
				width:400,
				dataIndex:'description'
			}],
			loader: adminDashboard.appTreeLoader,
			root: new Ext.tree.AsyncTreeNode({
				text: 'Apps'
			}),
			listeners : {
				click : function(node, event){
				// Context Level
				if(node.attributes.type == "context") {
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
												webApp : node.attributes.contextName																			},
											method : "GET",
											success : function(response, opts) {
												Ext.Msg.alert('Status', Ext.decode(response.responseText).msg);
											},
											failure : function(response, opts) {
												Ext.Msg.alert('Error', Ext.decode(response.responseText).msg);
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
				};
				// Servlet Level 
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
													webApp : node.parentNode.parentNode.attributes.contextName,
													servlet : node.attributes.text
												},
												method : "GET",
												success : function(response, opts) {
													Ext.Msg.alert('Status', Ext.decode(response.responseText).msg);
												},
												failure : function(response, opts) {
													Ext.Msg.alert('Error', Ext.decode(response.responseText).msg);
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
													webApp : node.parentNode.parentNode.attributes.contextName,
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
													Ext.Msg.alert('Error', Ext.decode(response.responseText).msg);
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
					};
					// Servlet Options Level
					if(node.attributes.type == "servletOption"){
						var params = {
							webApp : node.parentNode.parentNode.parentNode.parentNode.attributes.contextName,
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
								Ext.Msg.alert('Error', Ext.decode(response.responseText).msg);
							}
						});
					}
				}
			}
		})
	]
}