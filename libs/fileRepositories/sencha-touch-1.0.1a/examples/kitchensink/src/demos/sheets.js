demos.Sheets = new Ext.Panel({
    layout: {
        type: 'vbox',
        pack: 'center'
    },
    items: [{
        xtype: 'button',
        text: 'Launch an Action Sheet',
        handler: function() {
            if (!this.actions) {
                this.actions = new Ext.ActionSheet({
                    items : [
	                    { text : 'Delete draft',
	                      ui: 'drastic',
	                      handler : Ext.emptyFn
	                    },
	                    { text : 'Save draft',
	                      handler : Ext.emptyFn
	                    },
	                    { text : 'Cancel',
	                      ui: 'action',
                          scope : this,
	                      handler : function(){
                             this.actions.hide();
                          }
	                    }
                    ]
                });
            }
            this.actions.show();
        }
    }]
});