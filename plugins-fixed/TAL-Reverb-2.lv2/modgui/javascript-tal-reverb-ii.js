function(event) {

	function handle_event (symbol, value) {
		switch (symbol) {
			case 'pre_delay':
				var preDelay = value;
				preDelay = preDelay.toFixed(0);
				preDelay = preDelay.toString();
				preDelay += ' ms';
				event.icon.find('[mod-role=input-control-value][mod-port-symbol=pre_delay]').text(preDelay);
				break;
			case 'low_shelf_frequency':
				var lowShelfFreq = value;
				lowShelfFreq = lowShelfFreq.toFixed(0);
				lowShelfFreq = lowShelfFreq.toString();
				lowShelfFreq += ' Hz';
				event.icon.find('[mod-role=input-control-value][mod-port-symbol=low_shelf_frequency]').text(lowShelfFreq);
				break;
			case 'high_shelf_frequency':
				var highShelfFreq = value;
				highShelfFreq = highShelfFreq.toFixed(0);
				highShelfFreq = highShelfFreq.toString();
				highShelfFreq += ' Hz';
				event.icon.find('[mod-role=input-control-value][mod-port-symbol=high_shelf_frequency]').text(highShelfFreq);
				break;
			case 'peak_frequency':
				var peakFreq = value;
				peakFreq = peakFreq.toFixed(0);
				peakFreq = peakFreq.toString();
				peakFreq += ' Hz';
				event.icon.find('[mod-role=input-control-value][mod-port-symbol=peak_frequency]').text(peakFreq);
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
