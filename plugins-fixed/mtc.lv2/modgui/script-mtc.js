function (event) {

    function format_tc (v) {
			var s = "0" + v;
			return s.substr (s.length - 2);
		}

    function handle_event (symbol, value) {
        switch (symbol) {
            case 'tc_hour':
                event.icon.find ('[mod-role=tc_hour]').text (format_tc (value));
                break;
            case 'tc_minute':
                event.icon.find ('[mod-role=tc_minute]').text (format_tc (value));
                break;
            case 'tc_second':
                event.icon.find ('[mod-role=tc_second]').text (format_tc (value));
                break;
            case 'tc_frame':
                event.icon.find ('[mod-role=tc_frame]').text (format_tc (value));
                break;
            default:
                break;
        }
    }

    if (event.type == 'start') {
        var ports = event.ports;
        for (var p in ports) {
            handle_event (ports[p].symbol, ports[p].value);
        }
    }
    else if (event.type == 'change') {
        handle_event (event.symbol, event.value);
    }
}
