// Card-art downloader. Art is fetched by the player's own copy from Scryfall and
// cached in the user's data folder; nothing is bundled or redistributed.
const {app,ipcMain,protocol,net,shell}=require('electron');
const path=require('path'), fs=require('fs'), {pathToFileURL}=require('url');
const API=process.env.SHANDALAR_SCRYFALL_API||'https://api.scryfall.com';
const UA='ShandalarDuels/1.0 (fan project; personal-use art cache)';
const HDR={'User-Agent':UA,'Accept':'application/json;q=0.9,*/*;q=0.8'};
// 1997-era sets, oldest printing preferred so the art matches the original look.
const SETS=['lea','leb','2ed','3ed','4ed','arn','atq','leg','drk','fem','ice','hml','all','chr'];
const dir=()=>path.join(app.getPath('userData'),'cardart');
const OKNAME=/^[a-z0-9_]{1,80}(_full)?\.jpg$/;
let job=null;

function registerScheme(){ protocol.registerSchemesAsPrivileged([{scheme:'cardart',privileges:{standard:true,secure:true,supportFetchAPI:true,bypassCSP:true}}]); }
function listIds(){ try{ return fs.readdirSync(dir()).filter(f=>OKNAME.test(f)&&fs.statSync(path.join(dir(),f)).size>500).map(f=>f.replace(/\.jpg$/,'')); }catch(e){ return []; } }
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const norm=n=>String(n).toLowerCase().replace(/[’']/g,"'").replace(/\s+/g,' ').trim();

async function jget(url,opt,signal){
  for(let a=0;a<4;a++){
    const r=await fetch(url,{...opt,headers:{...HDR,...(opt&&opt.headers)},signal});
    if(r.status===429||r.status>=500){ await sleep(1500*(a+1)); continue; }
    if(!r.ok) throw new Error('HTTP '+r.status+' '+url.slice(0,80));
    return r.json();
  }
  throw new Error('Scryfall busy, try again later');
}
function imgs(c){ const u=c.image_uris||(c.card_faces&&c.card_faces[0]&&c.card_faces[0].image_uris); return u?{art:u.art_crop,full:u.border_crop||u.normal}:null; }

async function fetchIndex(want,signal,prog){
  // 1. one paged search per run: all 1997-era printings, oldest first
  const found=new Map();
  let url=`${API}/cards/search?q=${encodeURIComponent('('+SETS.map(s=>'e:'+s).join(' or ')+')')}&unique=cards&prefer=oldest&order=name`;
  let page=0;
  while(url){
    const j=await jget(url,null,signal); page++;
    for(const c of j.data||[]){ const k=norm(c.name); if(want.has(k)&&!found.has(k)){ const i=imgs(c); if(i) found.set(k,i); } }
    prog({msg:`Looking up cards (page ${page})…`,done:0,total:want.size,found:found.size});
    url=j.has_more?j.next_page:null; await sleep(110);
  }
  // 2. anything the set search missed: look up by exact name
  const miss=[...want.keys()].filter(k=>!found.has(k));
  for(let i=0;i<miss.length;i+=75){
    const ids=miss.slice(i,i+75).map(k=>({name:want.get(k).name}));
    const j=await jget(`${API}/cards/collection`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({identifiers:ids})},signal);
    for(const c of j.data||[]){ const k=norm(c.name); if(want.has(k)&&!found.has(k)){ const x=imgs(c); if(x) found.set(k,x); } }
    await sleep(110);
  }
  return found;
}
async function save(url,file,signal){
  if(fs.existsSync(file)&&fs.statSync(file).size>500) return false;
  for(let a=0;a<3;a++){
    try{ const r=await fetch(url,{headers:{'User-Agent':UA},signal}); if(!r.ok) throw new Error('HTTP '+r.status); const b=Buffer.from(await r.arrayBuffer()); if(b.length<500) throw new Error('empty'); fs.writeFileSync(file+'.part',b); fs.renameSync(file+'.part',file); return true; }
    catch(e){ if(signal.aborted) throw e; await sleep(800*(a+1)); }
  }
  return null;
}
async function download(cards,send){
  if(job) return {ok:false,error:'A download is already running.'};
  const ac=new AbortController(); job=ac;
  const prog=d=>{ try{ send(d); }catch(e){} };
  try{
    fs.mkdirSync(dir(),{recursive:true});
    const want=new Map(); for(const c of cards||[]){ if(c&&/^[a-z0-9_]{1,80}$/.test(c.id)) want.set(norm(c.name),c); }
    const have=new Set(listIds());
    const todo=[...want.values()].filter(c=>!(have.has(c.id)&&have.has(c.id+'_full')));
    if(!todo.length){ prog({msg:'Everything is already downloaded.',done:1,total:1,finished:true}); return {ok:true,fetched:0,missing:0}; }
    const w2=new Map(todo.map(c=>[norm(c.name),c]));
    const idx=await fetchIndex(w2,ac.signal,prog);
    const jobs=[]; let missing=0;
    for(const [k,c] of w2){ const i=idx.get(k); if(!i){ missing++; continue; } if(i.art) jobs.push([i.art,path.join(dir(),c.id+'.jpg')]); if(i.full) jobs.push([i.full,path.join(dir(),c.id+'_full.jpg')]); }
    let done=0, failed=0, q=jobs.slice();
    const worker=async()=>{ while(q.length){ const [u,f]=q.pop(); const r=await save(u,f,ac.signal); if(r===null) failed++; done++; if(done%5===0||done===jobs.length) prog({msg:`Downloading images…`,done,total:jobs.length}); } };
    await Promise.all([worker(),worker(),worker(),worker()]);
    prog({msg:'Finished.',done:jobs.length,total:jobs.length,finished:true,failed,missing});
    return {ok:true,fetched:jobs.length-failed,failed,missing};
  }catch(e){
    const aborted=ac.signal.aborted;
    prog({msg:aborted?'Cancelled.':'Failed: '+(e&&e.message||e),error:!aborted,finished:true});
    return {ok:false,error:aborted?'cancelled':String(e&&e.message||e)};
  }finally{ job=null; }
}
function register(getWin){
  protocol.handle('cardart',req=>{
    try{ const u=new URL(req.url); const f=decodeURIComponent(u.pathname).replace(/^\/+/,''); if(!OKNAME.test(f)) return new Response('bad',{status:400}); const p=path.join(dir(),f); if(!fs.existsSync(p)) return new Response('none',{status:404}); return net.fetch(pathToFileURL(p).toString()); }
    catch(e){ return new Response('err',{status:500}); }
  });
  ipcMain.handle('art:list',()=>listIds());
  ipcMain.handle('art:download',(e,cards)=>download(cards,d=>{ const w=getWin(); if(w&&!w.isDestroyed()) w.webContents.send('art:progress',d); }));
  ipcMain.handle('art:cancel',()=>{ if(job) job.abort(); return true; });
  ipcMain.handle('art:clear',()=>{ try{ fs.rmSync(dir(),{recursive:true,force:true}); }catch(e){} return true; });
  ipcMain.handle('art:folder',()=>{ try{ fs.mkdirSync(dir(),{recursive:true}); shell.openPath(dir()); }catch(e){} return dir(); });
}
module.exports={registerScheme,register};
