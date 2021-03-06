/**
 * @class Ext.Component
 * @extends Ext.lib.Component
 * <p>Base class for all Ext components.  All subclasses of Component may participate in the automated
 * Ext component lifecycle of creation, rendering and destruction which is provided by the {@link Ext.Container Container} class.
 * Components may be added to a Container through the {@link Ext.Container#items items} config option at the time the Container is created,
 * or they may be added dynamically via the {@link Ext.Container#add add} method.</p>
 * <p>The Component base class has built-in support for basic hide/show and enable/disable behavior.</p>
 * <p>All Components are registered with the {@link Ext.ComponentMgr} on construction so that they can be referenced at any time via
 * {@link Ext#getCmp}, passing the {@link #id}.</p>
 * <p>All user-developed visual widgets that are required to participate in automated lifecycle and size management should subclass Component (or
 * {@link Ext.BoxComponent} if managed box model handling is required, ie height and width management).</p>
 * <p>See the <a href="http://extjs.com/learn/Tutorial:Creating_new_UI_controls">Creating new UI controls</a> tutorial for details on how
 * and to either extend or augment ExtJs base classes to create custom Components.</p>
 * <p>Every component has a specific xtype, which is its Ext-specific type name, along with methods for checking the
 * xtype like {@link #getXType} and {@link #isXType}. This is the list of all valid xtypes:</p>
 * <h2>Useful Properties</h2>
 * <ul class="list">
 *   <li>{@link #fullscreen}</li>
 * </ul>
 * <pre>
xtype            Class
-------------    ------------------
button           {@link Ext.Button}
component        {@link Ext.Component}
container        {@link Ext.Container}
dataview         {@link Ext.DataView}
panel            {@link Ext.Panel}
slider           {@link Ext.form.Slider}
toolbar          {@link Ext.Toolbar}
spacer           {@link Ext.Spacer}
tabpanel         {@link Ext.TabPanel}

Form components
---------------------------------------
formpanel        {@link Ext.form.FormPanel}
checkboxfield    {@link Ext.form.Checkbox}
selectfield      {@link Ext.form.Select}
field            {@link Ext.form.Field}
fieldset         {@link Ext.form.FieldSet}
hiddenfield      {@link Ext.form.Hidden}
numberfield      {@link Ext.form.Number}
radiofield       {@link Ext.form.Radio}
textareafield    {@link Ext.form.TextArea}
textfield        {@link Ext.form.Text}
togglefield      {@link Ext.form.Toggle}
</pre>
 * @constructor
 * @param {Ext.Element/String/Object} config The configuration options may be specified as either:
 * <div class="mdetail-params"><ul>
 * <li><b>an element</b> :
 * <p class="sub-desc">it is set as the internal element and its id used as the component id</p></li>
 * <li><b>a string</b> :
 * <p class="sub-desc">it is assumed to be the id of an existing element and is used as the component id</p></li>
 * <li><b>anything else</b> :
 * <p class="sub-desc">it is assumed to be a standard config object and is applied to the component</p></li>
 * </ul></div>
 * @xtype component
 */
Ext.Component = Ext.extend(Ext.lib.Component, {
    /**
    * @cfg {Object/String/Boolean} showAnimation
    * The type of animation you want to use when this component is shown. If you set this
    * this hide animation will automatically be the opposite.
    */
    showAnimation: null,

    /**
     * @cfg {Boolean} monitorOrientation
     * Monitor Orientation change
     */
    monitorOrientation: false,

    /**
     * @cfg {Boolean} floatingCls
     * The class that is being added to this component when its floating.
     * (defaults to x-floating)
     */
    floatingCls: 'x-floating',

    /**
    * @cfg {Boolean} hideOnMaskTap
    * True to automatically bind a tap listener to the mask that hides the window.
    * Defaults to true. Note: if you set this property to false you have to programmaticaly
    * hide the overlay.
    */
    hideOnMaskTap: true,
    
    /**
    * @cfg {Boolean} stopMaskTapEvent
    * True to stop the event that fires when you click outside the floating component.
    * Defalts to true.
    */    
    stopMaskTapEvent: true,

    /**
     * @cfg {Boolean} centered
     * Center the Component. Defaults to false.
     */
    centered: false,

    /**
     * @cfg {Boolean} modal
     * True to make the Component modal and mask everything behind it when displayed, false to display it without
     * restricting access to other UI elements (defaults to false).
     */
    modal: false,

    /**
     * @cfg {Mixed} scroll
     * Configure the component to be scrollable. Acceptable values are:
     * <ul>
     * <li>'horizontal', 'vertical', 'both' to enabling scrolling for that direction.</li>
     * <li>A {@link Ext.util.Scroller Scroller} configuration.</li>
     * <li>false to explicitly disable scrolling.</li>
     * </ul>
     * 
     * Enabling scrolling immediately sets the monitorOrientation config to true (for {@link Ext.Panel Panel})
     */
     
     /**
      * @cfg {Boolean} fullscreen
      * Force the component to take up 100% width and height available. Defaults to false.
      * Setting this configuration immediately sets the monitorOrientation config to true.
      * Setting this to true will render the component instantly.
      */
    fullscreen: false,

    /**
     * @cfg {Boolean} layoutOnOrientationChange
     * Set this to true to automatically relayout this component on orientation change.
     * This property is set to true by default if a component is floating unless you specifically
     * set this to false. Also note that you dont have to set this property to true if this component
     * is a child of a fullscreen container, since fullscreen components are also laid out automatically
     * on orientation change.
     * Defaults to <tt>null</tt>
     */
    layoutOnOrientationChange: null,
    
    // @private
    initComponent : function() {
        this.addEvents(
            /**
             * @event beforeorientationchange
             * Fires before the orientation changes, if the monitorOrientation
             * configuration is set to true. Return false to stop the orientation change.
             * @param {Ext.Panel} this
             * @param {String} orientation 'landscape' or 'portrait'
             * @param {Number} width
             * @param {Number} height
             */
            'beforeorientationchange',
            /**
             * @event orientationchange
             * Fires when the orientation changes, if the monitorOrientation
             * configuration is set to true.
             * @param {Ext.Panel} this
             * @param {String} orientation 'landscape' or 'portrait'
             * @param {Number} width
             * @param {Number} height
             */
            'orientationchange'
        );

        if (this.fullscreen || this.floating) {
            this.monitorOrientation = true;
            this.autoRender = true;
        }

        if (this.fullscreen) {
            var viewportSize = Ext.Viewport.getSize();
            this.width = viewportSize.width;
            this.height = viewportSize.height;
            this.cls = (this.cls || '') + ' x-fullscreen';
            this.renderTo = document.body;
        }
    },

    onRender : function() {
        Ext.Component.superclass.onRender.apply(this, arguments);

        if (this.monitorOrientation) {
            this.el.addCls('x-' + Ext.Viewport.orientation);
        }

        if (this.floating) {
            this.setFloating(true);
        }

        if (this.draggable) {
            this.setDraggable(this.draggable);
        }

        if (this.scroll) {
            this.setScrollable(this.scroll);
        }
    },

    afterRender : function() {
        if (this.fullscreen) {
            this.layoutOrientation(Ext.Viewport.orientation, this.width, this.height);
        }
        Ext.Component.superclass.afterRender.call(this);
    },

    initEvents : function() {
        Ext.Component.superclass.initEvents.call(this);

        if (this.monitorOrientation) {
            Ext.EventManager.onOrientationChange(this.setOrientation, this);
        }
    },

    // Template method that can be overriden to perform logic after the panel has layed out itself
    // e.g. Resized the body and positioned all docked items.
    afterComponentLayout : function() {
        var scrollEl = this.scrollEl,
            scroller = this.scroller,
            parentEl;

        if (scrollEl) {
            parentEl = scrollEl.parent();

            if (scroller.horizontal) {
                scrollEl.setStyle('min-width', parentEl.getWidth(true) + 'px');
                scrollEl.setHeight(parentEl.getHeight(true) || null);
            }
            if (scroller.vertical) {
                scrollEl.setStyle('min-height', parentEl.getHeight(true) + 'px');
                scrollEl.setWidth(parentEl.getWidth(true) || null);
            }
            scroller.updateBoundary(true);
        }

        if (this.fullscreen && Ext.is.iPad) {
            Ext.repaint();
        }
    },

    layoutOrientation: Ext.emptyFn,

    // Inherit docs
    update: function(){
        // We override this here so we can call updateBoundary once the update happens.
        Ext.Component.superclass.update.apply(this, arguments);
        var scroller = this.scroller;
        if (scroller && scroller.updateBoundary){
            scroller.updateBoundary(true);
        }
    },

    /**
     * Show the component.
     * @param {Object/String/Boolean} animation (optional) Defaults to false.
     */
    show : function(animation) {
        var rendered = this.rendered;
        if ((this.hidden || !rendered) && this.fireEvent('beforeshow', this) !== false) {
            if (this.anchorEl) {
                this.anchorEl.hide();
            }
            if (!rendered && this.autoRender) {
                this.render(Ext.isBoolean(this.autoRender) ? Ext.getBody() : this.autoRender);
            }
            this.hidden = false;
            if (this.rendered) {
                this.onShow(animation);
                this.fireEvent('show', this);
            }
        }
        return this;
    },

    /**
     * Show this component relative another component or element.
     * @param {Mixed} alignTo Element or Component
     * @param {Object/String/Boolean} animation
     * @param {Boolean} allowOnSide true to allow this element to be aligned on the left or right.
     * @returns {Ext.Component} this
     */
    showBy : function(alignTo, animation, allowSides, anchor) {
        if (!this.floating) {
            return this;
        }
        
        if (alignTo.isComponent) {
            alignTo = alignTo.el;
        }
        else {
            alignTo = Ext.get(alignTo);
        }

        this.x = 0;
        this.y = 0;

        this.show(animation);

        if (anchor !== false) {
            if (!this.anchorEl) {
                this.anchorEl = this.el.createChild({
                    cls: 'x-anchor'
                });
            }
            this.anchorEl.show();            
        }
        
        this.alignTo(alignTo, allowSides, 20);
    },
    
    alignTo : function(alignTo, allowSides, offset) {
        // We are going to try and position this component to the alignTo element.
        var alignBox = alignTo.getPageBox(),
            constrainBox = {
                width: window.innerWidth,
                height: window.innerHeight
            },
            size = this.getSize(),
            newSize = {
                width: Math.min(size.width, constrainBox.width),
                height: Math.min(size.height, constrainBox.height)
            },
            position,
            index = 2,
            positionMap = [
                'tl-bl',
                't-b',
                'tr-br',
                'l-r',
                'l-r',
                'r-l',
                'bl-tl',
                'b-t',
                'br-tr'
            ],
            anchorEl = this.anchorEl,
            offsets = [0, offset],
            targetBox, cls,
            onSides = false,
            arrowOffsets = [0, 0],
            alignCenterX = alignBox.left + (alignBox.width / 2),
            alignCenterY = alignBox.top + (alignBox.height / 2);

        if (alignCenterX <= constrainBox.width * (1/3)) {
            index = 1;
            arrowOffsets[0] = 25;
        }
        else if (alignCenterX >= constrainBox.width * (2/3)) {
            index = 3;
            arrowOffsets[0] = -30;
        }
        
        if (alignCenterY >= constrainBox.height * (2/3)) {
            index += 6;
            offsets = [0, -offset];
            arrowOffsets[1] = -10;
        }
        // If the alignTo element is vertically in the middle part of the screen
        // we position it left or right.
        else if (allowSides !== false && alignCenterY >= constrainBox.height * (1/3)) {
            index += 3;
            offsets = (index <= 5) ? [offset, 0] : [-offset, 0];
            arrowOffsets = (index <= 5) ? [10, 0] : [-10, 0];
            onSides = true;
        }
        else {
            arrowOffsets[1] = 10;
        }
        
        position = positionMap[index-1];
        targetBox = this.el.getAlignToXY(alignTo, position, offsets);

        // If the window is going to be aligned on the left or right of the alignTo element
        // we make sure the height is smaller then the window height, and the width
        if (onSides) {
            if (targetBox[0] < 0) {
                newSize.width = alignBox.left - offset;
            }
            else if (targetBox[0] + newSize.width > constrainBox.width) {
                newSize.width = constrainBox.width - alignBox.right - offset;
            }
        }
        else {
            if (targetBox[1] < 0) {
                newSize.height = alignBox.top - offset;
            }
            else if (targetBox[1] + newSize.height > constrainBox.height) {
                newSize.height = constrainBox.height - alignBox.bottom - offset;
            }
        }
        
        if (newSize.width != size.width) {
            this.setSize(newSize.width);
        }
        else if (newSize.height != size.height) {
            this.setSize(undefined, newSize.height);
        }

        targetBox = this.el.getAlignToXY(alignTo, position, offsets);                
        this.setPosition(targetBox[0], targetBox[1]);
        
        if (anchorEl) {
            // we are at the top
            anchorEl.removeCls(['x-anchor-bottom', 'x-anchor-left', 'x-anchor-right', 'x-anchor-top']);
            if (offsets[1] == offset) {
                cls = 'x-anchor-top';
            }
            else if (offsets[1] == -offset) {
                cls = 'x-anchor-bottom';
            }
            else if (offsets[0] == offset) {
                cls = 'x-anchor-left';
            }
            else {
                cls = 'x-anchor-right';
            }
            targetBox = anchorEl.getAlignToXY(alignTo, position, arrowOffsets);
            anchorEl.setXY(targetBox);
            anchorEl.addCls(cls);
        }
        
        return position;
    },

    /**
     * Show this component centered of its parent or the window
     * This only applies when the component is floating.
     * @param {Boolean} centered True to center, false to remove centering
     * @returns {Ext.Component} this
     */
    setCentered : function(centered, update) {
        this.centered = centered;

        if (this.rendered && update) {
            var x, y;
            if (!this.ownerCt) {
                x = (Ext.Element.getViewportWidth() / 2) - (this.getWidth() / 2);
                y = (Ext.Element.getViewportHeight() / 2) - (this.getHeight() / 2);
            }
            else {
                x = (this.ownerCt.getTargetEl().getWidth() / 2) - (this.getWidth() / 2);
                y = (this.ownerCt.getTargetEl().getHeight() / 2) - (this.getHeight() / 2);
            }
            this.setPosition(x, y);
        }

        return this;
    },

    /**
     * Hide the component
     * @param {Object/String/Boolean} animation (optional) Defaults to false.
     */
    hide : function(animation) {
        if (!this.hidden && this.fireEvent('beforehide', this) !== false) {
            this.hidden = true;
            if (this.rendered) {
                this.onHide(animation, true);
            }
        }
        return this;
    },

    // @private
    onShow : function(animation) {
        this.el.show();
        
        Ext.Component.superclass.onShow.call(this, animation);
        
        if (animation === undefined || animation === true) {
            animation = this.showAnimation;
        }

        if (this.floating) {
            this.el.dom.parentNode || this.el.appendTo(document.body);

            if (animation) {
                this.el.setStyle('opacity', 0.01);
            }

            if (this.centered) {
                this.setCentered(true, true);
            }
            else {
                this.setPosition(this.x, this.y);
            }

            if (this.modal) {
                this.el.parent().mask(null, 'x-mask-gray');
            }

            if (this.hideOnMaskTap) {
                Ext.getDoc().on('touchstart', this.onFloatingTouchStart, this, {capture: true, subsequent: true});
            }
        }
        
        if (animation) {
            //this.el.setStyle('opacity', 0.01);

            Ext.Anim.run(this, animation, {
                out: false,
                autoClear: true
            });

            this.showAnimation = animation;
        }
    },

    // @private
    onFloatingTouchStart: function(e) {
        if (!this.el.contains(e.target)) {
            this.hide();
            if (this.stopMaskTapEvent || Ext.fly(e.target).hasCls('x-mask')) {
                e.stopEvent();
            }
        }
    },

    // @private
    onHide : function(animation, fireHideEvent) {
        if (animation === undefined || animation === true) {
            animation = this.showAnimation;
        }

        if (this.hideOnMaskTap && this.floating) {
            Ext.getDoc().un('touchstart', this.onFloatingTouchStart, this, {capture: true, subsequent: true});
        }

        if (animation) {
            Ext.Anim.run(this, animation, {
                out: true,
                reverse: true,
                autoClear: true,
                scope: this,
                fireHideEvent: fireHideEvent,
                after: this.doHide
            });
        } else {
            this.doHide(null, {fireHideEvent: fireHideEvent});
        }
    },

    // private
    doHide : function(el, options) {
        var parent = this.el.parent();

        this.el.hide();
        
        if (parent && this.floating && this.modal) {
            parent.unmask();
        }
        if (options && options.fireHideEvent) {
            this.fireEvent('hide', this);
        }
    },

    /**
     * Sets a Component as scrollable.
     * @param {Mixed} config
     * Acceptable values are a Ext.Scroller configuration, 'horizontal', 'vertical', 'both', and false
     */
    setScrollable : function(config) {
        if (!this.rendered) {
            this.scroll = config;
            return;
        }

        Ext.destroy(this.scroller);
        this.scroller = null;
        
        if (config !== false) {
            var direction = Ext.isObject(config) ? config.direction: config;
            config = Ext.apply({},
            Ext.isObject(config) ? config: {}, {
//                momentum: true,
                direction: direction
            });

            if (!this.scrollEl) {
                this.scrollEl = this.getTargetEl().createChild();
                this.originalGetTargetEl = this.getTargetEl;
                this.getTargetEl = function() {
                    return this.scrollEl;
                };
            }

            this.scroller = (new Ext.util.ScrollView(this.scrollEl, config)).scroller;
        }
        else {
            this.getTargetEl = this.originalGetTargetEl;
        }
    },

    /**
     * Sets a Component as floating.
     * @param {Boolean} floating
     * @param {Boolean} autoShow
     */
    setFloating : function(floating, autoShow) {
        this.floating = !!floating;
        this.hidden = true;
        if (this.rendered) {
            if (floating !== false) {
                this.el.addCls(this.floatingCls);
                if (autoShow) {
                    this.show();
                }
            }
            else {
                this.el.removeCls(this.floatingCls);
                Ext.getDoc().un('touchstart', this.onFloatingTouchStart, this);
            }
        }
        else if (floating !== false) {
            if (this.layoutOnOrientationChange !== false) {
                this.layoutOnOrientationChange = true;
            }
            this.autoRender = true;
        }
    },

    /**
     * Sets a Component as draggable.
     * @param {Boolean/Mixed} draggable On first call, this can be a config object for {@link Ext.util.Draggable}.
     * Afterwards, if set to false, the existing draggable object will be disabled
     * @param {Boolean} autoShow
     */
    setDraggable : function(draggable, autoShow) {
        this.isDraggable = draggable;

        if (this.rendered) {
            if (draggable === false) {
                if (this.dragObj) {
                    this.dragObj.disable();
                }
            } else {
                if (autoShow) {
                    this.show();
                }
                if (this.dragObj) {
                    this.dragObj.enable();
                } else {
                    this.dragObj = new Ext.util.Draggable(this.el, Ext.apply({}, this.draggable || {}));
                    this.relayEvents(this.dragObj, ['dragstart', 'beforedragend' ,'drag', 'dragend']);
                }
            }
        }
    },

    /**
     * Sets the orientation for the Panel.
     * @param {String} orientation 'landscape' or 'portrait'
     * @param {Number/String} width New width of the Panel.
     * @param {Number/String} height New height of the Panel.
     */
    setOrientation : function(orientation, w, h) {
        if (this.fireEvent('beforeorientationchange', this, orientation, w, h) !== false) {
            if (this.orientation != orientation) {
                this.el.removeCls('x-' + this.orientation);
                this.el.addCls('x-' + orientation);
            }

            this.orientation = orientation;
            this.layoutOrientation(orientation, w, h);

            if (this.fullscreen) {
                this.setSize(w, h);
            }
            else if (this.layoutOnOrientationChange) {
                this.doComponentLayout();
            }

            if (this.floating && this.centered) {
                this.setCentered(true, true);
            }

            this.onOrientationChange(orientation, w, h);
            this.fireEvent('orientationchange', this, orientation, w, h);
        }
    },

    // @private
    onOrientationChange : Ext.emptyFn,

    beforeDestroy : function() {
        if (this.floating && this.modal && !this.hidden) {
            this.el.parent().unmask();
        }
        Ext.destroy(this.scroller);
        Ext.Component.superclass.beforeDestroy.call(this);
    },
    
    onDestroy : function() {
        if (this.monitorOrientation && Ext.EventManager.orientationEvent) {
            Ext.EventManager.orientationEvent.removeListener(this.setOrientation, this);
        }
        
        Ext.Component.superclass.onDestroy.call(this);
    }
});

// @xtype box
Ext.BoxComponent = Ext.Component;

Ext.reg('component', Ext.Component);
Ext.reg('box', Ext.BoxComponent);