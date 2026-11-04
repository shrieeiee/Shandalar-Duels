const fs=require('fs');
const src=fs.readFileSync(process.env.GAME||require('path').join(__dirname,'..','..','web','index.html'),'utf8');
new Function(src.slice(src.lastIndexOf('<script>')+8,src.lastIndexOf('</script>')))();
const E=globalThis.__engine;
(async()=>{
  const decks=[...Object.values(E.STARTERS),...E.OPPONENTS.map(o=>o.deck)];
  let snaps=0,bad=0,bytes=0,maxB=0; const issues={};
  const note=k=>{ issues[k]=(issues[k]||0)+1; };
  globalThis.__probe=()=>{
    const g=E.getG(); if(!g||Math.random()>.35) return; snaps++;
    let guest, json;
    try{ json=JSON.parse(JSON.stringify(E.netSerialize(E.netView()))); const sz=JSON.stringify(json).length; bytes+=sz; maxB=Math.max(maxB,sz); guest=E.netBuildGuest(json,'Host','Guest'); }catch(e){ note('build:'+e.message); return; }
    // compare basic facts
    const A=g.players, B=guest.players;
    if(A[1].life!==B[0].life||A[0].life!==B[1].life) note('life');
    if(A[1].hand.length!==B[0].hand.length||A[0].hand.length!==B[1].hand.length) note('handlen');
    if(A[1].library.length!==B[0].library.length) note('liblen');
    if(g.bf.length!==guest.bf.length) note('bflen');
    if(g.stack.length!==guest.stack.length) note('stacklen');
    if(guest.active!==1-g.active) note('active');
    if(guest.turn!==g.turn||guest.step!==g.step) note('turn/step');
    for(const c of g.bf){ const d=guest.cards.get(c.iid); if(!d){ note('missingcard'); continue; } if(d.controller!==1-c.controller||d.owner!==1-c.owner) note('ctrl'); if(d.tapped!==c.tapped||d.damage!==c.damage||d.counters!==c.counters) note('state'); if(d.d!==c.d&&!(d.d.name===c.d.name&&d.d.abilities===c.d.abilities)){ note('def'); (globalThis.__defs=globalThis.__defs||new Set()).add(c.d.name+'|'+c.d.id+'|'+c.id+'|'+Object.keys(c.d).length+'|'+(c.d===E.DB[c.id])); } if((c.attachedTo?c.attachedTo.iid:null)!==(d.attachedTo?d.attachedTo.iid:null)) note('attach'); }
    // legal actions for seat 1 on host == seat 0 on guest
    const orig=g;
    const hostActs=A[1].hand.map(c=>[c.iid,(()=>{ try{ return !!E.castableNow(1,c);}catch(e){return 'E';} })()]);
    E.setG(guest);
    const gAct=B[0].hand.map(c=>[c.iid,(()=>{ try{ return !!E.castableNow(0,c);}catch(e){return 'E';} })()]);
    const abH=[]; for(const c of guest.bf) if(c.controller===0) for(const ab of c.d.abilities||[]) abH.push([c.iid,!!E.abilityUsable(0,c,ab)]);
    E.setG(orig);
    const abO=[]; for(const c of g.bf) if(c.controller===1) for(const ab of c.d.abilities||[]) abO.push([c.iid,!!E.abilityUsable(1,c,ab)]);
    if(JSON.stringify(hostActs)!==JSON.stringify(gAct)) note('castable');
    if(JSON.stringify(abO)!==JSON.stringify(abH)) note('abilityUsable');
  };
  let n=0;
  for(const [i,dk] of decks.entries()) for(let r=0;r<3;r++){ const opp=decks[(i+r+3)%decks.length]; await E.newGame(E.expand(dk),E.expand(opp),['A','B'],true); n++; }
  console.log('games',n,'snaps',snaps,'avgKB',(bytes/snaps/1024).toFixed(1),'maxKB',(maxB/1024).toFixed(1),'fnDropped',E.NET.fn,'issues',issues,[...globalThis.__defs||[]]);
})();
