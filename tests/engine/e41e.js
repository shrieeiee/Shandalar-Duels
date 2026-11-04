const fs=require('fs');
const src=fs.readFileSync(process.env.GAME||require('path').join(__dirname,'..','..','web','index.html'),'utf8');
new Function(src.slice(src.lastIndexOf('<script>')+8,src.lastIndexOf('</script>')))();
const E=globalThis.__engine; const G=()=>E.getG();
(async()=>{ const o={};
  const dk={plains:10,island:10,swamp:10,mountain:10,forest:10,grizzly_bears:10};
  await E.newGame(E.expand(dk),E.expand(dk),['A','B'],true); const g=G();
  const reset=()=>{ g.bf.length=0; for(const P of g.players){ P.graveyard=[]; P.hand=[]; P.exile=[]; P.life=20; P.pool={W:0,U:0,B:0,R:0,G:0,C:0}; P.rpool=null; } g.stack=[]; g.over=false; g.dmgFx=[]; g.step='main1'; g.active=0; };
  const mk=(id,pid=0)=>{ const c=E.mkCard(id,pid); g.cards.set(c.iid,c); E.moveTo(c,'bf'); c.controller=pid; c.sick=false; return c; };
  const inHand=(id,pid=0)=>{ const c=E.mkCard(id,pid); g.cards.set(c.iid,c); c.zone='hand'; g.players[pid].hand.push(c); return c; };
  reset(); g.players[0].pool={W:0,U:0,B:0,R:0,G:8,C:0}; const m=mk('illusionary_mask',0); const k=inHand('craw_wurm',0);
  g.lastPaid={}; const ok=E.activate(0,m,m.d.abilities[0],[],6); while(g.stack.length) await E.resolveTop();
  o.mask=[ok,k.zone,k.faceDown,k.faceDown&&[E.pow(k),E.tough(k),k.d.name]];
  // face-down tap flips
  k.tapped=true; E.sba(); o.maskTap=[k.faceDown,k.d.name];
  reset(); const a=mk('wall_of_caltrops',0), b=mk('wall_of_stone',0); const at=mk('grizzly_bears',1); at.attacking=true; a.blocking=at.iid; b.blocking=at.iid; at.blockedBy=[a.iid,b.iid]; o.caltrops=[E.hasKw(a,'banding')];
  console.log(JSON.stringify(o));
})();
