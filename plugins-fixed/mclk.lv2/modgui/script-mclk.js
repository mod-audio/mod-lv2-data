function (event) {

	function format_bbt (v, pad) {
		var s = "0000" + v;
		return s.substr (s.length - pad);
	}

	function format_bpm (value) {
		return value.toFixed (2);
	}

	function set_hostbpm (hostbpm) {
		if (isNaN (hostbpm)) { return; }
		if (hostbpm <= 0) {
			event.icon.find("[mod-role=bpm-display]").each(function () { $(this).addClass("insensitive"); });
			event.icon.find("[mod-role=bpm-control]").each(function () { $(this).removeClass("insensitive"); });
		} else {
			event.icon.find("[mod-role=bpm-control]").each(function () { $(this).addClass("insensitive"); });
			event.icon.find("[mod-role=bpm-display]").each(function () { $(this).removeClass("insensitive"); });
			event.icon.find("[mod-role=bpm-value]").text (format_bpm (hostbpm) + " BPM");
		}
	}

	function handle_event (symbol, value) {
		switch (symbol) {
			case 'bbt_bar':
				event.icon.find ('[mod-role=bbt_bar]').text (value);
				break;
			case 'bbt_beat':
				event.icon.find ('[mod-role=bbt_beat]').text (format_bbt (value, 2));
				break;
			case 'bbt_tick':
				event.icon.find ('[mod-role=bbt_tick]').text (format_bbt (value, 3));
				break;
			case 'hostbpm':
				set_hostbpm (parseFloat(value));
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
