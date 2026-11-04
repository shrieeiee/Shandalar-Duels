const fs=require('fs');
const src=fs.readFileSync(process.env.GAME||require('path').join(__dirname,'..','..','web','index.html'),'utf8');
new Function(src.slice(src.lastIndexOf('<script>')+8,src.lastIndexOf('</script>')))();
const E=globalThis.__engine; const G=()=>E.getG();
(async()=>{
  const o={};
  const dk={plains:10,island:10,swamp:10,mountain:10,forest:10,grizzly_bears:10};
  await E.newGame(E.expand(dk),E.expand(dk),['A','B'],true);
  const g=G(); const reset=()=>{ g.bf.length=0; for(const P of g.players){ P.graveyard=[]; P.hand=[]; P.life=20; P.actTurn=0; P.pool={W:0,U:0,B:0,R:0,G:0,C:0}; } g.stack=[]; g.over=null; g.cause=null; g.iaPend=[]; };
  const mk=(id,pid=0)=>{ const c=E.mkCard(id,pid); g.cards.set(c.iid,c); E.moveTo(c,'bf'); c.controller=pid; c.sick=false; return c; };
  const wait=()=>new Promise(r=>setTimeout(r,5));
  // Infinite Authority in real combat: host attacks, AI blocks with Hill Giant
  reset(); g.turn=20; g.active=0; g.players[0].ai=true; const host=mk('grizzly_bears',0); g.players[1].life=2; const ia=mk('infinite_authority',0); ia.attachedTo=host.iid; const vic=mk('hill_giant',1); 
  g.step='main1'; const done=E.combat(); for(let i=0;i<60&&!g.over;i++){ await wait(); }
  await Promise.race([done,wait()]);
  o.ia=[vic.zone,g.iaPend.length,host.zone];
  // Caverns of despair attack cap
  reset(); g.turn=22; g.active=0; mk('caverns_of_despair',1); const as=[mk('hill_giant',0),mk('hill_giant',0),mk('hill_giant',0)]; g.step='main1'; await Promise.race([E.combat(),wait()]); await wait(); o.cav=as.filter(a=>a.attackedTurn===22).length;
  console.log(JSON.stringify(o)); process.exit(0);
})().catch(e=>{ console.error('ERR',e); process.exit(1); });
