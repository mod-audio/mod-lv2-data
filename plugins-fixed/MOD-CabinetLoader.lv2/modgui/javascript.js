function (event, funcs)
{
    function update_filename(icon, filename)
    {
        var index = filename.indexOf("/Speaker Cabinets IRs/");
        if (index !== -1)
            filename = filename.slice(index+22);

        index = filename.indexOf("/MOD-CabinetLoader.lv2/");
        if (index !== -1)
            filename = filename.slice(index+23);

        icon.find('.file-info-details').html(filename || '&nbsp;');
    }

    if (event.type == 'start')
    {
        for (var i in event.parameters)
        {
            if (event.parameters[i].uri === 'https://mod.audio/plugins/CabinetLoader#irfile')
            {
                update_filename(event.icon, event.parameters[i].value);
                break;
            }
        }
    }
    else if (event.type == 'change')
    {
        if (event.uri === 'https://mod.audio/plugins/CabinetLoader#irfile')
            update_filename(event.icon, event.value);
    }
}
