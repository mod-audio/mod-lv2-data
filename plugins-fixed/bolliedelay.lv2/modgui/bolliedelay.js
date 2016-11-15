function (event) {

    function handle_event (symbol, value) {
        if (symbol == 'tempo_out') {
            var output = value.toFixed(2) + " BPM";
            event.icon.find ('[mod-port-symbol=tempo_out]').text(output);
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
