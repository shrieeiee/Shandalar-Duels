// Balance sim: color-coherent random decks of the new cards, AI vs AI.
// Usage: GAMES=1500 node tests/tools/balance.js [out.json]   (not part of npm test)
const fs=require('fs'), path=require('path');
const src=fs.readFileSync(process.env.GAME||path.join(__dirname,'..','..','web','index.html'),'utf8');
new Function(src.slice(src.lastIndexOf('<script>')+8,src.lastIndexOf('</script>')))();
const E=globalThis.__engine;
const ids=JSON.parse(fs.readFileSync(path.join(__dirname,'..','data','new-card-ids.json'))).map(x=>x[1]).filter(i=>E.DB[i]);
const COL=['W','U','B','R','G'], BASIC={W:'plains',U:'island',B:'swamp',R:'mountain',G:'forest'};
const colsOf=id=>COL.filter(c=>(E.DB[id].cost||'').includes(c));
const isLandId=id=>/Land/.test(E.DB[id].type);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const stat={}; for(const id of ids) stat[id]={g:0,w:0,cast:0,castGames:0,nm:E.DB[id].name};
const N=+process.env.GAMES||1200;
(async()=>{ let games=0,errs=0,draws=0,seat0=0;
 const mk=()=>{ const cs=[pick(COL),pick(COL)]; const pool=ids.filter(id=>!isLandId(id)&&colsOf(id).every(c=>cs.includes(c))); const landsNew=ids.filter(id=>isLandId(id)&&colsOf(id).every(c=>cs.includes(c))); const d={}; const spells=[];
   for(let i=0;i<22&&pool.length;i++){ const id=pick(pool); if((d[id]||0)<2){ d[id]=(d[id]||0)+1; spells.push(id); } }
   let ln=0; for(const id of landsNew.slice(0,2)){ d[id]=1; ln++; }
   const rest=18-ln; d[BASIC[cs[0]]]=(d[BASIC[cs[0]]]||0)+Math.ceil(rest/2); d[BASIC[cs[1]]]=(d[BASIC[cs[1]]]||0)+Math.floor(rest/2); return d; };
 for(let n=0;n<N;n++){ const d0=mk(), d1=mk();
  try{ await E.newGame(E.expand(d0),E.expand(d1),['A','B'],true); }catch(e){ errs++; continue; }
  const g=E.getG(); games++; const w=g.over?g.over.winner:-1; if(w===0) seat0++; if(w!==0&&w!==1){ draws++; continue; }
  const text=g.log.map(l=>l.msg).join('\n');
  [[d0,0],[d1,1]].forEach(([d,pid])=>{ for(const id of Object.keys(d)){ if(!stat[id]) continue; const s=stat[id]; s.g++; if(w===pid) s.w++; const nm=E.DB[id].name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); const pn=g.players[pid].name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); const m=text.match(new RegExp(pn+' (casts|plays|activates) '+nm,'g')); if(m){ s.castGames++; s.cast+=m.length; } } });
 }
 const rows=Object.entries(stat).filter(([,s])=>s.g>=15).map(([id,s])=>({id,name:s.nm,games:s.g,win:+(s.w/s.g).toFixed(3),useRate:+(s.castGames/s.g).toFixed(3)})).sort((a,b)=>b.win-a.win);
 const out={games,errors:errs,draws,seat0Win:+(seat0/Math.max(1,games-draws)).toFixed(3),rows}; if(process.argv[2]) fs.writeFileSync(process.argv[2],JSON.stringify(out,null,1));
 console.log('games',games,'errors',errs,'draws',draws,'seat0',out.seat0Win,'cards',rows.length);
 console.log('TOP'); rows.slice(0,12).forEach(r=>console.log(r.win,r.useRate,r.games,r.name));
 console.log('BOTTOM'); rows.slice(-12).forEach(r=>console.log(r.win,r.useRate,r.games,r.name));
 console.log('NEVER USED (useRate<0.15)'); rows.filter(r=>r.useRate<0.15).forEach(r=>console.log(r.useRate,r.games,r.name)); })();
