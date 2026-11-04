const fs=require('fs');
const src=fs.readFileSync(process.env.GAME||require('path').join(__dirname,'..','..','web','index.html'),'utf8');
new Function(src.slice(src.lastIndexOf('<script>')+8,src.lastIndexOf('</script>')))();
const E=globalThis.__engine;
(async()=>{
  for(const [n,d] of Object.entries(E.STARTERS)){ const c=Object.values(d).reduce((a,b)=>a+b,0); if(c<40) console.log('SMALL starter',n,c); for(const id of Object.keys(d)) if(!E.DB[id]) console.log('MISSING',id); }
  const duals=['tundra','underground_sea','badlands','taiga','savannah','scrubland','volcanic_island','bayou','plateau','tropical_island'];
  const mana={...Object.fromEntries(duals.map(d=>[d,2])),mox_pearl:1,mox_sapphire:1,mox_jet:1,mox_ruby:1,mox_emerald:1,basalt_monolith:2,sol_ring:1,plains:2,island:2,swamp:2,mountain:2,forest:2,
    serra_angel:2,air_elemental:2,sengir_vampire:2,shivan_dragon:2,craw_wurm:2,hypnotic_specter:2,lightning_bolt:3,counterspell:3,swords_to_plowshares:2,terror:2,giant_growth:2,wrath_of_god:1,control_magic:1,fireball:2};
  const decks=[mana,...Object.values(E.STARTERS),...E.OPPONENTS.map(o=>o.deck)];
  let errs=0,n=0,stuckish=0; const ev={moxen:0,monolith:0,dual:0};
  for(const [i,Ddeck] of decks.entries()) for(let r=0;r<(+process.env.REPS||14);r++){
    const opp=decks[(i+r+1)%decks.length];
    try{ await E.newGame(E.expand(Ddeck),E.expand(opp),['A','B'],true); n++; }catch(e){ errs++; console.log('ERR',e.stack.split('\n').slice(0,3).join('|')); continue; }
    const g=E.getG(); if(g.turn>=60) stuckish++;
    for(const l of g.log){ if(/plays (Tundra|Underground Sea|Badlands|Taiga|Savannah|Scrubland|Volcanic Island|Bayou|Plateau|Tropical Island)/.test(l.msg)) ev.dual++; if(/casts .*\bMox\b|plays Mox/.test(l.msg)||/casts Mox/.test(l.msg)) ev.moxen++; if(/casts Basalt Monolith/.test(l.msg)) ev.monolith++; }
  }
  console.log(ev,'games',n,'errors',errs,'long games(>=60 turns)',stuckish);
})();
