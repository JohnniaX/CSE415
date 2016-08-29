// Override from yahooui.js for bug 10865
Solstice.YahooUI.Message._checkPosition = function(ev) {
    var el = Solstice.YahooUI.PopIn.get('sol_message_container').element;
    if (document.getElementById('timer_container')) {
        if (YAHOO.util.Dom.getDocumentScrollTop() > Solstice.YahooUI.Message.scrollTopLimit - 35) {
            el.style.position = 'fixed';
            el.style.top = '35';
        } else {
            el.style.position = '';
            el.style.top = '';
        }
    }
    else {
        if (YAHOO.util.Dom.getDocumentScrollTop() > Solstice.YahooUI.Message.scrollTopLimit) {
            el.style.position = 'fixed';
            el.style.top = '0';
        } else {
            el.style.position = '';
            el.style.top = '';
        }

    }
};


