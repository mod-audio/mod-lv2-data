function (event) {
    /* constants */
    var kFontHeightURI = "http://open-music-kontrollers.ch/lv2/notes#fontHeight";

    function set_font_height(value) {
        event.icon.find('.omk-notes').css({
            'font-size': value
        });
    }

    switch (event.type)
    {
    case 'start':
        for (var p in event.parameters) {
            if (event.parameters[p].uri === kFontHeightURI) {
                set_font_height(event.parameters[p].value);
            }
        }
        break;
    case 'change':
        if (event.uri === kFontHeightURI) {
            set_font_height(event.value);
        }
        break;
    }
}
