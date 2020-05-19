function (event, icon) {
  var preDelay = event.icon.find('.tal-reverb-2-pre_delay .mod-knob-value');
  var highShelfFrequency = event.icon.find('.tal-reverb-2-high_shelf_frequency .mod-knob-value');
  var highShelfGain = event.icon.find('.tal-reverb-2-high_shelf_gain .mod-knob-value');
  var lowShelfFrequency = event.icon.find('.tal-reverb-2-low_shelf_frequency .mod-knob-value');
  var lowShelfGain = event.icon.find('.tal-reverb-2-low_shelf_gain .mod-knob-value');
  var peakFrequency = event.icon.find('.tal-reverb-2-peak_frequency .mod-knob-value');
  var peakGain = event.icon.find('.tal-reverb-2-peak_gain .mod-knob-value');
  var dry = event.icon.find('.tal-reverb-2-dry .mod-knob-value');
  var wet = event.icon.find('.tal-reverb-2-wet .mod-knob-value');

  if (event.type === 'start') {
    preDelay.append('<span>ms</span>');
    highShelfFrequency.append('<span>Hz</span>');
    lowShelfFrequency.append('<span>Hz</span>');
    peakFrequency.append('<span>Hz</span>');
    highShelfGain.append('<span>dB</span>');
    lowShelfGain.append('<span>dB</span>');
    peakGain.append('<span>dB</span>');
    dry.append('<span>dB</span>');
    wet.append('<span>dB</span>');
  }

  if (event.type === 'change') {
    switch (event.symbol) {
      case 'pre_delay':
        preDelay.append('<span>ms</span>');
        break;
      case 'high_shelf_frequency':
        highShelfFrequency.append('<span>Hz</span>');
        break;
      case 'low_shelf_frequency':
        lowShelfFrequency.append('<span>Hz</span>');
        break;
      case 'peak_frequency':
        peakFrequency.append('<span>Hz</span>');
        break;
      case 'high_shelf_gain':
        highShelfGain.append('<span>dB</span>');
        break;
      case 'low_shelf_gain':
        lowShelfGain.append('<span>dB</span>');
        break;
      case 'peak_gain':
        peakGain.append('<span>dB</span>');
        break;
      case 'wet':
        wet.append('<span>dB</span>');
        break;
      case 'dry':
        dry.append('<span>dB</span>');
        break;
      default:
        break;
    }
  }
}
