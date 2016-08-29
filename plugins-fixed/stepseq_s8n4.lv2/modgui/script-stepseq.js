function (event, funcs) {

	function update_note_display (nd) {
		switch (nd) {
			case 'drum':
				event.icon.find ("[x42-role=seq-note]").removeClass ("note");
				event.icon.find ("[x42-role=seq-note]").removeClass ("nums");
				event.icon.find ("[x42-role=seq-note]").addClass ("drum");
				break;
			case 'note':
				event.icon.find ("[x42-role=seq-note]").removeClass ("drum");
				event.icon.find ("[x42-role=seq-note]").removeClass ("nums");
				event.icon.find ("[x42-role=seq-note]").addClass ("note");
				break;
			case 'nums':
				event.icon.find ("[x42-role=seq-note]").removeClass ("drum");
				event.icon.find ("[x42-role=seq-note]").removeClass ("note");
				event.icon.find ("[x42-role=seq-note]").addClass ("nums");
				break;
		}
	}

	function update_drummode_display (dm, force) {
		var dmw = event.icon.find("[x42-role=seq-radio-drum]");
		if (!(dm || dmw.hasClass("selected")) || (dm && dmw.hasClass("selected"))) {
			if (!force) {
				return;
			}
		}
		event.icon.find ("div.displayradio").removeClass ("selected");
		if (dm) {
			event.icon.find("[x42-role=seq-radio-drum]").addClass ("selected");
			update_note_display ('drum');
		} else {
			event.icon.find("[x42-role=seq-radio-note]").addClass ("selected");
			update_note_display ('note');
		}
	}

	function set_current_step (step) {
		/* TODO: incremental, keep track of highlighted column */
		event.icon.find("[mod-role=input-control-port][grid-row]").each(function () { $(this).removeClass("highlight"); });
		event.icon.find("[mod-role=input-control-port][grid-col="+step+"]").each(function () { $(this).addClass("highlight"); });
	}

	if (event.type == 'change') {
		if (event.symbol == "drummode") {
			update_drummode_display (event.value, false);
		}
		else if (event.symbol == "pos") {
			set_current_step (Math.round (event.value));
		}
	}

	if (event.type != "start") {
		return;
	}

	function set_ctrl (ctrl, value) {
		if (event.api_version >= 1) {
			funcs.set_port_value($(ctrl).attr('mod-port-symbol'), value);
		} else {
			/* this is for MOD v1.0 backwards compatibility and prototyping.
			 * DO NOT USE THIS APPROACH IN NEW CODE. It bypasses
			 * checks for bound controls among other things. */
			$(ctrl).controlWidget('setValue', value);
		}
	}

	function set_drummode (dm) {
		var ctrl = event.icon.find ("[mod-port-symbol=drummode]");
		set_ctrl (ctrl, dm);
	}

	function resetGridValue() {
		set_ctrl (this, 0);
	}

	/* initial setup */
	event.icon.find("[x42-role=seq-radio-nums]").click(function(){
		event.icon.find ("div.displayradio").removeClass ("selected");
		$(this).addClass ("selected");
		update_note_display ('nums');
		set_drummode (0);
	});

	event.icon.find("[x42-role=seq-radio-note]").click(function(){
		event.icon.find ("div.displayradio").removeClass ("selected");
		$(this).addClass ("selected");
		update_note_display ('note');
		set_drummode (0);
	});

	event.icon.find("[x42-role=seq-radio-drum]").click(function(){
		event.icon.find ("div.displayradio").removeClass ("selected");
		$(this).addClass ("selected");
		update_note_display ('drum');
		set_drummode (1);
	});

	event.icon.find("div.resetbutton.col").click(function(){
		var c = $(this).attr('grid-col');
		event.icon.find("[mod-role=input-control-port][grid-col="+c+"]").each(resetGridValue);
	});

	event.icon.find("div.resetbutton.row").click(function(){
		var r = $(this).attr('grid-row');
		event.icon.find("[mod-role=input-control-port][grid-row="+r+"]").each(resetGridValue);
	});

	event.icon.find("div.resetbutton.all").click(function(){
		event.icon.find("[mod-role=input-control-port][grid-row]").each(resetGridValue);
	});

	var ports = event.ports;
	for (var p in ports) {
		switch (ports[p].symbol) {
			case 'drummode':
				update_drummode_display (ports[p].value, true);
				break;
			case 'pos':
				set_current_step (Math.round (event.value));
				break;
			default:
				break;
		}
	}
}
