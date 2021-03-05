function (event, funcs)
{
    /* constants */
    var svg_width = 432;
    var svg_height = 80;

    function draw_audio(svg, values, uniqueId) {
        svg.clear();

        var svgdata = [];
        var val;
        for (var x = 0; x < values.length; ++x) {
            val = (1.0 - values[x]) * svg_height;
            svgdata.push([x*4, svg_height])
            svgdata.push([x*4, val])
            svgdata.push([x*4+3, val])
            svgdata.push([x*4+3, svg_height])
        }

        var defs = svg.defs(uniqueId);
        svg.linearGradient(defs, 'fillBg-'+uniqueId, [
            [0, '#d67516'],
            [0, '#d67516'],
            [0, 'white'],
            [1, 'white']
        ]);

        var g = svg.group({fill: 'url(#fillBg-'+uniqueId+')'});
        svg.polyline(g, svgdata);
    }

    function update_audio_position(svg, position, uniqueId) {
        // this align to a 4px grid
        var offset = Math.round((position*svg_width/100)/4)*4/svg_width;
        $(svg.getElementById(uniqueId)).find('stop:nth-child(2n+1)').attr('offset', offset.toString());
    }

    function prepare_loading_status_change(eventdata, icon, funcs) {
        if (eventdata.loadingTimeoutHandle !== null) {
            clearTimeout(eventdata.loadingTimeoutHandle)
        }
        eventdata.loadingTimeoutHandle = setTimeout(function() {
            var text, values = eventdata.values;
            if (values['num_channels'] == 0) {
                text = "No file loaded";
            } else {
                text = sprintf("%s %d-Bit, %fkHz, %dm%ds",
                               values['num_channels'] == 2 ? "Stereo" : "Mono",
                               values['bit_depth'],
                               values['sample_rate'] / 1000,
                               Math.floor(values['length'] / 60), Math.round(values['length'] % 60));
            }
            icon.find('.file-info-details').text(text)
            // if we reach this point but still do not have preview data, ask for it
            if (! eventdata.hasPreview) {
                eventdata.hasPreview = true;
                funcs.patch_get("http://kxstudio.sf.net/carla/preview")
            }
        }, 50)
    }

    if (event.type == 'start')
    {
        var svgElem = event.icon.find('.file-info-svg');
        var values = event.data.values = {
            'loop_mode': 1,
            'num_channels': 0,
            'bit_rate': 0,
            'bit_depth': 0,
            'sample_rate': 0,
            'length': 0,
        };
        event.data.lastPosition = null;
        event.data.loadingTimeoutHandle = null;
        event.data.uniqueId = svgElem.uniqueId().attr('id');
        event.icon.find('.falktx-audio-file-mode-option').click(function() {
            var self = $(this);
            var filetype = self.attr('filetype');

            event.icon.find('.falktx-audio-file-mode-option').removeClass('selected');
            self.addClass('selected')

            event.icon.find('.mod-enumerated-list').children().each(function(index, elem) {
                var jselem = $(elem);
                if (jselem.attr('mod-filetype') === filetype) {
                    jselem.show()
                } else {
                    jselem.hide()
                }
            })
        });
        setTimeout(function() {
            event.icon.find('.falktx-audio-file-mode-option:first-child').click();
        }, 1);
        // setup svg
        var svg = svgElem.svg().svg('get');
        svg.configure({width: '' + svg_width + 'px'}, false);
        svg.configure({height: '' + svg_height + 'px'}, false);
    }
    else if (event.type == 'change')
    {
        switch (event.symbol)
        {
        case 'loop_mode':
            event.data.values[event.symbol] = event.value;
            event.data.lastPosition = null;
            console.log(event.value);
            return;
        case 'num_channels':
        case 'bit_rate':
        case 'bit_depth':
        case 'sample_rate':
        case 'length':
            event.data.values[event.symbol] = event.value;
            prepare_loading_status_change(event.data, event.icon, funcs);
            return;
        case 'position':
            if (event.data.lastPosition !== event.value) {
                var diff, cursor = event.icon.find('.file-info-cursor');
                    event.data.lastPosition = event.value;
                    update_audio_position(event.icon.find('.file-info-svg').svg('get'),
                                          event.value, event.data.uniqueId);
            }
            return;
        }
        if (event.uri) {
            event.data.lastPosition = null;
        }
        if (event.uri === "http://kxstudio.sf.net/carla/preview") {
            event.data.hasPreview = true;
            draw_audio(event.icon.find('.file-info-svg').svg('get'),
                       event.value, event.data.uniqueId);
            return;
        }
    }
}
