const fs=require('fs');
const src=fs.readFileSync(process.env.GAME||require('path').join(__dirname,'..','..','web','index.html'),'utf8');
new Function(src.slice(src.lastIndexOf('<script>')+8,src.lastIndexOf('</script>')))();
const E=globalThis.__engine; const G=()=>E.getG();
(async()=>{
  const o={};
  const dk={plains:10,island:10,swamp:10,mountain:10,forest:10,grizzly_bears:10};
  await E.newGame(E.expand(dk),E.expand(dk),['A','B'],true);
  const g=G(); const reset=()=>{ g.bf.length=0; for(const P of g.players){ P.graveyard=[]; P.hand=[]; P.life=20; P.decked=false; P.pool={W:0,U:0,B:0,R:0,G:0,C:0}; P.actTurn=0; P.exile=[]; } g.stack=[]; g.over=false; };
  const mk=(id,pid=0)=>{ const c=E.mkCard(id,pid); g.cards.set(c.iid,c); E.moveTo(c,'bf'); c.controller=pid; c.sick=false; return c; };
  const inHand=(id,pid=0)=>{ const c=E.mkCard(id,pid); g.cards.set(c.iid,c); c.zone='hand'; g.players[pid].hand.push(c); return c; };
  const inGy=(id,pid=0)=>{ const c=E.mkCard(id,pid); g.cards.set(c.iid,c); c.zone='graveyard'; g.players[pid].graveyard.push(c); return c; };
  const ref=c=>({kind:'card',iid:c.iid});
  const ids=['aisling_leprechaun','clergy_of_the_holy_nimbus','dakkon_blackblade','floral_spuzzem','frankensteins_monster','gabriel_angelfire','giant_slug','goblin_polka_band','halfdane','hells_caretaker','johan','lesser_werewolf','marble_priest','nebuchadnezzar','petra_sphinx','preacher','primordial_ooze','quarum_trench_gnomes','rainbow_knights','rasputin_dreamweaver','rubinia_soulsinger','willow_satyr','scarwood_bandits','sentinel','shelkin_brownie','shimian_night_stalker','stangg','the_wretched','wall_of_caltrops'];
  o.missing=ids.filter(i=>!E.DB[i]);
  try{
  reset(); for(let i=0;i<4;i++) mk('forest',0); const dk1=mk('dakkon_blackblade',0); o.dakkon=[E.pow(dk1),E.tough(dk1)];
  // Stangg
  reset(); const st=mk('stangg',0); await E.D_etb?.(st); 
  }catch(e){ o.err1=String(e.stack).slice(0,300); }
  try{
  reset(); const st=inHand('stangg',0); for(let i=0;i<6;i++) mk('forest',0); mk('mountain',0); mk('mountain',0);
  E.moveTo(st,'bf'); st.controller=0; await st.d.etb({src:st,ctrl:0}); o.stangg=g.bf.filter(c=>c.d.name.startsWith('Stangg')).length; E.moveTo(st,'graveyard'); o.stangg2=g.bf.filter(c=>c.d.name.startsWith('Stangg')).length;
  }catch(e){ o.err2=String(e.stack).slice(0,300); }
  try{
  reset(); const r=mk('rasputin_dreamweaver',0); await r.d.etb({src:r,ctrl:0}); o.ras=[r.cn.dream];
  E.activate(0,r,r.d.abilities[0],[]); o.ras.push(r.cn.dream, g.players[0].pool.C);
  E.activate(0,r,r.d.abilities[1],[]); await E.resolveTop(); o.ras.push(r.cn.dream,r.shield);
  }catch(e){ o.err3=String(e.stack).slice(0,300); }
  try{
  reset(); const hc=mk('hells_caretaker',0); const fod=mk('grizzly_bears',0); const dead=inGy('grizzly_bears',0); g.active=0; g.step='upkeep';
  E.activate(0,hc,hc.d.abilities[0],[ {kind:'sac',iid:fod.iid}, {kind:'gy',iid:dead.iid} ]); await E.resolveTop(); o.hc=[fod.zone,dead.zone];
  }catch(e){ o.err4=String(e.stack).slice(0,300); }
  try{
  reset(); const fm=inHand('frankensteins_monster',0); const gy1=inGy('grizzly_bears',0); const gy2=inGy('grizzly_bears',0);
  const it={kind:'spell',card:fm,ctrl:0,x:2,targets:[],name:'FM'}; fm.zone='stack'; g.stack.push(it); await E.resolveTop(); o.fm=[fm.zone,E.pow(fm),E.tough(fm),g.players[0].exile.length];
  reset(); const fm2=inHand('frankensteins_monster',0); fm2.zone='stack'; g.stack.push({kind:'spell',card:fm2,ctrl:0,x:1,targets:[],name:'FM'}); await E.resolveTop(); o.fm2=fm2.zone;
  }catch(e){ o.err5=String(e.stack).slice(0,400); }
  try{
  reset(); const po=mk('primordial_ooze',0); g.players[0].life=20; await po.d.upkeep({src:po,pid:0}); o.ooze=[po.counters,po.tapped,g.players[0].life];
  }catch(e){ o.err6=String(e.stack).slice(0,300); }
  try{
  reset(); const pr=mk('preacher',0); const v=mk('grizzly_bears',1); E.activate(0,pr,pr.d.abilities[0],[]); await E.resolveTop(); o.preacher=[v.controller,!!pr.holds];
  }catch(e){ o.err7=String(e.stack).slice(0,300); }
  try{
  reset(); const ai=mk('aisling_leprechaun',0); const b=mk('grizzly_bears',1); ai.d.onBlock(ai,b); o.ai=b.colOv; 
  const wc=mk('wall_of_caltrops',0); o.wc=E.hasKw?E.hasKw(wc,'banding'):'?';
  }catch(e){ o.err8=String(e.stack).slice(0,300); }
  console.log(JSON.stringify(o,null,1));
})();
