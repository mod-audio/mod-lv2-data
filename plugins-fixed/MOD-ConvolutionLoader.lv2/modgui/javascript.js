function (event, funcs)
{
    function update_filename(icon, filename)
    {
        var index = filename.lastIndexOf("/");
        if (index !== -1)
            filename = filename.slice(index+1);

        icon.find('.file-info-details').html(filename || '&nbsp;');
    }

    if (event.type == 'start')
    {
        for (var i in event.parameters)
        {
            if (event.parameters[i].uri === 'https://mod.audio/plugins/ConvolutionLoader#irfile')
            {
                update_filename(event.icon, event.parameters[i].value);
                break;
            }
        }
    }
    else if (event.type == 'change')
    {
        if (event.uri === 'https://mod.audio/plugins/ConvolutionLoader#irfile')
            update_filename(event.icon, event.value);
    }
}
