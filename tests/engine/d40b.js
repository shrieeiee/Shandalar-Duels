const fs=require('fs');
const src=fs.readFileSync(process.env.GAME||require('path').join(__dirname,'..','..','web','index.html'),'utf8');
new Function(src.slice(src.lastIndexOf('<script>')+8,src.lastIndexOf('</script>')))();
const E=globalThis.__engine; const G=()=>E.getG();
(async()=>{
  const o={};
  const dk={plains:10,island:10,swamp:10,mountain:10,forest:10,grizzly_bears:10};
  await E.newGame(E.expand(dk),E.expand(dk),['A','B'],true);
  const g=G(); const reset=()=>{ g.bf.length=0; for(const P of g.players){ P.graveyard=[]; P.hand=[]; P.life=20; P.decked=false; P.lichLost=false; P.poison=0; P.pool={W:0,U:0,B:0,R:0,G:0,C:0}; } g.stack=[]; g.over=null; g.cause=null; };
  reset();
  const mk=(id,pid=0)=>{ const c=E.mkCard(id,pid); g.cards.set(c.iid,c); E.moveTo(c,'bf'); c.controller=pid; c.sick=false; return c; };
  const ref=c=>({kind:'card',iid:c.iid});
  const dmg=(s,t,n)=>E.dealDamage(s,t,n,false);
  const att=(id,host,pid=0)=>{ const a=mk(id,pid); a.attachedTo=host.iid; return a; };
  // Spectral Cloak / Anti-Magic
  reset(); let h=mk('grizzly_bears',1); const bolt=E.mkCard('lightning_bolt',0); g.cards.set(bolt.iid,bolt); bolt.zone='hand'; att('spectral_cloak',h,1); o.cloak=[E.legal(E.TG.creature,ref(h),bolt)]; h.tapped=true; o.cloak.push(E.legal(E.TG.creature,ref(h),bolt));
  reset(); h=mk('grizzly_bears',1); att('anti_magic_aura',h,1); const aur=E.mkCard('lance',0); aur.zone='hand'; o.am=[E.legal(E.TG.creature,ref(h),bolt),E.legal(E.TG.creature,ref(h),aur),E.legal(E.TG.creature,ref(h),mk('prodigal_sorcerer',0))];
  // Tangle Kelp noUntapIf & venarian
  reset(); h=mk('grizzly_bears',1); const tk=att('tangle_kelp',h,0); h.attackedTurn=g.turn-2; o.kelp=tk.d.aura.noUntapIf(tk,h); h.attackedTurn=0; o.kelp2=tk.d.aura.noUntapIf(tk,h);
  const vg=att('venarian_gold',h,0); vg.d.etb({src:vg,ctrl:0,x:2}); o.vg=[h.tapped,h.sleep,vg.d.aura.noUntapIf(vg,h)]; vg.d.upkeep({src:vg,pid:1}); vg.d.upkeep({src:vg,pid:1}); o.vg2=[h.sleep,vg.d.aura.noUntapIf(vg,h)];
  // Cocoon
  reset(); h=mk('grizzly_bears',0); const co=att('cocoon',h,0); co.d.etb({src:co,ctrl:0}); for(let i=0;i<4;i++) co.d.upkeep({src:co,pid:0}); o.cocoon=[co.zone,h.counters,E.hasKw(h,'flying')];
  // Takklemaggot
  reset(); h=mk('grizzly_bears',1); const tm=att('takklemaggot',h,0); tm.d.upkeep({src:tm,pid:1}); o.tak1=E.tough(h); const other=mk('hill_giant',0); E.destroy(h); E.sba(); await E.legendResolve(); o.tak2=[tm.zone,tm.attachedTo===other.iid];
  reset(); h=mk('grizzly_bears',1); const tm2=att('takklemaggot',h,0); E.destroy(h); E.sba(); await E.legendResolve(); o.tak3=[tm2.zone,tm2.takk,tm2.d.type];
  // Curse artifact
  reset(); const ic=mk('icy_manipulator',0); const ca=att('curse_artifact',ic,1); g.players[0].life=20; await ca.d.upkeep({src:ca,pid:0}); o.curse=[g.players[0].life,ic.zone];
  // Power artifact
  reset(); const ic2=mk('icy_manipulator',0); const ab=ic2.d.abilities[0]; o.pa0=JSON.stringify(E.abCost?E.abCost(ic2,ab):null); att('power_artifact',ic2,0); o.pa1=JSON.stringify(E.abCost?E.abCost(ic2,ab):null);
  // Goblin caves
  reset(); const gl=mk('mountain',0), gc=att('goblin_caves',gl,0); const gob=mk('mons_goblin_raiders',0); o.caves=[E.tough(gob)]; gl.d=E.DB.forest; o.caves2=E.tough(gob);
  // Nether void
  reset(); const nv=mk('nether_void',1); const sp=E.mkCard('lightning_bolt',0); g.cards.set(sp.iid,sp); sp.zone='stack'; g.stack.push({sid:777,kind:'spell',card:sp,ctrl:0,targets:[],x:0,name:'Lightning Bolt'}); await nv.d.onCast(sp,0,nv)(); o.nv=[g.stack.length,sp.zone];
  // Presence
  reset(); const pm=mk('presence_of_the_master',1); const en=E.mkCard('fear',0); g.cards.set(en.iid,en); en.zone='stack'; g.stack.push({sid:778,kind:'spell',card:en,ctrl:0,targets:[],x:0,name:'Fear'}); await pm.d.onCast(en,0,pm)(); o.pres=[g.stack.length,en.zone];
  // Mana vortex
  reset(); for(let i=0;i<3;i++) mk('forest',0); const mv=mk('mana_vortex',0); const mvc=E.mkCard('mana_vortex',0); g.cards.set(mvc.iid,mvc); mvc.zone='stack'; g.stack.push({sid:880,kind:'spell',card:mvc,ctrl:0,targets:[],x:0,name:'Mana Vortex'}); await mvc.d.onCastSelf(mvc,0)(); o.mv=[g.bf.filter(c=>c.d.id==='forest').length,g.stack.length]; await mv.d.upkeep({src:mv,pid:1}); o.mv2=g.bf.filter(c=>c.d.id==='forest').length;
  // Puppet master
  reset(); h=mk('grizzly_bears',1); const pmm=att('puppet_master',h,0); E.destroy(h); E.sba(); await new Promise(r=>setTimeout(r,20)); o.pup=[h.zone,pmm.zone];
  // Psychic allergy
  reset(); const pa=mk('psychic_allergy',0); mk('mountain',1); mk('grizzly_bears',1); await pa.d.etb({src:pa,ctrl:0}); g.players[1].life=20; await pa.d.upkeep({src:pa,pid:1}); o.allergy=[pa.colChoice,g.players[1].life];
  // Necropolis
  reset(); const nec=mk('necropolis_of_azar',0); const v=mk('grizzly_bears',1); E.destroy(v); o.nec=nec.counters; nec.d.abilities[0].resolve({src:nec,ctrl:0}); o.spawn=[nec.counters,g.bf.filter(c=>c.d.id==='spawn_of_azar').length];
  // Gaea's Touch
  reset(); const gt=mk('gaeas_touch',0); const fc=E.mkCard('forest',0); g.cards.set(fc.iid,fc); fc.zone='hand'; g.players[0].hand.push(fc); gt.d.abilities[0].resolve({src:gt,ctrl:0}); o.gt=fc.zone;
  // noPrev
  reset(); const wp=mk('whippoorwill',0), tgt=mk('grizzly_bears',1); await wp.d.abilities[0].resolve({src:wp,ctrl:0,targets:[ref(tgt)]}); tgt.shield=5; const sh=E.mkCard('lightning_bolt',0); g.cards.set(sh.iid,sh); sh.zone='stack'; E.dealDamage(sh,ref(tgt),2); o.noprev=[tgt.damage,tgt.shield];
  // Effigy X
  reset(); const e1=mk('blazing_effigy',0), e2=mk('blazing_effigy',0), vic2=mk('hill_giant',1); E.dealDamage(e2,ref(e1),2); E.dealDamage(vic2,ref(e1),1); o.eff=e1.dmgFrom?Object.values(e1.dmgFrom):null; E.sba(); await new Promise(r=>setTimeout(r,20)); o.effD=[e1.zone,vic2.damage];
  // Bronze horse targeted
  reset(); const bh=mk('bronze_horse',0); mk('grizzly_bears',0); const sp2=E.mkCard('lightning_bolt',1); g.cards.set(sp2.iid,sp2); sp2.zone='stack'; g.curIt={kind:'spell',card:sp2,targets:[ref(bh)]}; E.dealDamage(sp2,ref(bh),3); o.bhT=bh.damage; g.curIt={kind:'spell',card:sp2,targets:[]}; E.dealDamage(sp2,ref(bh),3); o.bhN=bh.damage; g.curIt=null;
  // Wolves banding: two wolves block one attacker -> bs rule
  reset(); const wv1=mk('master_of_the_hunt',0); await wv1.d.abilities[0].resolve({src:wv1,ctrl:0,targets:[]}); await wv1.d.abilities[0].resolve({src:wv1,ctrl:0,targets:[]}); o.wolves=g.bf.filter(c=>c.d.bandsWith).length;
  console.log(JSON.stringify(o));
})();
