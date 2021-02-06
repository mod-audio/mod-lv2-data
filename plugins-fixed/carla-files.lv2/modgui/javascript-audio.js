function (event, funcs)
{
    /* constants */
    var svg_width = 300;
    var svg_height = 150;
    var svg_half_height = svg_height / 2;

    function draw_audio(svg, values) {
        svg.clear();

        var svgdata = [[0,svg_half_height]]
        for (var x = 0; x < values.length; ++x) {
            svgdata.push([x, (values[x] * svg_half_height) + svg_half_height]);
        }
        svgdata.push([svg_width,svg_half_height]);

        var defs = svg.defs();
        svg.linearGradient(defs, 'fadeBg', [[0, '#2e5033'], [1, '#1a2d1d']]);

        var g = svg.group({stroke: '#009515', strokeWidth: 1.0, fill: 'url(#fadeBg)'});
        svg.polyline(g, svgdata);
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
        var svg = event.icon.find('.file-info-svg').svg().svg('get');
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
            if (event.data.lastPosition != event.value) {
                var diff, cursor = event.icon.find('.file-info-cursor');
                if (event.data.lastPosition === null) {
                    event.data.lastPosition = event.value;
                    cursor.css({ left: Math.round(event.value / 100 * svg_width) });
                    return;
                }
                // simulate playback
                if (event.value > event.data.lastPosition) {
                    diff = event.value - event.data.lastPosition;
                } else {
                    diff = 100 - (event.data.lastPosition - event.value);
                }
                if (event.value + diff > 100) {
                    if (event.data.values['loop_mode']) {
                        // animate until end and go roll back again
                        cursor.animate({
                            left: svg_width
                        }, {
                            duration: 25,
                            complete: function() {
                                cursor.animate({
                                    left: 0
                                },{
                                    duration: 0,
                                    complete: function() {
                                        cursor.animate({
                                            left: Math.round((event.value + diff - 100) / 100 * svg_width)
                                        },{
                                            duration: 25
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        // animate until end and stop
                        var anim = cursor.animate({
                            left: svg_width
                        }, {
                            duration: 25
                        });
                    }
                } else {
                    cursor.animate({
                        left: Math.round((event.value + diff) / 100 * svg_width)
                    }, {
                        duration: 50
                    });
                }
                event.data.lastPosition = event.value;
            }
            return;
        }
        if (event.uri) {
            event.data.lastPosition = null;
        }
        if (event.uri === "http://kxstudio.sf.net/carla/preview") {
            event.data.hasPreview = true;
            draw_audio(event.icon.find('.file-info-svg').svg('get'), event.value);
            return;
        }
    }
}
