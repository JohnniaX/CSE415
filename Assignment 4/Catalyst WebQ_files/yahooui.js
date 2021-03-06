
Solstice.YahooUI = function(){};

/** Messaging **/

Solstice.YahooUI.Message = function(){};
Solstice.YahooUI.Message.fadeTimerId = null;
Solstice.YahooUI.Message.scrollTopLimit = 0;

/**
 * @function Solstice.YahooUI.Message.init
 * @description Init and register a YUI Overlay object for holding messages 
 * @param {Object} Object containing message content
 * @returns {Object} YAHOO.widget.Overlay 
 */
Solstice.YahooUI.Message.init = function(messages) {
    var overlay = Solstice.YahooUI.PopIn.get('sol_message_container');
    if (!overlay) {
        overlay = new YAHOO.widget.Overlay('sol_message_container', {
            zIndex: 999,
            effect: {effect:YAHOO.widget.ContainerEffect.FADE, duration:1},
            visible: false
        });
        overlay.hideEvent.subscribe(Solstice.YahooUI.Message._clear);
        Solstice.YahooUI.PopIn.registry['sol_message_container'] = overlay;
        Solstice.YahooUI.PopIn.manager.register(overlay);
    }

    var container = document.getElementById('sol_message_area') || document.body;
    overlay.render(container);

    // Cache this value for later
    Solstice.YahooUI.Message.scrollTopLimit = YAHOO.util.Dom.getY(container);

    // Look for cookie-based messages
    var cookie_messages = Solstice.Message.readCookie();
    if (cookie_messages.length) {
        messages = cookie_messages;
    }
    if (messages) {
        for (i = 0; i < messages.length; i++) {
            Solstice.YahooUI.Message.set(messages[i].type, messages[i].msg, true);
        }
    }
    return overlay;
};

/**
 * @function Solstice.YahooUI.Message.clear
 * @description Clears the message container
 * @returns {Boolean} true on success
 */
Solstice.YahooUI.Message.clear = function() {
    var overlay = Solstice.YahooUI.PopIn.get('sol_message_container');
    if (overlay) {
        overlay.hide();
    }
    return true;
}

Solstice.YahooUI.Message.clearInProgress = function () {
    var container = document.getElementById('sol_inprogress_messaging');
    if(container) {
        // remove any existing in progress messages
        if (container.hasChildNodes()){
            while ( container.childNodes.length >= 1 ){
                container.removeChild( container.firstChild );
            }
        }
    }

    return true;
}

/**
 * @function Solstice.YahooUI.Message.clear
 * @description Runs after the overlay is finished hiding 
 * @returns {Boolean} true on success
 */
Solstice.YahooUI.Message._clear = function() {
    var overlay = this;
    if(!overlay) {
        overlay = Solstice.YahooUI.PopIn.get('sol_message_container');
    }

    if(overlay.body) {
        overlay.body.innerHTML = '';
    }

    return true;
};

/**
 * @function Solstice.YahooUI.Message.clearError
 * @description Clears the message container if it contains 'error' type
 * @returns {Boolean} true on success
 */
Solstice.YahooUI.Message.clearError = function() {
    var overlay = Solstice.YahooUI.PopIn.get('sol_message_container');
    if (YAHOO.util.Dom.hasClass(overlay.body, 'sol-message-error')) {
        overlay.hide();
    }
    return true;
};

/**
 * @function Solstice.YahooUI.Message.set
 * @description Sets a message into the container 
 * @param {String} The type of message (success|error|information|warning|inprogress)
 * @param {String} Message content
 * @param {Boolean} Appends message if true
 * @returns {Boolean} true on success, false otherwise
 */
Solstice.YahooUI.Message.set = function(type, msg, append) {
    if (!type.match(/^(?:success|error|information|warning|inprogress)$/)) {
        Solstice.log('Solstice.YahooUI.Message.set: Invalid type ' + type);
        return false;
    }

    //inprogess messages are seperate from the rest, and so never fade
    if (Solstice.YahooUI.Message.fadeTimerId && type != 'inprogress') {
        window.clearTimeout(Solstice.YahooUI.Message.fadeTimerId);
    }

    var overlay = Solstice.YahooUI.Message.init();
    
    if (type != 'inprogress' && overlay.element.style.visibility == 'visible' && overlay.element.style.opacity < 1.0) {
        window.setTimeout(function() {
            Solstice.YahooUI.Message.set(type, msg, append);
        }, 1000);
        return;
    }

    var el = document.createElement('DIV');
    el.className = 'sol-message';
    el.innerHTML = msg;
    el.setAttribute("role", "alert");

    if(type =='inprogress'){
        var container = document.getElementById('sol_inprogress_messaging');
        if(!container) {
            Solstice.log('Missing in progress container, please add it to your theme');
        }
        
        if(!append){
            // remove any existing in progress messages
            if (container.hasChildNodes()){
                while ( container.childNodes.length >= 1 ){
                    container.removeChild( container.firstChild );       
                } 
            }
        }
        
        YAHOO.util.Dom.addClass(el, 'sol-message-' + type);
        container.appendChild(el);
        return true;
    }
    
    if (overlay.body && append) {
        overlay.body.appendChild(el);
    } else {
        overlay.setBody(el);
    }

    overlay.body.className = 'bd'; // Reset the body class
    YAHOO.util.Dom.addClass(overlay.body, 'sol-message-' + type);

    // Success/Error/InProgress messages: position is fixed to the viewport;
    // We could do this with a simple css class, but a listener is required
    // to correctly place the overlay at the top of the page
    if (type.match(/^(?:success|error|inprogress)$/)) {
        Solstice.YahooUI.Message._checkPosition();
        Solstice.Event.add(window, 'scroll', Solstice.YahooUI.Message._checkPosition, overlay, true);

        // Success message only: clear after an interval
        if (type == 'success') {
            Solstice.YahooUI.Message.fadeTimerId = window.setTimeout('Solstice.YahooUI.Message.clear()', 6200);
        }
    } else {
        Solstice.Event.remove(window, 'scroll', Solstice.YahooUI.Message._checkPosition);
    }

    // Center the overlay horizontally
    var x = (YAHOO.util.Dom.getViewportWidth() / 2) -
        (overlay.element.offsetWidth / 2) +
        YAHOO.util.Dom.getDocumentScrollLeft();
    overlay.cfg.setProperty('x', parseInt(x));
    overlay.show();
    Solstice.YahooUI.PopIn.manager.focus(overlay);

    return true;
};

Solstice.YahooUI.Message._checkPosition = function(ev) {
    var el = Solstice.YahooUI.PopIn.get('sol_message_container').element;
    if (YAHOO.util.Dom.getDocumentScrollTop() > Solstice.YahooUI.Message.scrollTopLimit) {
        el.style.position = 'fixed';
        el.style.top = '0';
    } else {
        el.style.position = '';
        el.style.top = '';
    }
};


/** Scrolling **/

Solstice.YahooUI.inTopScrollArea = false;
Solstice.YahooUI.inBottomScrollArea = false;
Solstice.YahooUI.scrollInterval = 15;
Solstice.YahooUI.scrollDistance = 8;


Solstice.YahooUI.tooltip_showdelay = 750;
Solstice.YahooUI.tooltip_hidedelay = 50;
Solstice.YahooUI.tooltip_autodismiss = 5000;
// This is to keep tooltips above flyout menus.  Hopefully no flyout menu is launched from an element at zindex of 998 or higher.  This could be improved.
Solstice.YahooUI.tooltip_zindex = 9999;
Solstice.YahooUI.popin_zindex = 999;

Solstice.YahooUI.tooltip = function(title, args) {

    var delayargs = {
        showdelay:Solstice.YahooUI.tooltip_showdelay, 
        hidedelay:Solstice.YahooUI.tooltip_hidedelay, 
        autodismissdelay:Solstice.YahooUI.tooltip_autodismiss,
        zindex: Solstice.YahooUI.tooltip_zindex
        };

    for (key in args) {
        delayargs[key] = args[key];
    }
    return new YAHOO.widget.Tooltip(title, delayargs );
}

Solstice.YahooUI.scrollDown = function (){
    if(Solstice.YahooUI.inBottomScrollArea){
        var scroll_to = Solstice.Geometry.getScrollYOffset() + Solstice.YahooUI.scrollDistance;
        height = Solstice.Geometry.getBrowserHeight();
        page_height= Solstice.Geometry.getPageHeight();

        if(scroll_to < (page_height - height)){
            window.scrollTo(0, scroll_to);
            setTimeout('Solstice.YahooUI.scrollDown();', Solstice.YahooUI.scrollInterval);
        }
    }
}

Solstice.YahooUI.scrollUp = function (){
    if(Solstice.YahooUI.inTopScrollArea){
        var scroll_to = Solstice.Geometry.getScrollYOffset() - Solstice.YahooUI.scrollDistance;
        if(scroll_to > 0){
            window.scrollTo(0, scroll_to);
            setTimeout('Solstice.YahooUI.scrollUp();', Solstice.YahooUI.scrollInterval);
        }
    }
}

Solstice.YahooUI.addHorizontalSortItem = function (group, id, options) {
    var dd = new YAHOO.util.DDProxy(id, group);
    dd.setYConstraint(0,0);
    Solstice.YahooUI._addSortItem(dd, group, id, options);
}
Solstice.YahooUI.addVerticalSortItem = function (group, id, options){
    var dd = new YAHOO.util.DDProxy(id, group);
    dd.setXConstraint(0,0);
    Solstice.YahooUI._addSortItem(dd, group, id, options);
}

Solstice.YahooUI.addSortItem = function (group, id, options) {
    var dd = new YAHOO.util.DDProxy(id, group);
    Solstice.YahooUI._addSortItem(dd, group, id, options);
}

Solstice.YahooUI._addSortItem = function (dd, group, id, options) {
    dd.scroll = false;
    dd.group = group;
    if(options){
        if(options.handle) { 
            dd.setHandleElId(options.handle);
        }
        if(options.callback){
            dd.callback = options.callback;
        }
        if(options.dragElId){
            dd.dragElId = options.dragElId;
        }
    }
    YAHOO.util.DDM.clickPixelThresh = 10;
    YAHOO.util.DDM.clickTimeThresh = 150;
    
    if(options && options.startDrag){
        dd.startDrag = options.startDrag;
    }else {
        dd.startDrag = function() {
            document.getElementById(this.id).style.opacity = 0.5;
            document.getElementById(id).style.filter = "alpha(opacity = 50)";
            Solstice.YahooUI.inBottomScrollArea = false;
            Solstice.YahooUI.inTopScrollArea = false;

            // Add an event to handle out-of-bounds drops
            Solstice.Event.add(document, 'mouseup', Solstice.YahooUI.hideDropIndicator);
        };
    }
    
    if(options && options.endDrag){
        dd.endDrag = options.endDrag;
    }else{
        dd.endDrag = function(ev) {
            Solstice.YahooUI.fadeIn(this.id, 0.5, 1);
            Solstice.YahooUI.inBottomScrollArea = false;
            Solstice.YahooUI.inTopScrollArea = false;

            var target = document.getElementById(this.id);
            var parent = target.parentNode;

            if (Solstice.YahooUI.dropIndicator == null) {
                return;
            }
            var drop_parent = Solstice.YahooUI.dropIndicator.parentNode;
            if (drop_parent == null) {
                return;
            }
            while (drop_parent != parent && drop_parent.nodeName.toLowerCase() != 'body') {
                drop_parent = drop_parent.parentNode;
                if (drop_parent == null) {
                    return;
                }
            }

            if (drop_parent.nodeName.toLowerCase() != 'body') {
                if (drop_parent == parent) {
                    target.parentNode.insertBefore(target, Solstice.YahooUI.dropIndicator);
                }

                Solstice.YahooUI.hideDropIndicator();
                YAHOO.util.DDM.refreshCache(this.groups);
            }

            if(this.callback){
                this.callback(ev);
            }
        }
    }

    if(options && options.onDrag){
        dd.onDrag = options.onDrag;
    }else {
        dd.onDrag = function (e){
            height = Solstice.Geometry.getBrowserHeight();
            scroll_top = Solstice.Geometry.getScrollYOffset();
            event_top = Solstice.Geometry.getEventY(e);

            if(((scroll_top + height) - event_top) < 50 ){
                if(!Solstice.YahooUI.inBottomScrollArea){
                    Solstice.YahooUI.inBottomScrollArea = true;
                    Solstice.YahooUI.scrollDown();
                }
            }else{
                Solstice.YahooUI.inBottomScrollArea = false;
            }

            if((event_top - scroll_top) < 50 ){
                if(!Solstice.YahooUI.inTopScrollArea){
                    Solstice.YahooUI.inTopScrollArea = true;
                    Solstice.YahooUI.scrollUp();
                }
            }else{
                Solstice.YahooUI.inTopScrollArea = false;
            }


        };
    }

    if(options && options.onDragOver){
        dd.onDragOver = options.onDragOver;
    }else {
        dd.onDragOver = function(e, id){

            target = document.getElementById(id);
            if (!Solstice.YahooUI.dropIndicator) {
                Solstice.YahooUI.createDropIndicator();
            }

            // Be sure to define this css class in your stylesheet!
            Solstice.YahooUI.dropIndicator.className = 'solstice_yahooui_drop_indicator_' + this.group;
            Solstice.YahooUI.dropIndicator.style.display = 'block';

            if(target.top){
                target.parentNode.insertBefore(Solstice.YahooUI.dropIndicator, target.nextSibling);
            }else{
                target.parentNode.insertBefore(Solstice.YahooUI.dropIndicator, target);
            }
        };
    }

    if(options && options.onDragOut){
        dd.onDragOut = options.onDragOut;
    }else {
        dd.onDragOut = function(e, id) {
            Solstice.YahooUI.hideDropIndicator();
        };
    }

    if(options && options.onDragDrop){
        dd.onDragDrop = options.onDragDrop;
    }else {
        dd.onDragDrop = function(e, id) {
            target = document.getElementById(id);
            dragging = document.getElementById(this.id);

            Solstice.YahooUI.hideDropIndicator();

            if(target.top){
                dragging.parentNode.removeChild(dragging);
                target.parentNode.replaceChild(dragging, target);
                dragging.parentNode.insertBefore(target, dragging);
            }else{
                dragging.parentNode.removeChild(dragging);
                target.parentNode.insertBefore(dragging, target);
            }
            YAHOO.util.DDM.refreshCache(this.groups);
        };
    }
}

Solstice.YahooUI.addSortTarget = function(group, id){
    var dd = new YAHOO.util.DDTarget(id, group);
}

Solstice.YahooUI.addVerticalSortTopTarget = function(group, id){
    var dd = new YAHOO.util.DDTarget(id, group);
    document.getElementById(id).top = true;
}

Solstice.YahooUI.addVerticalSortBottomTarget = function(group, id){
    var dd = new YAHOO.util.DDTarget(id, group);
    document.getElementById(id).bottom = true;
}

Solstice.YahooUI.removeSortTarget = function(id){
    if (dd = YAHOO.util.DDM.getDDById(id)) {
        dd.unreg();
    }
}

Solstice.YahooUI.hideDropIndicator = function() {
    if (!Solstice.YahooUI.dropIndicator) {
        Solstice.YahooUI.createDropIndicator();
    }
    Solstice.YahooUI.dropIndicator.style.display = 'none';
    Solstice.Event.remove(document, 'mouseup', Solstice.YahooUI.hideDropIndicator);
}

Solstice.YahooUI.createDropIndicator = function() {
    if (!Solstice.YahooUI.dropIndicator) {
        Solstice.YahooUI.dropIndicator = document.createElement('div');
        Solstice.YahooUI.dropIndicator.id = 'solstice_yahooui_drop_indicator';
    }
    return true;
}

/** Fades **/

/**
 * Applies a fade-in effect to the passed element 
 * @param {string|object} ID of the element, or the element reference
 * @param {float} duration of effect
 * @param {integer} target opacity
 * @type void
 */
Solstice.YahooUI.fadeIn = function (id, duration, to) {
    if(!to){
        to = 1;
    }
    //stupid hack - safari sometimes lets faded content disappear
    if(to == 1){
        to = 0.9999;
    }
    if(!duration){
        duration = 2;
    }
    var anim = new YAHOO.util.Anim(id, { opacity: { to: to } }, duration, YAHOO.util.Easing.easeBoth);
    anim.onComplete.subscribe(function(anim_status, data, input) {
                var element;
                if (typeof input == "string") {
                    element = document.getElementById(input);
                }
                else {
                    element = input;
                }
                element.style.opacity = '';
                element.style['-moz-opacity'] = '';
                element.style['-khtml-opacity'] = '';
                element.style.filter = '';
            }, id);
    anim.animate();
}

/**
 * Applies a fade-out effect to the passed element 
 * @param {string|object} ID of the element, or the element reference
 * @param {float} duration of effect
 * @param {integer} target opacity
 * @type void
 */
Solstice.YahooUI.fadeOut = function (id, duration, to) {
    if(!to){
        to = 0;
    }
    if(!duration){
        duration = 2;
    }
    var anim = new YAHOO.util.Anim(id, { opacity: { to: to} }, duration, YAHOO.util.Easing.easeBoth);
    anim.animate();
}

/** PopIns, aka Panels and Dialogs **/

Solstice.YahooUI.PopIn = function(){};
Solstice.YahooUI.PopIn.initialized = false;
Solstice.YahooUI.PopIn.registry = {};
Solstice.YahooUI.PopIn.manager = new YAHOO.widget.OverlayManager();

Solstice.YahooUI.PopIn.init = function(name, is_modal) {
    if (!Solstice.YahooUI.PopIn.initialized) {
        Solstice.YahooUI.PopIn.initialized = true;
    }

    // Create a new popin only if this name hasn't been registered.
    // IE seems to prefer that the modal config attribute be set in
    // the constructor, so we need to explicitly reset it for existing
    // popins.
    var popin = Solstice.YahooUI.PopIn.get(name);
    if (popin) {
        popin.cfg.setProperty('modal', (is_modal) ? true : false);
        popin.cfg.setProperty('fixedcenter', (is_modal) ? true : false);
        popin.cfg.setProperty('draggable', (is_modal) ? false : true);
    } else {
        popin = new YAHOO.widget.Panel(name, {
            modal               : (is_modal) ? true : false,
            fixedcenter         : (is_modal) ? true : false,
            draggable           : (is_modal) ? false : true,
            visible             : false,
            close               : true,
            icon                : YAHOO.widget.SimpleDialog.ICON_HELP,
            constraintoviewport : true,
            iframe              : true,
            width               : '300',
            underlay            : 'shadow'
        });
        Solstice.YahooUI.PopIn.registry[name] = popin;
        Solstice.YahooUI.PopIn.manager.register(popin);
        // Clear error messages automatically on hide
        popin.hideEvent.subscribe(Solstice.YahooUI.Message.clearError);

        // ESC key listener for hiding popins
        var esc = new YAHOO.util.KeyListener(document, { keys:27 }, {
            fn   : popin.hide,
            scope: popin,
            correctScope: true
        } );
        popin.cfg.queueProperty('keylisteners', esc);
    }

    // Add temporary content and render
    popin.setHeader('&nbsp;');
    popin.setBody('Loading... <img src="images/processing.gif" alt="" style="vertical-align: middle;">');
    popin.render('solstice_app_form');

    return popin;
}

Solstice.YahooUI.PopIn.get = function(name) {
    if (!name) name = Solstice.YahooUI.getDefaultName(); 
    return Solstice.YahooUI.PopIn.registry[name];
}
    
Solstice.YahooUI.PopIn.getConfig = function(name) {
    if (popin = Solstice.YahooUI.PopIn.get(name)) {
        return popin.cfg;
    }
}

Solstice.YahooUI.PopIn.setTitle = function(name, content) {
    //if we only have 1 argument, assume it is the content
    if(arguments.length == 1){
        content = name;
        name = Solstice.YahooUI.getDefaultName();
    }

    if (popin = Solstice.YahooUI.PopIn.get(name)) {
        popin.setHeader(content);
    }
}

Solstice.YahooUI.PopIn.setContent = function(name, content) {
    //if we only have 1 argument, assume it is the content
    if(arguments.length == 1){
        content = name;
        name = Solstice.YahooUI.getDefaultName();
    }

    if (popin = Solstice.YahooUI.PopIn.get(name)) {
        popin.setBody(content);
        // Run any inline javascript (ie register client actions, etc)
        var regEx = /<script type="text\/javascript">(.+?)<\/script>/g;
        content = content.replace(/[\r\n]/g, '');
        var result;
        while((result = regEx.exec(content)) != null){
            try {
                eval(result[1]);
            }catch(exception){}
        }

        popin.render();
        if (popin.cfg.getProperty('fixedcenter')) {
            popin.center();
        }
        if(popin.cfg.getProperty('constraintoviewport')){
            popin.align();
        }
    }
}

Solstice.YahooUI.PopIn.raise = function(name, context, is_modal, is_draggable, width, hide_close) {
    if (!name) name = Solstice.YahooUI.getDefaultName();

    // Ensure that a popin with this name is not currently raised
    Solstice.YahooUI.PopIn.lower(name);

    var popin = Solstice.YahooUI.PopIn.get(name);

    //make sure we have a popin (unnamed popins always get reinitialized)
    if(!popin || name == Solstice.YahooUI.getDefaultName()){
        popin = Solstice.YahooUI.PopIn.create(name, context, is_modal, is_draggable, width, hide_close);
    }else if(context) { // It might be a button name(this mirrors how create already does things)
        Solstice.Button.set(context);
        Solstice.Button.performClientAction();
    }

    popin.show();
    Solstice.YahooUI.PopIn.manager.focus(popin);

    return false;
}

Solstice.YahooUI.PopIn.create = function(name, context, is_modal, is_draggable, width, hide_close) {
    var popin = Solstice.YahooUI.PopIn.init(name, is_modal);
    if(hide_close){
        popin.cfg.setProperty('close', false);
    }

    // Width needs to be set before other properties below
    if (width) popin.cfg.setProperty('width', width);
    popin.cfg.setProperty('draggable', (is_draggable) ? true : false);

    if (context && !is_modal) {
        if (target = document.getElementsByName(context)[0]) {
            popin.cfg.setProperty('context', [target, 'tl', 'tl']);
        }
    }

    if (context) { // It might be a button name
        Solstice.Button.set(context);
        Solstice.Button.performClientAction();
    }
    popin.cfg.setProperty('zindex', Solstice.YahooUI.popin_zindex);

    return popin;
}

Solstice.YahooUI.PopIn.lower = function(name) {
    if (!name) name = Solstice.YahooUI.getDefaultName();
    if (popin = Solstice.YahooUI.PopIn.get(name)) {
        popin.hide();
    }
    return false;
}

Solstice.YahooUI.getDefaultName = function() {
    return 'solstice_default_popin';
}

// BEGIN: Deprecated functions; these support single 'no-name' popins
Solstice.YahooUI.raisePopIn = function(button_name, is_modal, is_draggable, width) {
    return Solstice.YahooUI.PopIn.raise(null, button_name, is_modal, is_draggable, width);    
}
Solstice.YahooUI.lowerPopIn = function() {
    return Solstice.YahooUI.PopIn.lower();
}
Solstice.YahooUI.setPopInContent = function(content) {
    return Solstice.YahooUI.PopIn.setContent(null, content);
}
Solstice.YahooUI.setPopInTitle = function(title) {
    return Solstice.YahooUI.PopIn.setTitle(null, title);
}
// END: Deprecated functions

Solstice.YahooUI.Calendar = [];
Solstice.YahooUI.Calendar.init = function(name, button_id, format, mindate, maxdate, on_select_handler) {
    var element = document.getElementById(button_id);
    if (!element) {
        return;
    }
    
    var dialog = new YAHOO.widget.Dialog("container_"+name, {
        visible:false,
        context:[button_id, "tl", "bl"],
        constraintoviewport: true,
        draggable:false,
        underlay: 'none',
        close:false
    });
    dialog.setBody('<div id="cal_'+button_id+'"></div>');
    
    // ESC key listener for hiding popins
    var esc = new YAHOO.util.KeyListener(document, { keys:27 }, {
        fn   : dialog.hide,
        scope: dialog,
        correctScope: true
    } );
    dialog.cfg.queueProperty('keylisteners', esc);

    dialog.showEvent.subscribe(function() {if (YAHOO.env.ua.ie){dialog.fireEvent("changeContent");} }); 
    dialog.render('solstice_app_form');

    YAHOO.util.Dom.addClass("container_"+name, 'calendar-container');
    Solstice.YahooUI.PopIn.registry[button_id] = dialog;
    Solstice.YahooUI.Calendar[button_id] = new YAHOO.widget.Calendar(name, 'cal_'+button_id, {close:true,'mindate':mindate,'maxdate':maxdate, iframe:true});
    Solstice.Element.hide('cal_'+button_id);

    
    Solstice.YahooUI.Calendar[button_id].selectEvent.subscribe(Solstice.YahooUI.Calendar.handleSelect, Solstice.YahooUI.Calendar[button_id], true);
    Solstice.YahooUI.Calendar[button_id].renderEvent.subscribe(function() {
        // Tell Dialog it's contents have changed, which allows 
        // container to redraw the underlay (for IE6/Safari2)
        dialog.fireEvent("changeContent");
    });

    Solstice.YahooUI.Calendar.update(name);
  
    // Add the application-level handler AFTER the initial update() above.
    if (on_select_handler) {
        Solstice.YahooUI.Calendar[button_id].selectEvent.subscribe(on_select_handler);
    }
    Solstice.YahooUI.Calendar[button_id].render();
    Solstice.YahooUI.Calendar[button_id].beforeHideEvent.subscribe(function() { dialog.hide(); });
}

Solstice.YahooUI.Calendar.handleSelect = function(type,args,obj) { 
    var dates = args[0];  
    var date = dates[0]; 
    var year = date[0], month = date[1], day = date[2]; 
    
    if(year && month && day){
        var txtDate1 = document.getElementById(this.id+"_date"); 
        txtDate1.value = month + "/" + day + "/" + year;
    }
   
    Solstice.YahooUI.PopIn.registry[this.id+"_date_chooser"].hide();
}

Solstice.YahooUI.Calendar.show = function(id) {
    if (Solstice.YahooUI.OPEN_CALENDAR && Solstice.YahooUI.OPEN_CALENDAR != id) {
        Solstice.YahooUI.OPEN_CALENDAR.hide();
    }
    Solstice.YahooUI.Calendar[id].show();
    Solstice.YahooUI.PopIn.registry[id].show();
    Solstice.YahooUI.PopIn.registry[id].align();

    Solstice.YahooUI.OPEN_CALENDAR = Solstice.YahooUI.Calendar[id];
    YAHOO.util.Dom.addClass("container_"+name, 'calendar-container');
    return false;
}

Solstice.YahooUI.Calendar.update = function(id) {
    var txtDate = document.getElementById(id+"_date");
    if(txtDate && txtDate.value){
        Solstice.YahooUI.Calendar[id+"_date_chooser"].select(txtDate.value);
        var firstDate = Solstice.YahooUI.Calendar[id+"_date_chooser"].getSelectedDates()[0];
        if(firstDate && firstDate != "Invalid Date" && firstDate != "NaN"){
            Solstice.YahooUI.Calendar[id+"_date_chooser"].cfg.setProperty('pagedate', (firstDate.getMonth()+1)+ "/" + firstDate.getFullYear());
        }
    }
    //render has to be called in update (if the users changes the text input the calendar needs to be redrawn)
    Solstice.YahooUI.Calendar[id+"_date_chooser"].render();
}

/** Rich Text Editor **/
/** Most of the actual editor code is located in javascript/editor.js **/

Solstice.YahooUI.Editor = function(){};
Solstice.YahooUI.Editor.registry = new Object();

/**
 * @function Solstice.YahooUI.Editor.init
 * @description Init and register a RichTextEditor 
 * @param {String} Editor name
 * @param {Object} Config object
 * @returns {Object} YAHOO.widget.SolsticeEditor 
 */
Solstice.YahooUI.Editor.init = function(name, config) {
    var editor = Solstice.YahooUI.Editor.registry[name];
    if (!editor) {
        editor = new YAHOO.widget.SolsticeEditor(name, config);

        // Register the editor so that it can be accessed by name
        Solstice.YahooUI.Editor.registry[name] = editor;
    }
    return editor;
}

/**
 * @function Solstice.YahooUI.Editor.get
 * @description Gets a RichTextEditor by name
 * @param {String} Editor name
 * @returns {Object} YAHOO.widget.SolsticeEditor 
 */
Solstice.YahooUI.Editor.get = function(name) {
    return Solstice.YahooUI.Editor.registry[name];
}

/**
 * @function Solstice.YahooUI.Editor.saveAll
 * @description Handles saving editor content to original textarea 
 */
Solstice.YahooUI.Editor.saveAll = function() {
    for (var name in Solstice.YahooUI.Editor.registry) {
        Solstice.YahooUI.Editor.registry[name].saveHTML();
    }
}

/**
 * @function Solstice.YahooUI.Editor.initCatchUnsaved
 * @description Initializes the onbeforeunload catcher
 */
Solstice.YahooUI.Editor.initCatchUnsaved = function(){
    if (!Solstice.Event.exists(window, 'beforeunload', Solstice.YahooUI.Editor.catchUnsaved)) {
        Solstice.Event.add(window, 'beforeunload', Solstice.YahooUI.Editor.catchUnsaved);
    }
}

/**
 * @function Solstice.YahooUI.Editor.catchUnsaved
 * @description Checks editors for dirty content, called by window.onbeforeunload
 * @returns {String} Unsaved content warning
 */
Solstice.YahooUI.Editor.onBeforeUnloadFired = false;
Solstice.YahooUI.Editor.catchUnsaved = function(ev){
    // This temporary code is necessitated by IE, remove the
    // Solstice.YahooUI.Editor.onBeforeUnloadFired global and
    // this check when solstice buttons no longer use href="javascript:..."
    if (Solstice.YahooUI.Editor.onBeforeUnloadFired) {
        return;
    }
    Solstice.YahooUI.Editor.onBeforeUnloadFired = true;
    window.setTimeout(function(){Solstice.YahooUI.Editor.onBeforeUnloadFired = false;}, 1000);
    // End temporary code

    for( var name in Solstice.YahooUI.Editor.registry){
        var editor = Solstice.YahooUI.Editor.registry[name];
        if (editor && editor.unsavedContentMessage && editor.contentModified()) {
            ev.returnValue = editor.unsavedContentMessage; 
            return editor.unsavedContentMessage;
        }
    }
}

/**
 * @function Solstice.YahooUI.Editor.ignoreUnsaved
 * @description Client action for suppressing unsaved content warning
 * @returns {Boolean} true
 */
Solstice.YahooUI.Editor.ignoreUnsaved = function() {
    Solstice.Event.remove(window, 'beforeunload', Solstice.YahooUI.Editor.catchUnsaved);
    return true;
}

/** Textarea resizing **/

Solstice.YahooUI.Resize = function(){};
Solstice.YahooUI.Resize.initialize = function(id) {
    if (!document.getElementById(id)) return;
    var resize = new YAHOO.util.Resize(id, {
        proxy     : true,
        handles   : ['br']
    });
    return resize; 
}

/** Browser History **/

Solstice.YahooUI.History = function(){};

Solstice.YahooUI.History.register= function(name, state, stateChangeHandler) {
       
    var bookmarked_state = YAHOO.util.History.getBookmarkedState(name);

    // If there is no bookmarked state, assign a default state:
    var initial_state = bookmarked_state || state;
    
    YAHOO.util.History.register(name, initial_state, stateChangeHandler);

    return true;
}

Solstice.YahooUI.History.initialize = function (onReadyHandler) {
 
    // Create the hidden markup, if needed
    if (document.getElementById('solstice_history_field')) {
        alert('Solstice History initialized twice! Make certain you register all your modules before calling initialize just once');
        return;
    }

    var form = document.getElementById(Solstice.getAppFormID());

    var input = document.createElement('input');
    input.setAttribute('id', 'solstice_history_field');
    input.setAttribute('type', 'hidden');
    form.appendChild(input);

    var iframe;
    try {
        iframe = document.createElement('<iframe name="solstice_history_iframe">');
    } catch (e) {
        iframe = document.createElement('iframe');
        iframe.setAttribute('name', 'solstice_history_iframe');
    }
    iframe.setAttribute('id', 'solstice_history_iframe');
    iframe.setAttribute('src', 'content/blank.html');
    form.appendChild(iframe);


    if(onReadyHandler){
        YAHOO.util.History.onReady(onReadyHandler);
    }

    try {
        YAHOO.util.History.initialize('solstice_history_field', 'solstice_history_iframe');
    } catch (e) { }

    return true;
}

Solstice.YahooUI.History.navigate = function(name, state, title) {
    YAHOO.util.History.navigate(name, state);

    if (title != null) {
        // Update the title for the main window and the history iframe
        document.title = title;
        Solstice.getWindow('solstice_history_iframe').document.title = title;
    }
}

Solstice.YahooUI.History.getCurrentState = function(name) {
    return YAHOO.util.History.getCurrentState(name);
}

Solstice.YahooUI.History.multiNavigate = function(states){
    return YAHOO.util.History.multiNavigate(states);
}

/*
 * Copyright 1998-2008 Learning & Scholarly Technologies, University of Washington
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */


