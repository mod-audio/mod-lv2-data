//used x42-tinygain plugin as reference for LED lights

function (event) {

	function to_db (value) {
		if (value < 0.000001) {
			return "-inf";
		}
		return (20 * Math.log10 (value)).toFixed(1);
	}

	function highlight (c, dpm) {
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

    function set_higlight_value(db, value, dpm) {
        if (db < -18 || value < 0.000001) {
            highlight (0, dpm);
        } else if (db < -3) {
            highlight (1, dpm);
        } else if (db < -1) {
            highlight (2, dpm);
        } else if (db < 0) {
            highlight (3, dpm);
        } else {
            highlight (4, dpm);
        }
    }

	function handle_event (symbol, value) {
		switch (symbol) {
			case 'PostFader1Level':
				var db = to_db(value);
                set_higlight_value(db, value, event.icon.find ('[mod-role=dpm1]'));
				event.icon.find ('[mod-role=level1]').text (db);
				break;
			case 'PostFader2Level':
				var db = to_db(value);
                set_higlight_value(db, value, event.icon.find ('[mod-role=dpm2]'));
				event.icon.find ('[mod-role=level2]').text (db);
				break;
			case 'PostFader3Level':
				var db = to_db(value);
                set_higlight_value(db, value, event.icon.find ('[mod-role=dpm3]'));
				event.icon.find ('[mod-role=level3]').text (db);
				break;
			case 'PostFader4Level':
				var db = to_db(value);
                set_higlight_value(db, value, event.icon.find ('[mod-role=dpm4]'));
				event.icon.find ('[mod-role=level4]').text (db);
				break;
			case 'MasterMonitorLevel':
				var db = to_db(value);
                set_higlight_value(db, value, event.icon.find ('[mod-role=dpm5]'));
				event.icon.find ('[mod-role=masterLevel]').text (db);
				break;
			case 'AltMonitorLevel':
				var db = to_db(value);
                set_higlight_value(db, value, event.icon.find ('[mod-role=dpm6]'));
				event.icon.find ('[mod-role=altLevel]').text (db);
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
