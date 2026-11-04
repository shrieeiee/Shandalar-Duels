const fs=require('fs');
const src=fs.readFileSync(process.env.GAME||require('path').join(__dirname,'..','..','web','index.html'),'utf8');
new Function(src.slice(src.lastIndexOf('<script>')+8,src.lastIndexOf('</script>')))();
const E=globalThis.__engine; const ids=JSON.parse(fs.readFileSync(require('path').join(__dirname,'..','data','new-card-ids.json'))).map(x=>x[1]).filter(i=>E.DB[i]);
const basics=['plains','island','swamp','mountain','forest'];
(async()=>{ let err=0,games=0,long=0; const errs={};
 for(let n=0;n<(+process.env.SIMS||120);n++){ const mkd=()=>{ const d={}; for(let i=0;i<24;i++){ const id=ids[Math.floor(Math.random()*ids.length)]; d[id]=(d[id]||0)+1; } const cols=[basics[Math.floor(Math.random()*5)],basics[Math.floor(Math.random()*5)]]; d[cols[0]]=(d[cols[0]]||0)+9; d[cols[1]]=(d[cols[1]]||0)+9; return d; };
  try{ await E.newGame(E.expand(mkd()),E.expand(mkd()),['A','B'],true); games++; const g=E.getG(); if(g.turn>=60) long++; }catch(e){ err++; const k=String(e&&e.stack||e).split('\n').slice(0,3).join(' | ').slice(0,200); errs[k]=(errs[k]||0)+1; } }
 console.log('games',games,'errors',err,'long',long); console.log(JSON.stringify(errs,null,1)); })();
