/**
* @class twitter.views.TimeLine
* @extends Ext.DataView
* 
* The TimeLine component is a very simple DataView which just defines a template, loading text and empty text. It is
* passed a Tweet store when rendered and simply displays each tweet next to the tweeter's image.
* 
* In the configured template we render each tweet into a div, and at the bottom add a special 'nextPage' div. We set
* up a tap listener on that div to load the next page of data.
* 
*/
twitter.views.TimeLine = Ext.extend(Ext.DataView, {
    cls: 'timeline',
    
    itemSelector: 'div.tweet',
    emptyText   : '<p class="no-searches">No tweets found matching that search</p>',
    
    disableSelection: true,

    tpl: new Ext.XTemplate(
        '<tpl for=".">',
            '<div class="tweet">',
                '<img src="{profile_image_url}" />',
                
                '<div class="x-tweetanchor"></div>',
                '<div class="tweet-bubble">',
                    '<div class="tweet-content">',
                        '<h2>{from_user}</h2>',
                        '<p>{text:this.linkify}</p><strong></strong>',
                        '<span class="posted">{created_at}</span>',
                    '</div>',
                '</div>',
            '</div>',
        '</tpl>',
        '<div class="nextPage">',
            '<p class="load">Load next page</p>',
            '<p class="loading">Loading...</p>',
        '</div>',
        {
            /**
             * Simply wraps a link tag around each detected url
             */
            linkify: function(value) {
                return value.replace(/(http:\/\/[^\s]*)/g, "<a target=\"_blank\" href=\"$1\">$1</a>");
            }
        }
    ),
    
    /**
     * Here we need to add a custom listener to the DataView's store. To do this, we override the bindStore function, 
     * which is called by the framework whenever a store is bound to this view. We add a listener to the store's 'load'
     * event, 
     * @param {Ext.data.Store} store The new store to bind
     */
    bindStore: function(store) {
        if (this.store != undefined && store != this.store) {
            this.store.un('load', this.allowLoadNextPage, this);
        }
        
        store.on('load', this.allowLoadNextPage, this);
        
        twitter.views.TimeLine.superclass.bindStore.apply(this, arguments);
    },
    
    /**
     * Here we make a slight modification to the default function. Because we're handling paging in a custom manner 
     * (adding a 'nextPage' div which loads the next page), we only want to show the configured loadingText if the
     * store is currently empty (e.g. store.getCount() equals zero)
     */
    onBeforeLoad: function() {
        if (this.loadingText && this.store.getCount() == 0) {
            this.getSelectionModel().deselectAll();
            this.all.clear();
        }
    },
    
    /**
     * In our template (see top of this file), we rendered a 'tweet' div for each record, plus a 'nextPage' div at the 
     * bottom. Here we listen for taps on that div and load the store's next page. Adding the 'x-loading' class to the
     * div hides the 'Load next page' text (see resources/scss/application.scss for the CSS used to achieve this)
     */
    onContainerTap: function(e) {
        var target = e.getTarget('div.nextPage');
        
        if (target && !this.loading) {
            this.store.nextPage();
            
            Ext.fly(target).addCls('x-loading');
        }
        
        twitter.views.TimeLine.superclass.onContainerTap.apply(this, arguments);
    },
    
    /**
     * @private
     * This is called whenever the Store has finished a loading request. It removes the 'x-loading' class from the
     * 'nextPage' div (see the tpl definition at the top of this file), which hides the 'Loading...' text and reveals
     * the 'Load next page' text.
     */
    allowLoadNextPage: function() {
        var el = this.el.down('div.nextPage');
        
        if (el) {
            Ext.fly(el).removeCls('x-loading');
        }
    }
});

Ext.reg('tweetsList', twitter.views.TimeLine);