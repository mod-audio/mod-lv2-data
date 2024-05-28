function(e,f){
'use strict';
var ps=['lv2_audio_out_1','lv2_audio_out_2','lv2_audio_in_1','lv2_audio_in_2','lv2_events_in','lv2_events_out','dpf_bypass','target','in_gain','phase_l','phase_r','mono','dc_blocker','stereo_correct','gate_bypass','gate_threshold','gate_attack','gate_hold','gate_release','eq_bypass','eq_highpass_freq','eq_tilt_gain','eq_side_gain','eq_side_freq','eq_side_bandwidth','leveler_bypass','leveler_speed','leveler_brake_threshold','leveler_max_plus','leveler_max_minus','kneecomp_bypass','kneecomp_strength','kneecomp_threshold','kneecomp_attack','kneecomp_release','kneecomp_knee','kneecomp_link','kneecomp_fffb','kneecomp_makeup','kneecomp_drywet','mscomp_bypass','mscomp_low_strength','mscomp_low_threshold','mscomp_low_attack','mscomp_low_release','mscomp_low_knee','mscomp_low_link','mscomp_low_crossover','mscomp_high_strength','mscomp_high_threshold','mscomp_high_attack','mscomp_high_release','mscomp_high_knee','mscomp_high_link','mscomp_high_crossover','mscomp_output_gain','limiter_bypass','limiter_strength','limiter_threshold','limiter_attack','limiter_release','limiter_knee','limiter_fffb','limiter_makeup','brickwall_bypass','brickwall_ceiling','brickwall_release','peakmeter_in_l','peakmeter_in_r','lufs_in','leveler_gain','lufs_out','peakmeter_out_l','peakmeter_out_r','gate_meter','leveler_brake','kneecomp_meter_0','kneecomp_meter_1','msredux11','msredux12','msredux21','msredux22','msredux31','msredux32','msredux41','msredux42','msredux51','msredux52','msredux61','msredux62','msredux71','msredux72','msredux81','msredux82','limiter_gain_reduction','brickwall_limit','histogram_buffer_size','histogram_value_in','histogram_value_out',];
var ei=0;

if(e.type==='start'){
e.data.p={p:{},c:{},};

var err=[];
if(typeof(WebAssembly)==='undefined'){err.push('WebAssembly unsupported');}
else{
if(!WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,3,1,0,1,10,14,1,12,0,65,0,65,0,65,0,252,10,0,0,11])))err.push('Bulk Memory Operations unsupported');
if(!WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,2,8,1,1,97,1,98,3,127,1,6,6,1,127,1,65,0,11,7,5,1,1,97,3,1])))err.push('Importable/Exportable mutable globals unsupported');
}
if(err.length!==0){e.icon.find('.canvas_wrapper').html('<h2>'+err.join('<br>')+'</h2>');return;}

var s=document.createElement('script');
s.setAttribute('async',true);
s.setAttribute('src',e.api_version>=3?f.get_custom_resource_filename('module.js'):('/resources/module.js?uri='+escape("https://github.com/trummerschlunk/master_me")+'&r='+VERSION));
s.setAttribute('type','text/javascript');
s.onload=function(){
 Module_master_me({
 locateFile: function(p,_){return e.api_version>=3?f.get_custom_resource_filename(p):('/resources/'+p+'?uri='+escape("https://github.com/trummerschlunk/master_me")+'&r='+VERSION)},
 postRun:function(m){
 var cn=e.icon.attr('mod-instance').replaceAll('/','_');
 var cnl=m.lengthBytesUTF8(cn) + 1;
 var cna=m._malloc(cnl);
 m.stringToUTF8(cn, cna, cnl);
 e.icon.find('canvas')[0].id=cn;
 var a=m.addFunction(function(i,v){f.set_port_value(ps[i],v);},'vif');
 var b=m.addFunction(function(u,v){f.patch_set(m.UTF8ToString(u),'s',m.UTF8ToString(v));},'vpp');
 var h=m._modgui_init(cna,a,b);
 m._free(cna);
 e.data.h=h;
 e.data.m=m;
 for(var u in e.data.p.p){
 var ul=m.lengthBytesUTF8(u)+1,ua=m._malloc(ul),v=e.data.p.p[u],vl=m.lengthBytesUTF8(v)+1,va=m._malloc(vl);
 m.stringToUTF8(u,ua,ul);
 m.stringToUTF8(v,va,vl);
 m._modgui_patch_set(h, ua, va);
 m._free(ua);
 m._free(va);
 }
 for(var symbol in e.data.p.c){m._modgui_param_set(h,ps.indexOf(symbol),e.data.p.c[symbol]);}
 delete e.data.p;
 window.dispatchEvent(new Event('resize'));
 },
 canvas:(function(){var c=e.icon.find('canvas')[0];c.addEventListener('webglcontextlost',function(e2){alert('WebGL context lost. You will need to reload the page.');e2.preventDefault();},false);return c;})(),
 });
};
document.head.appendChild(s);

}else if(e.type==='change'){

if(e.data.h && e.data.m){
 var m=e.data.m;
 if(e.uri){
  var ul=m.lengthBytesUTF8(e.uri)+1,ua=m._malloc(ul),vl=m.lengthBytesUTF8(e.value)+1,va=m._malloc(vl);
  m.stringToUTF8(e.uri,ua,ul);
  m.stringToUTF8(e.value,va,vl);
  m._modgui_patch_set(e.data.h,ua,va);
  m._free(ua);
  m._free(va);
 }else if(e.symbol===':bypass'){return;
 }else{m._modgui_param_set(e.data.h,ps.indexOf(e.symbol),e.value);}
}else{
 if(e.symbol===':bypass')return;
 if(e.uri){e.data.p.p[e.uri]=e.value;}else{e.data.p.c[e.symbol]=e.value;}
}

}else if(e.type==='end'){
 if(e.data.h && e.data.m){
  var h = e.data.h;
  var m = e.data.m;
  e.data.h = e.data.m = null;
  m._modgui_cleanup(h);
}

}
}
