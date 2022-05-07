function (event, funcs)
{
    function update_filename(icon, filename)
    {
        icon.find('.file-info-details').text(filename.slice(filename.indexOf("/Reverb IRs/")+12));
    }

    if (event.type == 'start')
    {
        for (var i in event.parameters)
        {
            if (event.parameters[i].uri === 'http://gareus.org/oss/lv2/zeroconvolv#ir')
            {
                update_filename(event.icon, event.parameters[i].value);
                break;
            }
        }
    }
    else if (event.type == 'change')
    {
        if (event.uri === 'http://gareus.org/oss/lv2/zeroconvolv#ir')
            update_filename(event.icon, event.value);
    }
}
