const fs=require('fs');
const src=fs.readFileSync(process.env.GAME||require('path').join(__dirname,'..','..','web','index.html'),'utf8');
new Function(src.slice(src.lastIndexOf('<script>')+8,src.lastIndexOf('</script>')))();
const E=globalThis.__engine; const G=()=>E.getG();
(async()=>{
  const dk={plains:10,island:10,swamp:10,mountain:10,forest:10,grizzly_bears:10};
  await E.newGame(E.expand(dk),E.expand(dk),['A','B'],true);
  const g=G(); g.over=null; const L0=g.log.length; g.bf.length=0; g.stack=[]; g.turn=20; g.active=0; g.over=null; for(const P of g.players){ P.life=20; P.decked=false; P.hand=[]; P.graveyard=[]; }
  const mk=(id,pid)=>{ const c=E.mkCard(id,pid); g.cards.set(c.iid,c); E.moveTo(c,'bf'); c.controller=pid; c.sick=false; return c; };
  const host=mk('grizzly_bears',0); const ia=mk('infinite_authority',0); ia.attachedTo=host.iid; const vic=mk('hill_giant',1); g.players[1].life=2; host.forceAtk=g.turn;
  console.log('canAtk',E.canAttack(host,0), 'step',g.step, 'logLen',g.log.length);
  g.step='main1'; try{ await E.combat(); }catch(e){ console.log('threw',e.constructor.name,e.message); }
  console.log(g.log.slice(L0).map(l=>l.msg).join('\n')); console.log(vic.zone,g.iaPend);
  process.exit(0);
})();
