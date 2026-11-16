/* ===== Settings, backup and restore ===== */
async function makeBackup(){return{v:3,app:'vylt',createdAt:new Date().toISOString(),albums,tags,fileTags,favorites:[...favs],lyrics:await allLyr(),pos,seen:[...seen],epOver,cv:await cineExport(),rdp:rdProg||(await getS('rdp'))||{},rdf:rdFold||(await getS('rdf'))||[],rdb:rdBm||(await getS('rdb'))||{},rdc:(typeof rdCats!=='undefined'&&rdCats)||(await getS('rdc'))||[],wlog:await wlogLoad(),plays:await psLoad(),eq:await eqLoad()}}
function downloadBackup(data,name){const u=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1500)}
async function saveBackup(){
 try{const data=JSON.stringify(await makeBackup());
  const FS=window.Capacitor?.isNativePlatform?.()&&window.Capacitor.Plugins?.Filesystem;
  if(FS){await FS.writeFile({path:'VYLT/VYLT-backup.json',data,directory:'DOCUMENTS',encoding:'utf8',recursive:true});toast('Saved to Documents/VYLT/VYLT-backup.json')}
  else{downloadBackup(data,'VYLT-backup.json');toast('VYLT backup file created')}}
 catch(e){toast('Backup failed: '+(e.message||e))}}
let restoreInProgress=false;
const restoreYield=()=>new Promise(resolve=>setTimeout(resolve,0));
function restoreProgress(label,percent){
 let el=document.getElementById('vylt-restore-progress');
 if(!el){el=document.createElement('div');el.id='vylt-restore-progress';el.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(5,4,12,.82);display:grid;place-items:center;padding:24px;backdrop-filter:blur(8px)';el.innerHTML='<div style="width:min(420px,100%);padding:22px;border-radius:20px;background:var(--panel,#211b2e);color:var(--tx,#fff);box-shadow:0 20px 70px #0008"><h2 style="margin:0 0 8px">Restoring VYLT</h2><p id="vylt-restore-label" style="margin:0 0 14px;color:var(--muted,#aaa)"></p><div style="height:9px;border-radius:20px;background:#ffffff20;overflow:hidden"><div id="vylt-restore-bar" style="height:100%;width:0;background:var(--ac,#a78bfa);transition:width .2s"></div></div><p id="vylt-restore-percent" style="margin:10px 0 0;text-align:right;font-size:12px;color:var(--muted,#aaa)">0%</p></div>';document.body.append(el)}
 el.querySelector('#vylt-restore-label').textContent=label;
 el.querySelector('#vylt-restore-bar').style.width=Math.max(0,Math.min(100,percent))+'%';
 el.querySelector('#vylt-restore-percent').textContent=Math.round(percent)+'%';
}
function closeRestoreProgress(){document.getElementById('vylt-restore-progress')?.remove()}
function restoreChoice(){return new Promise(resolve=>{
 const m=modal('Restore VYLT backup','<p>A backup can be merged with your current library or replace the VYLT organization data on this device.</p><p><b>Merge</b> keeps current data and adds missing backup items. Existing matching entries are preserved where possible.</p><p><b>Replace</b> replaces the data covered by this backup. A safety backup will be created first.</p><div class="row" style="flex-wrap:wrap;margin-top:16px"><button class="b2" id="restore-cancel">Cancel</button><button class="b2" id="restore-merge">Merge</button><button class="b" id="restore-replace">Replace</button></div>');
 const done=v=>{m.close();resolve(v)};
 $('#restore-cancel',m.body).onclick=()=>done(null);
 $('#restore-merge',m.body).onclick=()=>done('merge');
 $('#restore-replace',m.body).onclick=()=>{const ok=confirm('Replace VYLT organization data with this backup? A safety backup will be created first. Data not present in the selected backup may be removed.');if(ok)done('replace')};
 })}
function validateVYLTBackup(j){
 if(!j||typeof j!=='object'||Array.isArray(j))throw Error('The selected file is not a valid backup.');
 const full=Array.isArray(j.albums)&&Array.isArray(j.tags)&&Array.isArray(j.favorites);
 const legacyCine=Array.isArray(j.movies);
 if(!full&&!legacyCine)throw Error('This does not look like a VYLT or CineVault backup.');
 if(full){if(j.albums.some(x=>!x||typeof x!=='object'||!Array.isArray(x.paths)))throw Error('The backup contains an invalid album entry.');if(j.tags.some(x=>typeof x!=='string'))throw Error('The backup contains invalid tags.');if(j.favorites.some(x=>typeof x!=='string'))throw Error('The backup contains invalid favorites.');if(j.fileTags!=null&&(typeof j.fileTags!=='object'||Array.isArray(j.fileTags)))throw Error('The backup contains invalid file tags.');if(j.lyrics!=null&&(typeof j.lyrics!=='object'||Array.isArray(j.lyrics)))throw Error('The backup contains invalid lyrics.');}
 return full?'full':'cine';
}
async function createPreRestoreBackup(snapshot){
 const data=JSON.stringify(snapshot||await makeBackup());const stamp=new Date().toISOString().replace(/[:.]/g,'-');
 const FS=window.Capacitor?.isNativePlatform?.()&&window.Capacitor.Plugins?.Filesystem;
 if(FS){const path='VYLT/Pre-restore-'+stamp+'.json';await FS.writeFile({path,data,directory:'DOCUMENTS',encoding:'utf8',recursive:true});return 'Saved safety copy to Documents/'+path}
 downloadBackup(data,'VYLT-pre-restore-'+stamp+'.json');return 'A safety backup download was created';
}
const union=(a,b)=>[...new Set([...(Array.isArray(a)?a:[]),...(Array.isArray(b)?b:[])])];
function mergeFolders(current,incoming){const out=Array.isArray(current)?current.slice():[];for(const item of incoming||[]){const key=item?.id||item?.name;const i=out.findIndex(x=>(x?.id||x?.name)===key);if(i<0)out.push(item);else{const old=out[i];out[i]={...item,...old,paths:union(old.paths,item.paths),folders:mergeFolders(old.folders,item.folders)}}}return out}
function mergeAlbums(current,incoming){return mergeFolders(current,incoming)}
async function restoreLyrics(lyrics,replace=false){
 const entries=Object.entries(lyrics||{});await new Promise((resolve,reject)=>{let tx;try{tx=db.transaction('lyrics','readwrite');const store=tx.objectStore('lyrics');if(replace)store.clear();for(const [k,v] of entries){if(replace)store.put(v,k);else{const q=store.get(k);q.onsuccess=()=>{if(q.result===undefined)store.put(v,k)}}}tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('Could not restore lyrics'));tx.onabort=()=>reject(tx.error||new Error('Lyrics restore was interrupted'))}catch(e){reject(e)}})
}
async function rollbackRestore(snapshot){
 if(!snapshot)return;albums=snapshot.albums||[];tags=snapshot.tags||[];fileTags=snapshot.fileTags||{};favs=new Set(snapshot.favorites||[]);normAlbums();
 await Promise.all([saveAll(),setS('fileTags',fileTags)]);await restoreLyrics(snapshot.lyrics,true);
 pos=snapshot.pos||{};seen=new Set(snapshot.seen||[]);epOver=snapshot.epOver||{};await Promise.all([savePos(true),saveSeen(),saveOver()]);
 rdFold=snapshot.rdf||[];rdProg=snapshot.rdp||{};rdBm=snapshot.rdb||{};if(typeof rdCats!=='undefined')rdCats=snapshot.rdc||[];
 await Promise.all([setS('rdf',rdFold),setS('rdp',rdProg),setS('rdb',rdBm),setS('rdc',snapshot.rdc||[]),setS('wlog',snapshot.wlog||{}),setS('plays',snapshot.plays||{}),setS('eq',snapshot.eq||{})]);
 wlog=snapshot.wlog||{};playStats=snapshot.plays||{};eqSet=snapshot.eq||eqSet;eqPushed=false;
 await dbx('movies','readwrite',s=>s.clear());cvFolders=snapshot.cv?.folders||[];cvCovers={};for(const k in(snapshot.cv?.covers||{}))cvCovers[k]=d2b(snapshot.cv.covers[k]);await saveF();await saveC();await reloadMovies();if(snapshot.cv)await cineImport(snapshot.cv);
 renderTab();updMini();renderSelbar();
}
async function refreshRestoredAppState(snapshot, restored){
 // Rebind every long-lived cache used by screens; a redraw alone cannot fix stale module state.
 albums=albums||[];tags=tags||[];fileTags=fileTags||{};favs=favs instanceof Set?favs:new Set(favs||[]);
 pos=pos||{};seen=seen instanceof Set?seen:new Set(seen||[]);epOver=epOver||{};
 if(typeof rdProg!=='undefined'&&Object.prototype.hasOwnProperty.call(restored,'rdp'))rdProg=restored.rdp||{};
 if(typeof rdFold!=='undefined'&&Object.prototype.hasOwnProperty.call(restored,'rdf'))rdFold=restored.rdf||[];
 if(typeof rdBm!=='undefined'&&Object.prototype.hasOwnProperty.call(restored,'rdb'))rdBm=restored.rdb||{};
 if(typeof rdCats!=='undefined'&&Object.prototype.hasOwnProperty.call(restored,'rdc'))rdCats=restored.rdc||[];
 if(typeof rdMeta!=='undefined'&&restored.rdm)rdMeta=restored.rdm;
 if(typeof wlog!=='undefined'&&Object.prototype.hasOwnProperty.call(restored,'wlog'))wlog=restored.wlog||{};
 if(typeof playStats!=='undefined'&&Object.prototype.hasOwnProperty.call(restored,'plays'))playStats=restored.plays||{};
 if(typeof eqSet!=='undefined'&&Object.prototype.hasOwnProperty.call(restored,'eq')){eqSet=restored.eq||{on:false,levels:null};eqPushed=false;if(typeof eqPush==='function')await eqPush()}
 if(typeof cvFolders!=='undefined'&&restored.cv){cvFolders=restored.cv.folders||[];}
 if(typeof cvCovers!=='undefined'&&restored.cv){cvCovers={};for(const k in(restored.cv.covers||{}))cvCovers[k]=d2b(restored.cv.covers[k])}
 if(typeof reloadMovies==='function')await reloadMovies();
 if(typeof showsCache!=='undefined')showsCache=null;
 // Redraw the underlying page and any open full-screen sheet that exposes refresh().
 renderTab();updMini();renderSelbar();
 const top=topLayer();if(top&&typeof top.refresh==='function')top.refresh();
}

async function restoreBackup(file){
 if(!file||restoreInProgress)return;restoreInProgress=true;let snapshot=null,restoreStarted=false;
 try{
  restoreProgress('Reading backup file…',2);await restoreYield();
  const raw=await file.text();await restoreYield();
  restoreProgress('Checking backup contents…',8);const j=JSON.parse(raw);const kind=validateVYLTBackup(j);await restoreYield();
  const mode=await restoreChoice();if(!mode){closeRestoreProgress();return}
  restoreProgress('Creating a safety backup…',10);snapshot=await makeBackup();const safety=await createPreRestoreBackup(snapshot);await restoreYield();restoreStarted=true;
  if(kind==='cine'){
   restoreProgress('Importing CineVault items…',25);const n=await cineImport(j);restoreProgress('Refreshing your library…',95);await refreshRestoredAppState(null,{cv:{folders:cvFolders,covers:cvCovers}});await restoreYield();closeRestoreProgress();toast(n+' CineVault movies imported. '+safety+'.');return;
  }
  const replace=mode==='replace';
  restoreProgress(replace?'Replacing albums, tags and favorites…':'Merging albums, tags and favorites…',15);
  albums=replace?(j.albums||[]):mergeAlbums(albums,j.albums||[]);
  tags=replace?union([],j.tags):union(tags,j.tags);
  favs=new Set(replace?(j.favorites||[]):union([...favs],j.favorites||[]));
  if(replace)fileTags=j.fileTags||{};else{const merged={...(fileTags||{})};for(const [path,items] of Object.entries(j.fileTags||{}))merged[path]=union(merged[path],items);fileTags=merged}
  normAlbums();await Promise.all([saveAll(),setS('fileTags',fileTags)]);await restoreYield();

  restoreProgress('Restoring lyrics…',30);await restoreLyrics(j.lyrics,replace);await restoreYield();
  restoreProgress('Restoring video progress…',43);
  if(j.pos){pos=replace?{...j.pos}:{...j.pos,...pos};await savePos(true)}
  if(j.seen){seen=new Set(replace?j.seen:union([...seen],j.seen));await saveSeen()}
  if(j.epOver){epOver=replace?{...j.epOver}:{...j.epOver,...epOver};await saveOver()}
  await restoreYield();

  restoreProgress('Restoring Reader collections and progress…',57);
  if(Array.isArray(j.rdf)){rdFold=replace?j.rdf:mergeFolders(rdFold||(await getS('rdf'))||[],j.rdf);await setS('rdf',rdFold)}
  if(Array.isArray(j.rdc)){const cur=(typeof rdCats!=='undefined'&&rdCats)||(await getS('rdc'))||[];rdCats=replace?j.rdc:mergeFolders(cur,j.rdc);await setS('rdc',rdCats)}
  if(j.rdp){rdProg=replace?{...j.rdp}:{...j.rdp,...(rdProg||(await getS('rdp'))||{})};await setS('rdp',rdProg)}
  if(j.rdb){rdBm=replace?{...j.rdb}:{...j.rdb,...(rdBm||(await getS('rdb'))||{})};await setS('rdb',rdBm)}
  await restoreYield();

  restoreProgress('Restoring watch and music history…',72);
  if(j.wlog){const cur=replace?{}:await wlogLoad();for(const p in j.wlog)if(!cur[p]||j.wlog[p]>cur[p])cur[p]=j.wlog[p];wlog=cur;await setS('wlog',cur)}
  if(j.plays){const cur=replace?{}:await psLoad();for(const p in j.plays){const a=cur[p],b=j.plays[p];if(!a||(b.n||0)>(a.n||0))cur[p]=b}playStats=cur;await setS('plays',cur)}
  if(j.eq&&j.eq.levels){eqSet=j.eq;eqPushed=false;await setS('eq',eqSet)}
  await restoreYield();

  let n=0;if(j.cv){restoreProgress('Restoring CineVault shelf and artwork…',84);await restoreYield();if(replace){await dbx('movies','readwrite',s=>s.clear());cvFolders=[];cvCovers={};await saveF();await saveC();await reloadMovies()}n=await cineImport(j.cv)}
  restoreProgress('Updating VYLT screens…',95);await restoreYield();
  if(typeof reloadMovies==='function'&&j.cv)await reloadMovies();
  await refreshRestoredAppState(snapshot,{rdp:rdProg,rdf:rdFold,rdb:rdBm,rdc:rdCats,rdm:rdMeta,wlog,plays:playStats,eq:eqSet,cv:{folders:cvFolders,covers:cvCovers}});
  restoreProgress('Restore complete',100);await restoreYield();closeRestoreProgress();
  toast((replace?'Backup replaced VYLT data. ':'Backup merged successfully. ')+safety+'. Screens are updated.');
 }catch(e){closeRestoreProgress();let rollback='';if(restoreStarted&&snapshot){try{await rollbackRestore(snapshot);rollback=' Previous data was restored from the safety copy.'}catch(re){console.error('VYLT rollback failed',re);rollback=' Automatic recovery could not finish; keep the safety backup file and do not clear app data.'}}toast((e.message||'Could not restore backup.')+rollback);console.error('VYLT restore failed',e)}
 finally{restoreInProgress=false}
}

function renderSettings(root){
 root.innerHTML=`<header class="hd"><h1>${ic('sliders',26)} Settings</h1></header><div class="pad">
 <div class="card2"><h3>Theme</h3><div class="sws">${THEMES.map(([k,n,a,b])=>`<button class="sw ${curTheme()==k?'sel':''}" data-th="${k}" style="background:linear-gradient(135deg,${b} 50%,${a} 50%)"><span>${n}</span></button>`).join('')}</div></div>
 
 <div class="card2"><h3>Tools</h3><div class="row" style="flex-wrap:wrap"><button class="b2" id="gso">${ic('search',16)} Search everything</button><button class="b2" id="sto">${ic('grid',16)} Storage dashboard</button><button class="b2" id="mhs">${ic('music',16)} Music history</button><button class="b2" id="wts">${ic('clock',16)} Watch history</button><button class="b2" id="eqs">${ic('sliders',16)} Equalizer</button></div></div>
 <div class="card2"><h3>About this build</h3><div class="mu">VYLT 3.0 · albums (nesting, covers, sort), Reader (TXT, PDF, CBR, bookmarks, covers), watch history, biometric unlock, sleep timer, equalizer, search, storage</div></div>
 <div class="card2"><h3>Music notification</h3><p class="mu" id="mns">Checking…</p><div class="row"><button class="b2" id="mnn">Notification settings</button><button class="b2" id="mnb">App &amp; battery settings</button><button class="b2" id="mnr">Check again</button><button class="b2" id="mnt">Send test notification</button></div></div>
 <div class="card2"><h3>Lock</h3><div class="row"><button class="b2" id="lk">${ic('lock',16)} Lock now</button><button class="b2" id="cp">Change pattern</button></div>
  <label class="row"><input type="checkbox" id="al" style="width:auto"> Auto-lock after leaving the app</label><label class="row"><input type="checkbox" id="hl" style="width:auto"> Hide the pattern line while drawing</label>
  <label class="row"><input type="checkbox" id="bio" style="width:auto"> Unlock with fingerprint or face (pattern still works)</label></div>
 <div class="card2"><h3>Backup &amp; restore</h3><p class="mu">Saves albums, subfolders, tags, favorites, lyrics, Reader progress and bookmarks, playback history, video resume points and your CineVault shelf. Your real files are never included, so the backup stays small. Restore refreshes the active app screens and their in-memory data.</p>
  <div class="row"><button class="b" id="ex">Save backup</button></div><label class="mu">Restore a VYLT backup, or import an older CineVault backup. You will choose Merge or Replace each time; VYLT creates a safety backup first.</label><input type="file" id="im" accept=".json,application/json"></div>
 <div class="card2"><h3>Storage access</h3><p class="mu">Android needs “All files access” to let VYLT list your files. Nothing is copied or uploaded.</p><button class="b2" id="pm">Open storage permission settings</button></div>
 <div class="card2"><h3>Thumbnail cache</h3><p class="mu" id="tcs">Calculating…</p><label class="mu">Maximum size</label><select id="tcm">${[100,300,500,1000].map(v=>`<option value="${v}" ${prefs.cacheMB==v?'selected':''}>${v>=1000?'1 GB':v+' MB'}</option>`).join('')}</select><div class="row"><button class="b2" id="tcc">Clear cache</button></div><p class="mu">Thumbnails are small previews, never your real files. The oldest are removed when the limit is reached.</p></div>
 <div class="card2"><h3>Missing files</h3><p class="mu">Entries in albums, favorites or tags whose file is no longer on the phone.</p><div class="row"><button class="b2" id="mfc">Check &amp; clean up</button></div></div>
 <div class="card2"><h3>About</h3><p class="mu">Library index: ${files.length} files. VYLT stores only your organization data and small thumbnails.</p></div></div>`;
 const mns=async()=>{const el=$('#mns',root);if(!el)return;
  if(!NM){el.textContent='The Android music engine is not loaded in this build, so songs play inside the app only and no notification can be shown.';return}
  try{const s=await NM.notifStatus();el.textContent=(!s.enabled?'Notifications are OFF for VYLT. Tap “Notification settings” and turn them on.':s.channel===false?'The “Music playback” notification category is turned OFF. Tap “Notification settings” and switch it on.':'Notifications are ON for VYLT.')+' Music service: '+(s.service?'running':'not running (play a song first)')+(s.error?' · last error: '+s.error:'')+'\nPlaying: '+(s.playing?'yes':'no')+' · Music notification posted: '+(s.posted?'YES':'NO')+' · Channel importance: '+s.importance+' · Android '+s.sdk}
  catch(e){el.textContent='Could not check: '+(e.message||e)}};mns();
 $('#mnn',root).onclick=()=>NM?NM.openNotifSettings().catch(e=>toast(e.message)):toast('Not available in this build');
 $('#mnb',root).onclick=()=>NM?NM.openAppSettings().catch(e=>toast(e.message)):toast('Not available in this build');
 $('#mnr',root).onclick=mns;
 $('#mnt',root).onclick=()=>NM?NM.testNotification().then(()=>toast('Test sent. Pull down the notification panel.')).catch(e=>toast(e.message||'Could not send')):toast('Not available in this build');
 const tcs=()=>thumbStats().then(t=>{const el=$('#tcs',root);if(el)el.textContent=`${bytes(t.bytes)} used of ${prefs.cacheMB>=1000?'1 GB':prefs.cacheMB+' MB'} · ${t.count} thumbnails`});tcs();
 $('#tcm',root).onchange=async e=>{prefs.cacheMB=+e.target.value;await savePrefs();await thumbTrim();tcs()};
 $('#tcc',root).onclick=async()=>{await thumbClear();tcs();toast('Thumbnail cache cleared')};
 $('#mfc',root).onclick=()=>missingModal();
 $('.sws',root).onclick=async e=>{const b=e.target.closest('.sw');if(!b)return;const theme=b.dataset.th;applyTheme(theme);applyAccent(null);await setS('accent','');await setS('theme',theme);$$('.sw',root).forEach(x=>x.classList.toggle('sel',x==b));try{const changed=await updateLauncherThemeIcon(theme);if(changed)toast('Theme and app icon updated.');else toast('Theme updated. Launcher icon changes require the installed Android build.')}catch(err){toast('Theme updated, but the launcher icon could not change: '+(err.message||err));console.error(err)}};
 $('#gso',root).onclick=openSearch;$('#sto',root).onclick=storageSheet;$('#mhs',root).onclick=()=>historySheet('recent');$('#wts',root).onclick=watchSheet;$('#eqs',root).onclick=eqModal;
 $('#lk',root).onclick=()=>showLock();$('#cp',root).onclick=()=>showLock('set');
 getS('bio').then(v=>$('#bio',root).checked=!!v);
 $('#bio',root).onchange=async e=>{const c=e.target;if(!c.checked){await setS('bio',0);return}
  if(!native||!FV.biometricAuth){c.checked=false;return toast('Available in the Android app.')}
  try{await FV.biometricAuth({title:'Turn on biometric unlock',cancel:'Cancel'});await setS('bio',1);toast('Biometric unlock is on. Your pattern still works.')}catch(err){c.checked=false;toast('Could not turn it on: '+(err.message||err))}};
 getS('al').then(v=>$('#al',root).checked=v!==0);getS('hl').then(v=>$('#hl',root).checked=!!v);
 $('#al',root).onchange=e=>setS('al',e.target.checked?1:0);$('#hl',root).onchange=e=>setS('hl',e.target.checked?1:0);
 $('#ex',root).onclick=saveBackup;$('#im',root).onchange=e=>{const f=e.target.files[0];if(f)restoreBackup(f);e.target.value=''};
 $('#pm',root).onclick=()=>native?FV.requestStorageAccess():toast('Available in the Android app.')}
