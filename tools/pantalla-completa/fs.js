// ============================================================================
// PANTALLA COMPLETA DE ENTRENAMIENTO (fs)
// Serie (GIF + peso/reps/RIR) → Descanso grande → [Prepárate 10 s si cambia de ejercicio] → Serie…
// Guarda cada serie igual que completeSet() (enqueue apiSaveSerieEntrenamiento) con peso y reps reales.
// ============================================================================
var fs={on:false,i:0,sig:null,pantalla:'serie',v:{peso:'',reps:'',rir:2},fases:null,actual:-1,ultimo:-1,timer:null,panel:false,guardando:false};
var FS_PREP=10;
function fsEsc(t){return String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function fsBoton(){const es=exercises();if(!state.routine||!es.length)return '';const tot=es.reduce((n,e)=>n+objective(e),0),hechas=es.reduce((n,e)=>n+Math.min(done(e).length,objective(e)),0);if(tot&&hechas>=tot)return '';return `<button class="fs-start" onclick="fsComenzar()">▶ ${hechas?`Continuar en pantalla completa (${hechas}/${tot} series)`:'Comenzar entrenamiento en pantalla completa'}</button>`;}
function fsPendienteDesde(desde){const es=exercises();for(let k=1;k<=es.length;k++){const j=(desde+k)%es.length;if(done(es[j]).length<objective(es[j]))return j;}return null;}
function fsCargarValores(){const e=exercises()[fs.i];if(!e)return;const d=draft(e);fs.v={peso:d.peso===undefined?'':String(d.peso),reps:String(d.reps??''),rir:Number(d.rir??2)};}
function fsComenzar(){
  if(state.guide){toast('Detén primero la rutina continua para usar la pantalla completa.');return;}
  const es=exercises();if(!es.length){toast('Hoy no hay ejercicios programados.');return;}
  try{prepareSound();loadVoiceClips();}catch(e){}
  fs.on=true;
  if(!fs.fases){const cur=es[state.focus];const p=(cur&&done(cur).length<objective(cur))?state.focus:es.findIndex(e=>done(e).length<objective(e));if(p<0)fs.pantalla='fin';else{fs.i=p;fs.pantalla='serie';fsCargarValores();}}
  $('fs').classList.remove('hidden');document.body.classList.add('fs-on');
  try{requestWake();}catch(e){}
  fsRender(true);
}
function fsSalir(){fs.on=false;$('fs').classList.add('hidden');document.body.classList.remove('fs-on');try{releaseWake();}catch(e){}renderWorkout();}
function fsCabecera(){const es=exercises();const tot=es.reduce((n,e)=>n+objective(e),0),hechas=es.reduce((n,e)=>n+Math.min(done(e).length,objective(e)),0);$('fs-cab').textContent=fs.pantalla==='fin'?'Sesión terminada':`Ejercicio ${fs.i+1} de ${es.length} · ${hechas}/${tot} series`;$('fs-prog').style.width=(tot?Math.round(hechas/tot*100):0)+'%';}
function fsGif(e,cls){const u=e&&safeURL(e.gif_url);return u?`<img class="fs-gif ${cls||''}" src="${fsEsc(u)}" alt="" referrerpolicy="no-referrer" onerror="this.style.display='none'">`:'';}
function fsRender(animar){
  if(!fs.on)return;fsCabecera();
  const es=exercises(),e=es[fs.i],box=$('fs-in');let h='';
  if(fs.pantalla==='fin'||!e){
    h=`<div class="fs-c" style="padding-top:40px"><div style="font-size:72px">🎉</div><div class="fs-name">¡Sesión completa!</div><p class="fs-muted">Todas tus series quedaron registradas.</p><button class="fs-big" onclick="fsSalir()">Cerrar</button></div>`;
  }else if(fs.pantalla==='serie'){
    const rows=done(e),obj=objective(e),n=Math.min(rows.length+1,obj),prev=previous(e),timed=e.modo==='tiempo';
    const ref=prev.length?prev.map(r=>timed?`${Number(r.duracion_seg)||Number(r.repeticiones)}s`:`${r.peso_kg}×${r.repeticiones}`).join(' · '):'Primera vez: elige una carga cómoda';
    const rir=k=>`<button class="fs-rir ${fs.v.rir===k?'on':''}" onclick="fs.v.rir=${k};fsRender(false)">${k===3?'3+':k}</button>`;
    h=`<div class="fs-c"><div class="fs-lbl">${fsEsc(e.grupo_muscular)} · ${fsEsc(e.tipo_carga||'')}</div><div class="fs-name">${fsEsc(e.nombre)}</div>${e.original_name?`<div class="fs-small fs-muted">En lugar de ${fsEsc(e.original_name)}</div>`:''}${fsGif(e)}
      <span class="fs-pill">Serie ${n} de ${obj}</span>
      <p class="fs-muted" style="margin:10px 0 0">🎯 ${timed?(e.trabajo_seg||e.reps_min)+' segundos':e.reps_min+'–'+e.reps_max+' reps'} · RIR 2-3 · descanso ${Number(e.descanso_intervalo_seg||e.descanso_seg)||90}s</p></div>
      <div class="fs-box fs-c fs-small"><span class="fs-muted">La última vez${prev.length?' ('+fsEsc(prev[0].fecha)+')':''}:</span> <strong>${fsEsc(ref)}</strong></div>
      ${rows.length?`<div class="fs-chips">${rows.map((r,k)=>`<span class="fs-chip">✓ S${k+1}: ${timed?(r.duracion_seg||r.repeticiones)+'s':r.peso_kg+'×'+r.repeticiones}</span>`).join('')}</div>`:''}
      <div class="fs-box">
        <div class="fs-row"><span class="k">Peso kg</span><button onclick="fsSumar('peso',-2.5)">−2,5</button><input type="number" step="0.5" inputmode="decimal" value="${fsEsc(fs.v.peso)}" oninput="fs.v.peso=this.value"><button onclick="fsSumar('peso',2.5)">+2,5</button></div>
        <div class="fs-row"><span class="k">${timed?'Seg.':'Reps'}</span><button onclick="fsSumar('reps',-1)">−</button><input type="number" inputmode="numeric" value="${fsEsc(fs.v.reps)}" oninput="fs.v.reps=this.value"><button onclick="fsSumar('reps',1)">+</button></div>
        <div class="fs-row"><span class="k">RIR</span>${rir(0)}${rir(1)}${rir(2)}${rir(3)}</div>
      </div>
      <button class="fs-big" ${fs.guardando?'disabled':''} onclick="fsTermineSerie()">${fs.guardando?'Guardando…':'✓ Terminé la serie'}</button>
      <div class="fs-two"><button class="fs-sec" onclick="fsSaltarEjercicio()">⏭ Saltar ejercicio</button><button class="fs-sec" onclick="fsTecnica()">Ver técnica</button></div>
      ${rows.length?'':`<button class="fs-change" onclick="fs.panel=!fs.panel;fsRender(false)">${fs.panel?'▴ Cerrar opciones':'🔁 ¿Máquina ocupada? Cambiar este ejercicio'}</button>${fs.panel?fsPanel(fs.i):''}`}`;
  }else{
    const prep=fs.pantalla==='prep',t=prep?fs.i:fs.sig,se=es[t];let info='';
    if(!prep&&se&&t===fs.i){const n=Math.min(done(se).length+1,objective(se));info=`<div class="fs-lbl" style="color:var(--muted)">Siguiente</div><div style="font-size:19px;font-weight:800;margin-top:4px">Serie ${n} de ${objective(se)} · ${fsEsc(se.nombre)}</div>`;}
    else if(se){const d=draft(se);info=`<div class="fs-lbl" style="color:var(--muted)">${prep?'Ahora':'Siguiente ejercicio'}</div><div class="fs-name" style="font-size:22px">${fsEsc(se.nombre)}</div>${fsGif(se,prep?'':'sm')}<div class="fs-muted fs-small">${objective(se)} series${d.peso!==''&&d.peso!==undefined?' · sugerido '+fsEsc(d.peso)+' kg':''}</div>${prep?'':`<div class="fs-small" style="color:var(--amber);margin-top:6px">Al terminar el descanso tendrás ${FS_PREP} s para ir a la máquina o tomar las mancuernas</div>`}`;}
    h=`<div class="fs-c"><div class="fs-lbl" style="color:${prep?'var(--amber)':'var(--blue)'}">${prep?'PREPÁRATE':'DESCANSO'}</div>
      <div id="fs-clock" class="fs-clock ${prep?'prep':'rest'}">--:--</div>
      <div class="fs-bar ${prep?'prep':''}"><span id="fs-barra" style="width:100%"></span></div>
      <div style="margin-top:18px">${info}</div>
      <div class="fs-two" style="margin-top:14px">${prep?'':'<button class="fs-sec" onclick="fsMover(30000)">+30 s</button>'}<button class="fs-big" style="margin:8px 0" onclick="fsMover(-1)">${prep?'Estoy listo ▶':'Saltar descanso ⏭'}</button></div>
      <button class="fs-change" onclick="fs.panel=!fs.panel;fsRender(false)">${fs.panel?'▴ Cerrar opciones':'🔁 ¿Máquina ocupada? Cambiar lo que sigue'}</button>${fs.panel?fsPanel(t):''}</div>`;
  }
  box.innerHTML=h;
  if(animar){box.classList.remove('fs-slide');void box.offsetWidth;box.classList.add('fs-slide');}
  fsPintarReloj();
}
// ---- Opciones para cambiar lo que sigue ----
function fsPanel(t){
  const es=exercises(),e=es[t];if(!e)return '';let h='<div style="text-align:left;margin-top:8px">';
  if(!done(e).length){
    const original=state.routine.ejercicios.find(x=>x.id_ejercicio===e.slot_id);
    const ops=[original,...(original?.alternativas||[])].filter(a=>a&&a.id_ejercicio!==e.id_ejercicio);
    h+=`<div class="fs-lbl" style="color:var(--amber);margin-top:10px">Mismo músculo</div>`+(ops.length?ops.map(a=>`<button class="fs-opt" onclick="fsUsarAlt(${t},${fsEsc(JSON.stringify(a.id_ejercicio))})"><strong>${a.id_ejercicio===e.slot_id?'↩ Volver a ':''}${fsEsc(a.nombre)}</strong><small>${fsEsc(a.tipo_carga||a.grupo_muscular||'')}</small></button>`).join(''):'<p class="fs-small fs-muted">No hay alternativas cargadas.</p>');
    h+=`<div class="fs-two" style="margin-top:6px"><input id="fs-libre" class="fs-input" maxlength="100" placeholder="Otro (escribe el nombre)"><button class="fs-sec" style="max-width:90px;margin:0" onclick="fsUsarLibre(${t})">Usar</button></div>`;
  }
  const otros=es.map((x,j)=>({x,j})).filter(o=>o.j!==t&&done(o.x).length<objective(o.x));
  if(otros.length&&fs.pantalla!=='serie')h+=`<div class="fs-lbl" style="color:var(--blue);margin-top:14px">O haz antes otro de la rutina</div>`+otros.map(o=>`<button class="fs-opt" onclick="fsElegir(${o.j})"><strong>${fsEsc(o.x.nombre)}</strong><small>${fsEsc(o.x.grupo_muscular)} · ${done(o.x).length}/${objective(o.x)} series</small></button>`).join('');
  return h+'</div>';
}
function fsTrasCambio(){fs.panel=false;if(fs.pantalla!=='descanso')fsCargarValores();fsRender(true);}
function fsUsarAlt(t,id){const e=exercises()[t];if(!e||done(e).length){toast('Ya registraste series de este ejercicio.');return;}state.swaps[sessionId()+'_'+e.slot_id]=id;delete state.drafts[draftKey(e)];writeLocal('swaps',state.swaps);writeLocal('drafts',state.drafts);toast('Cambiado a '+(exercises()[t]?.nombre||''));fsTrasCambio();}
function fsUsarLibre(t){const e=exercises()[t],nombre=String($('fs-libre')?.value||'').replace(/\s+/g,' ').trim();if(nombre.length<3){toast('Escribe el nombre del ejercicio.');return;}if(!e||done(e).length)return;state.swaps[sessionId()+'_'+e.slot_id]={id_ejercicio:'CUSTOM-'+uuid(),nombre:nombre.slice(0,100),grupo_muscular:e.grupo_muscular,tipo_carga:'Carga libre',modo:'reps',custom:true,notas_tecnica:'Ejercicio personalizado por el usuario.',alternativas:[]};writeLocal('swaps',state.swaps);toast('Cambiado a '+nombre);fsTrasCambio();}
function fsElegir(j){
  const es=exercises();if(!es[j])return;
  if(fs.pantalla==='prep'){fs.i=j;fs.sig=j;}
  else if(fs.pantalla==='descanso'&&fs.fases){
    fs.sig=j;const F=fs.fases,last=F[F.length-1];
    if(j!==fs.i&&last.tipo!=='prep')F.push({tipo:'prep',seg:FS_PREP,ini:last.fin,fin:last.fin+FS_PREP*1000});
    if(j===fs.i&&last.tipo==='prep'&&fs.actual<F.length-1)F.pop();
  }
  toast('Lo siguiente: '+es[j].nombre);fsTrasCambio();
}
// ---- Serie ----
function fsSumar(k,d){const v=parseFloat(String(fs.v[k]).replace(',','.'));let n=(isFinite(v)?v:0)+d;if(n<0)n=0;fs.v[k]=String(Math.round(n*100)/100);fsRender(false);}
function fsTecnica(){const prev=state.focus;state.focus=fs.i;technique();state.focus=prev;}
function fsSaltarEjercicio(){const n=fsPendienteDesde(fs.i);if(n===null||n===fs.i){toast('No hay otro ejercicio pendiente.');return;}fs.i=n;fs.panel=false;fsCargarValores();fsRender(true);}
function fsTermineSerie(){
  if(fs.guardando||state.loading)return;
  const e=exercises()[fs.i];if(!e)return;
  const weight=Number(String(fs.v.peso).replace(',','.')),reps=Number(fs.v.reps),timed=e.modo==='tiempo';
  if(String(fs.v.peso).trim()===''||!Number.isFinite(weight)||weight<0||weight>1000||!Number.isInteger(reps)||reps<1||reps>(timed?7200:1000)){toast('Revisa la carga y las repeticiones.');return;}
  const rows=done(e);if(rows.length>=objective(e)){fsSaltarEjercicio();return;}
  fs.guardando=true;
  const id=uuid(),n=Math.max(0,...rows.map(r=>Number(r.numero_serie)||0))+1;
  const payload={request_id:id,fecha:today(),session_id:sessionId(),slot_id:e.slot_id,dia_sesion:state.routine.sesion,id_ejercicio:e.id_ejercicio,custom_exercise:e.custom?e:undefined,numero_serie:n,peso_kg:weight,repeticiones:timed?0:reps,duracion_seg:timed?reps:'',rir:Number(fs.v.rir),notas_serie:e.original_name?'En lugar de '+e.original_name:''};
  const row={...payload,id_serie:'ENT-'+id,volumen_kg:timed?0:weight*reps,modo:e.modo||'reps'};
  state.drafts[draftKey(e)]={peso:String(weight),reps:String(reps),rir:Number(fs.v.rir)};writeLocal('drafts',state.drafts);
  const ok=enqueue('apiSaveSerieEntrenamiento',payload,{kind:'series',row});
  fs.guardando=false;
  if(!ok){fsRender(false);return;}
  toast('Serie '+n+' guardada · '+weight+' kg × '+reps);
  const completo=done(e).length>=objective(e);
  const sig=completo?fsPendienteDesde(fs.i):fs.i;
  if(sig===null){fsParar();fs.pantalla='fin';try{beep();}catch(x){}fsRender(true);return;}
  fsDescanso(Number(e.descanso_intervalo_seg||e.descanso_seg)||90,sig);
}
// ---- Cronómetro (horas absolutas: si el teléfono se bloquea, al volver muestra el punto correcto) ----
function fsDescanso(seg,sig){
  fs.sig=sig;fs.pantalla='descanso';fs.panel=false;
  const t=Date.now();fs.fases=[{tipo:'descanso',seg,ini:t,fin:t+seg*1000}];
  if(sig!==fs.i)fs.fases.push({tipo:'prep',seg:FS_PREP,ini:t+seg*1000,fin:t+(seg+FS_PREP)*1000});
  fs.actual=0;fs.ultimo=-1;clearInterval(fs.timer);fs.timer=setInterval(fsTick,250);
  try{speakCue('rest');}catch(x){}
  try{requestWake();}catch(x){}
  fsRender(true);
}
function fsParar(){clearInterval(fs.timer);fs.timer=null;fs.fases=null;}
function fsTick(){
  const F=fs.fases;if(!F)return;const now=Date.now(),fin=F[F.length-1].fin;
  if(now>=fin){fsParar();fs.i=fs.sig;fs.pantalla='serie';fs.panel=false;fsCargarValores();try{speakCue('go');}catch(x){}try{navigator.vibrate?.([200,100,200]);}catch(x){}fsRender(true);if(!fs.on)renderWorkout();return;}
  let k=0;while(k<F.length-1&&now>=F[k].fin)k++;
  if(k!==fs.actual){fs.actual=k;fs.ultimo=-1;if(F[k].tipo==='prep'){fs.i=fs.sig;fs.pantalla='prep';fs.panel=false;fsCargarValores();try{speakCue('prep');}catch(x){}fsRender(true);}}
  const rem=Math.ceil((F[k].fin-now)/1000);
  if(rem!==fs.ultimo){fs.ultimo=rem;fsPintarReloj();if(rem>=1&&rem<=5&&(F[k].tipo==='prep'||k===F.length-1)){try{speakCue(String(rem));}catch(x){}}}
}
function fsPintarReloj(){const F=fs.fases;if(!F||!fs.on)return;const f=F[Math.max(0,fs.actual)],rem=Math.max(0,Math.ceil((f.fin-Date.now())/1000));const c=$('fs-clock');if(c)c.textContent=fmtTime(rem);const b=$('fs-barra');if(b)b.style.width=Math.max(0,Math.min(100,rem/f.seg*100))+'%';}
function fsMover(d){const F=fs.fases;if(!F)return;const k=Math.max(0,fs.actual),f=F[k],now=Date.now();const delta=d<0?now-f.fin:d;for(let j=k;j<F.length;j++){if(j>k)F[j].ini+=delta;F[j].fin+=delta;}fs.ultimo=-1;fsTick();}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&fs.fases){fsTick();try{requestWake();}catch(x){}}});
