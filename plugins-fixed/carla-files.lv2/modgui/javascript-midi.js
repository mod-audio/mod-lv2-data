function (event)
{
    function update_position(icon, position) {
        var positionstr = position.toString();
        icon.find('.file-info-position').css({
            'background': 'linear-gradient(90deg, #f6a13f 0%, #f6a13f '+positionstr+'%, #fff '+positionstr+'%, #fff 100%)',
        });
    }

    function update_status(icon, values) {
        var text;
        if (values['num_tracks'] == 0 || values['length'] == 0) {
            text = "No file loaded";
        } else {
            text = sprintf("%d Track%s, %dm%ds", 
                           values['num_tracks'], values['num_tracks'] != 1 ? "s" : "",
                           Math.floor(values['length'] / 60), Math.round(values['length'] % 60));
        }
        icon.find('.file-info-details').text(text);
    }

    if (event.type == 'start')
    {
        event.data.lastPosition = null;
        event.data.values = {
            'num_tracks': 0,
            'length': 0,
        };
    }
    else if (event.type == 'change')
    {
        switch (event.symbol)
        {
        case 'repeat_mode':
            event.data.lastPosition = null;
            return;
        case 'num_tracks':
        case 'length':
            event.data.values[event.symbol] = event.value;
            update_status(event.icon, event.data.values);
            return;
        case 'position':
            if (event.data.lastPosition !== event.value) {
                event.data.lastPosition = event.value;
                update_position(event.icon, event.value);
            }
            return;
        }
        if (event.uri) {
            event.data.lastPosition = null;
        }
    }
}
