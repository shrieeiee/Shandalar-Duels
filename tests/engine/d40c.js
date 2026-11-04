const fs=require('fs');
const src=fs.readFileSync(process.env.GAME||require('path').join(__dirname,'..','..','web','index.html'),'utf8');
new Function(src.slice(src.lastIndexOf('<script>')+8,src.lastIndexOf('</script>')))();
const E=globalThis.__engine; const G=()=>E.getG();
(async()=>{
  const o={};
  const dk={plains:10,island:10,swamp:10,mountain:10,forest:10,grizzly_bears:10};
  await E.newGame(E.expand(dk),E.expand(dk),['A','B'],true);
  const g=G(); const reset=()=>{ g.bf.length=0; for(const P of g.players){ P.graveyard=[]; P.hand=[]; P.life=20; P.decked=false; P.pool={W:0,U:0,B:0,R:0,G:0,C:0}; P.actTurn=0; P.deepW=0; } g.stack=[]; g.over=null; g.cause=null; g.landsPlayed=0; g.chainsFree=null; };
  reset();
  const mk=(id,pid=0)=>{ const c=E.mkCard(id,pid); g.cards.set(c.iid,c); E.moveTo(c,'bf'); c.controller=pid; c.sick=false; return c; };
  const inHand=(id,pid=0)=>{ const c=E.mkCard(id,pid); g.cards.set(c.iid,c); c.zone='hand'; g.players[pid].hand.push(c); return c; };
  const ref=c=>({kind:'card',iid:c.iid});
  // Arboria
  reset(); g.turn=10; g.active=0; mk('arboria',1); const bear=mk('grizzly_bears',0);
  o.arb=[E.canAttack(bear,0)]; g.players[1].actTurn=9; o.arb.push(E.canAttack(bear,0)); g.players[1].actTurn=10; o.arb.push(E.canAttack(bear,0));
  // Worms
  reset(); g.step='main1'; g.active=0; const wl=inHand('forest',0); const w=mk('worms_of_the_earth',1); o.wormsT=E.timingOK(0,wl); E.moveTo(wl,'bf'); o.wormsEnter=wl.zone; w.zone='graveyard'; g.bf.splice(g.bf.indexOf(w),1); o.wormsOff=E.timingOK(0,wl);
  // Land Equilibrium
  reset(); g.step='main1'; g.active=0; for(let i=0;i<2;i++) mk('forest',1); mk('land_equilibrium',1); for(let i=0;i<2;i++) mk('forest',0); const nl=inHand('forest',0); E.playLand(0,nl);
  o.leStack=g.stack.length; await E.resolveTop(); o.leLands=g.bf.filter(l=>E.isLand(l)&&l.controller===0).length;
  reset(); for(let i=0;i<3;i++) mk('forest',1); mk('land_equilibrium',1); mk('forest',0); const nl2=inHand('forest',0); E.playLand(0,nl2); o.leNo=g.stack.length;
  // Living Plane
  reset(); const f=mk('forest',0); mk('living_plane',1); o.lp=[E.isCreature(f),E.pow(f),E.tough(f)]; f.sick=true; o.lpMana=E.manaSources(0).length; f.sick=false; o.lpMana2=E.manaSources(0).length;
  // Chains
  reset(); mk('chains_of_mephistopheles',1); const P0=g.players[0]; P0.library=[]; for(let i=0;i<6;i++){ const c=E.mkCard('island',0); g.cards.set(c.iid,c); c.zone='library'; P0.library.push(c); }
  P0.hand=[]; const h1=inHand('grizzly_bears',0); g.chainsFree=0; E.drawCards(0,1); o.ch1=[P0.hand.length,P0.library.length,g.chainsFree]; E.drawCards(0,1); o.ch2=[P0.hand.length,P0.graveyard.length,P0.library.length];
  P0.hand=[]; E.drawCards(0,1); o.ch3=[P0.hand.length,P0.graveyard.length,P0.library.length];
  // Caverns - AI block cap
  reset(); mk('caverns_of_despair',1); g.turn=11; g.active=1; const at=[mk('grizzly_bears',1),mk('grizzly_bears',1),mk('grizzly_bears',1)]; const bl=[mk('grizzly_bears',0),mk('grizzly_bears',0),mk('grizzly_bears',0)]; for(const a of at){ a.attacking=true; } 
  // Imprison via activate
  reset(); g.step='main1'; g.active=0; g.turn=12; const pr=mk('prodigal_sorcerer',1); const imp=mk('imprison',0); imp.attachedTo=pr.iid; for(let i=0;i<3;i++) mk('swamp',0);
  g.active=1; E.activate(1,pr,pr.d.abilities[0],[{kind:'player',pid:0}]); o.impStack=g.stack.map(s=>s.name);
  await E.resolveTop(); o.impAfter=[g.stack.length,imp.zone,g.players[0].life];
  reset(); g.turn=13; const pr2=mk('prodigal_sorcerer',1); const imp2=mk('imprison',0); imp2.attachedTo=pr2.iid; E.activate(1,pr2,pr2.d.abilities[0],[{kind:'player',pid:0}]); await E.resolveTop(); o.impNo=[imp2.zone,g.stack.length,g.players[0].life];
  // Imprison attack
  reset(); g.turn=14; const at2=mk('grizzly_bears',1); const imp3=mk('imprison',0); imp3.attachedTo=at2.iid; at2.attacking=true; at2.tapped=true; for(let i=0;i<2;i++) mk('swamp',0); await E.imprisonCombat(imp3,at2,null); o.impAtk=[at2.attacking,at2.tapped,imp3.zone];
  // Deep Water
  reset(); const fo=mk('forest',0); mk('mountain',0); mk('deep_water',0); const dw=g.bf.find(c=>c.d.id==='deep_water'); dw.d.abilities[0].resolve({src:dw,ctrl:0}); o.dw=E.manaSources(0).map(s=>s.prod);
  // Land's Edge
  reset(); const le=mk('lands_edge',1); const ab=le.d.abilities[0]; const lh=inHand('forest',0), nh=inHand('grizzly_bears',0); o.leUsable=E.abilityUsable(0,le,ab);
  o.leAct=E.activate(0,le,ab,[{kind:'player',pid:1},{kind:'hand',iid:lh.iid}]); await E.resolveTop(); o.leDmg=[g.players[1].life,lh.zone];
  E.activate(0,le,ab,[{kind:'player',pid:1},{kind:'hand',iid:nh.iid}]); await E.resolveTop(); o.leNon=[g.players[1].life,nh.zone];
  o.leNoDisc=E.activate(0,le,ab,[{kind:'player',pid:1}]);
  // Ifh anyPlayer
  reset(); const ifh=mk('ifh_biff_efreet',1); mk('forest',0); o.ifh=[E.abilityUsable(0,ifh,ifh.d.abilities[0]),!!ifh.d.abilities[0].anyPlayer];
  // Divine Intervention
  reset(); const di=mk('divine_intervention',0); di.d.etb({src:di,ctrl:0}); di.d.upkeep({src:di,pid:0}); o.di1=[di.counters,!!g.over]; try{ di.d.upkeep({src:di,pid:0}); }catch(e){ o.diThrown=e.constructor.name; } o.di2=[g.over&&g.over.winner];
  // Dance of Many
  reset(); const ogre=mk('hill_giant',1); const dm=mk('dance_of_many',0); await dm.d.etb({src:dm,ctrl:0}); const tok=g.bf.find(c=>c.copy); o.dance=[!!tok,tok&&tok.d.name,dm.danceTok===(tok&&tok.iid)];
  E.moveTo(tok,'exile'); o.danceTokGone=[dm.zone]; await E.legendResolve();
  reset(); const og2=mk('hill_giant',1); const dm2=mk('dance_of_many',0); await dm2.d.etb({src:dm2,ctrl:0}); const tk2=g.bf.find(c=>c.copy); E.moveTo(dm2,'graveyard'); o.danceLeave=[tk2.zone,dm2.zone];
  // Power Struggle
  reset(); const ps=mk('power_struggle',1); const mine=mk('grizzly_bears',0), theirs=mk('hill_giant',1); ps.d.upkeep({src:ps,pid:0}); o.psw=[mine.controller,theirs.controller,mine.sick];
  // Infinite Authority
  reset(); g.turn=20; const host=mk('grizzly_bears',0); const ia=mk('infinite_authority',0); ia.attachedTo=host.iid; const vic=mk('hill_giant',1); o.iaTough=E.tough(vic);
  console.log(JSON.stringify(o));
  process.exit(0);
})().catch(e=>{ console.error('ERR',e); process.exit(1); });
