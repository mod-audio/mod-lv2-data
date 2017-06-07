function (event) {

	function to_db (value) {
		if (value < 0.000001) {
			return "-inf";
		}
		return (20 * Math.log10 (value)).toFixed(1);
	}

	function highlight (c) {
		var dpm = event.icon.find ('[mod-role=dpm]');
		var old = dpm.data ('xBgColor');
		if (old == c) {
			return;
		}
		switch (c) {
			case 4:
				dpm.css({backgroundColor: '#ff4400'});
				break;
			case 3:
				dpm.css({backgroundColor: '#dd6622'});
				break;
			case 2:
				dpm.css({backgroundColor: '#ccaa66'});
				break;
			case 1:
				dpm.css({backgroundColor: '#88ff66'});
				break;
			default:
				dpm.css({backgroundColor: '#aacc66'});
				break;
		}
		dpm.data ('xBgColor', c);
	}

	function set_muted (m) {
		if (m <= 0) {
			event.icon.find("[mod-role=muted]").each(function () { $(this).addClass("hidden"); });
			event.icon.find("[mod-role=input-control-value]").each(function () { $(this).removeClass("hidden"); });
		} else {
			event.icon.find("[mod-role=input-control-value]").each(function () { $(this).addClass("hidden"); });
			event.icon.find("[mod-role=muted]").each(function () { $(this).removeClass("hidden"); });
		}
	}

	function handle_event (symbol, value) {
		switch (symbol) {
			case 'level':
				var db = to_db(value);
				event.icon.find ('[mod-role=level]').text (db);
				if (db < -18 || value < 0.000001) {
					highlight (0);
				} else if (db < -3) {
					highlight (1);
				} else if (db < -1) {
					highlight (2);
				} else if (db < 0) {
					highlight (3);
				} else {
					highlight (4);
				}
				break;
			case 'mute':
				set_muted (value);
				break;
			default:
				break;
		}
	}

	if (event.type == 'start') {
		var dpm = event.icon.find ('[mod-role=dpm]');
		dpm.data ('xBgColor', 0);
		var ports = event.ports;
		for (var p in ports) {
			handle_event (ports[p].symbol, ports[p].value);
		}
	}
	else if (event.type == 'change') {
		handle_event (event.symbol, event.value);
	}
}
