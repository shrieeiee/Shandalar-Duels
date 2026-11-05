// Arena: new combat AI vs old combat AI on the same decks, seats alternated.
// Usage: GAMES=1000 node tests/tools/arena.js      (switch: globalThis.__aix = {seat:bool})
const fs=require('fs'), path=require('path');
const src=fs.readFileSync(process.env.GAME||path.join(__dirname,'..','..','web','index.html'),'utf8');
new Function(src.slice(src.lastIndexOf('<script>')+8,src.lastIndexOf('</script>')))();
const E=globalThis.__engine;
const decks=[...Object.values(E.STARTERS),...E.OPPONENTS.map(o=>o.deck)];
const N=+process.env.GAMES||600;
(async()=>{ let nw=0,ow=0,dr=0,err=0,turns=0,n=0;
 for(let i=0;i<N;i++){ const a=decks[Math.floor(Math.random()*decks.length)], b=decks[Math.floor(Math.random()*decks.length)]; const newSeat=i%2;
  globalThis.__aix={0:newSeat===0,1:newSeat===1}; if(process.env.MODE) globalThis.__aixMode=process.env.MODE; if(process.env.XP) globalThis.__aixP=JSON.parse(process.env.XP);
  try{ await E.newGame(E.expand(a),E.expand(b),['A','B'],true); }catch(e){ err++; continue; }
  const g=E.getG(); n++; turns+=g.turn; const w=g.over?g.over.winner:-1; if(w===newSeat) nw++; else if(w===1-newSeat) ow++; else dr++; }
 const dec=nw+ow, p=nw/Math.max(1,dec), se=Math.sqrt(p*(1-p)/Math.max(1,dec));
 console.log(`games ${n} errors ${err} draws ${dr} | new AI wins ${nw}, old AI wins ${ow} | new win rate ${(p*100).toFixed(1)}% ±${(1.96*se*100).toFixed(1)} | avg turns ${(turns/n).toFixed(1)}`); })();
