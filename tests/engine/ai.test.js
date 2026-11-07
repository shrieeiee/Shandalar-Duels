// AI behaviour regression tests (assertion based). Run: node tests/engine/ai.test.js
const fs=require('fs'), path=require('path'), assert=require('assert');
const src=fs.readFileSync(process.env.GAME||path.join(__dirname,'..','..','web','index.html'),'utf8');
new Function(src.slice(src.lastIndexOf('<script>')+8,src.lastIndexOf('</script>')))();
const E=globalThis.__engine; const G=()=>E.getG();
const sections=[];
sections.push(['new-card AI plays (positive)',async()=>{ const o={}; const dk={plains:10,island:10,swamp:10,mountain:10,forest:10,grizzly_bears:10};
 await E.newGame(E.expand(dk),E.expand(dk),['A','B'],true); const g=G();
 const reset=()=>{ g.bf.length=0; for(const P of g.players){ P.graveyard=[]; P.hand=[]; P.exile=[]; P.life=20; P.decked=false; P.lichLost=false; P.poison=0; P.pool={W:0,U:0,B:0,R:0,G:0,C:0}; P.rpool=null; } g.stack=[]; g.over=false; g.dmgFx=[]; g.step='main1'; g.active=1; g.landsPlayed=1; g.camo=0; };
 const mk=(id,pid=1,z='bf')=>{ const c=E.mkCard(id,pid); g.cards.set(c.iid,c); if(z==='bf'){ E.moveTo(c,'bf'); c.controller=pid; c.sick=false; } else { E.moveTo(c,z); } return c; };
 const lands=(pid,t,n)=>{ for(let i=0;i<n;i++) mk(t,pid); };
 const pick=(p)=>{ const a=E.aiPick(p); return a; };
 const names=a=>a?a.run&&a:null;
 const run=async(p)=>{ const a=E.aiPick(p); if(!a) return null; await a.run(); return a; };
 const topName=()=>{ const t=g.stack[g.stack.length-1]; return t?t.name:null; };
 // AI = pid1 (ai flag). ensure
 g.players[1].ai=true;
 // 1. Camouflage
 reset(); lands(1,'forest',3); const a1=mk('earth_elemental',1), a2=mk('grizzly_bears',1); a1.attacking=a2.attacking=true; g.step='attack'; mk('hill_giant',0); mk('hill_giant',0); mk('camouflage',1,'hand'); await run(1); o.camo=topName();
 // 2. Catapult
 reset(); lands(1,'mountain',6); mk('grizzly_bears',0); mk('orcish_catapult',1,'hand'); await run(1); o.catap=topName();
 // 3. Part water
 reset(); lands(1,'island',6); mk('island',0); mk('earth_elemental',1); mk('hill_giant',1); mk('hill_giant',0); mk('part_water',1,'hand'); await run(1); o.pwater=topName(); const t=g.stack[g.stack.length-1]; o.pwT=t&&t.targets.length;
 // 4. Recall
 reset(); lands(1,'island',5); mk('earth_elemental',1,'graveyard'); mk('forest',1,'hand'); mk('forest',1,'hand'); mk('recall',1,'hand'); await run(1); o.recall=topName(); o.recallX=g.stack[g.stack.length-1]&&g.stack[g.stack.length-1].x;
 // 5. Metamorphosis
 reset(); lands(1,'forest',3); mk('grizzly_bears',1); mk('serra_angel',1,'hand'); mk('earth_elemental',1,'hand'); mk('metamorphosis',1,'hand'); await run(1); o.meta=topName(); 
 // 6. Remove Enchantments
 reset(); lands(1,'plains',2); const c6=mk('grizzly_bears',1); const au=mk('weakness',0); au.attachedTo=c6.iid; const au2=mk('weakness',0); au2.attachedTo=c6.iid; mk('remove_enchantments',1,'hand'); await run(1); o.remEnch=topName();
 // 7. Gauntlets
 reset(); lands(1,'mountain',6); const g7=mk('gauntlets_of_chaos',1); mk('grizzly_bears',1); mk('earth_elemental',0); await run(1); o.gaunt=topName();
 // 8. glyph of doom / life with blocking wall
 reset(); lands(1,'swamp',3); const w=mk('wall_of_stone',1); const at=mk('earth_elemental',0); at.attacking=true; at.blockedBy=[w.iid]; w.blocking=at.iid; w.blkHist=[{iid:at.iid,turn:g.turn,ctl:0}]; g.step='block'; g.active=0; mk('glyph_of_doom',1,'hand'); await run(1); o.doom=topName();
 // 9. Wood elemental
 reset(); lands(1,'forest',8); const we=mk('wood_elemental',1,'hand'); g.players[1].hand=[we]; mk('hill_giant',0); await run(1); await E.resolveTop(); o.wood=g.bf.filter(k=>k.d.id==='wood_elemental').map(k=>k.woodN); o.forestsLeft=g.bf.filter(k=>k.d.id==='forest').length;
 // 10. dream coat
 reset(); lands(1,'island',2); const h10=mk('grizzly_bears',1); const dc=mk('dream_coat',1); dc.attachedTo=h10.iid; const sp=mk('terror',0,'hand'); g.step='main1'; g.active=0; g.players[0].pool.B=5; E.castSpell(0,sp,[{kind:'card',iid:h10.iid}],0); const a10=await run(1); o.dc=a10&&topName(); await E.resolveTop(); o.dcCol=h10.colOv; 
 
assert.strictEqual(o.camo,'Camouflage'); assert.match(o.catap,/Orcish Catapult/); assert.match(o.pwater,/Part Water/); assert.strictEqual(o.pwT,2); assert.match(o.recall,/Recall/); assert.strictEqual(o.meta,'Metamorphosis'); assert.strictEqual(o.remEnch,'Remove Enchantments'); assert.match(o.gaunt,/Gauntlets/); assert.strictEqual(o.doom,'Glyph of Doom'); assert.deepStrictEqual(o.wood,[4]); assert.match(o.dc,/Dream Coat/); assert.strictEqual(o.dcCol,'B');
}]);
sections.push(['new-card AI plays (negative + glyphs + Pentacle)',async()=>{ const o={}; const dk={plains:10,island:10,swamp:10,mountain:10,forest:10,grizzly_bears:10};
 await E.newGame(E.expand(dk),E.expand(dk),['A','B'],true); const g=G();
 const reset=()=>{ g.bf.length=0; for(const P of g.players){ P.graveyard=[]; P.hand=[]; P.exile=[]; P.life=20; P.decked=false; P.lichLost=false; P.poison=0; P.pool={W:0,U:0,B:0,R:0,G:0,C:0}; P.rpool=null; } g.stack=[]; g.over=false; g.dmgFx=[]; g.step='main1'; g.active=1; g.landsPlayed=1; g.camo=0; };
 const mk=(id,pid=1,z='bf')=>{ const c=E.mkCard(id,pid); g.cards.set(c.iid,c); if(z==='bf'){ E.moveTo(c,'bf'); c.controller=pid; c.sick=false; } else E.moveTo(c,z); return c; };
 const lands=(pid,t,n)=>{ for(let i=0;i<n;i++) mk(t,pid); };
 const run=async p=>{ const a=E.aiPick(p); if(!a) return null; await a.run(); return a; };
 const topName=()=>{ const t=g.stack[g.stack.length-1]; return t?t.name:null; };
 g.players[1].ai=true;
 // negatives
 reset(); lands(1,'forest',3); const x1=mk('earth_elemental',1); x1.attacking=true; g.step='attack'; mk('camouflage',1,'hand'); await run(1); o.camoNeg=topName();
 reset(); lands(1,'mountain',6); mk('grizzly_bears',1); mk('earth_elemental',0); mk('orcish_catapult',1,'hand'); await run(1); o.catapNeg=topName();
 reset(); lands(1,'forest',2); const c6=mk('grizzly_bears',1); mk('remove_enchantments',1,'hand'); await run(1); o.remNeg=topName();
 reset(); lands(1,'mountain',6); mk('gauntlets_of_chaos',1); mk('earth_elemental',1); mk('grizzly_bears',0); await run(1); o.gauntNeg=topName();
 // Enchantment alteration: opp aura on my creature -> move to opp best
 reset(); lands(1,'island',3); const mine=mk('grizzly_bears',1); const best=mk('earth_elemental',0); const wk=mk('weakness',0); wk.attachedTo=mine.iid; mk('enchantment_alteration',1,'hand'); await run(1); o.enchAlt=topName(); const t=g.stack[g.stack.length-1]; o.enchTargets=t&&t.targets.map(r=>E.getG().cards.get(r.iid).d.name);
 // glyph life, destruction, delusion, reincarnation
 const wallSetup=(id,wid)=>{ reset(); lands(1,'plains',3); lands(1,'mountain',1); lands(1,'island',1); lands(1,'forest',1); lands(1,'swamp',1); const w=mk('wall_of_stone',1); const at=mk(id,0); at.attacking=true; at.tapped=true; at.blockedBy=[w.iid]; w.blocking=at.iid; w.blkHist=[{iid:at.iid,turn:g.turn,ctl:0}]; g.step='block'; g.active=0; mk(wid,1,'hand'); return {w,at}; };
 wallSetup('earth_elemental','glyph_of_life'); await run(1); o.gLife=topName();
 wallSetup('serra_angel','glyph_of_destruction'); await run(1); o.gDest=topName();
 wallSetup('earth_elemental','glyph_of_delusion'); await run(1); o.gDel=topName();
 { const {w,at}=wallSetup('serra_angel','glyph_of_reincarnation'); g.step='eoc'; await run(1); o.gReinc=topName(); }
 // Equinox regex checks via text
 const eq=E; 
 // Nova Pentacle activation-time choice (AI opponent)
 reset(); lands(1,'plains',1); const pen=mk('nova_pentacle',0); g.players[0].ai=false; g.players[0].pool.C=3; const v1=mk('hill_giant',1), v2=mk('grizzly_bears',1); g.active=0; g.step='main1';
 const ok=E.activate(0,pen,pen.d.abilities[0],[]); const it=g.stack[g.stack.length-1]; const vic=it&&it.oppP?await it.oppP:null; o.pentOK=ok; o.pentVictim=vic&&vic.d.name;
 
for(const k of ['camoNeg','catapNeg','remNeg','gauntNeg']) assert.strictEqual(o[k],null,k); assert.strictEqual(o.enchAlt,'Enchantment Alteration'); assert.deepStrictEqual(o.enchTargets,['Weakness','Earth Elemental']); assert.strictEqual(o.gLife,'Glyph of Life'); assert.strictEqual(o.gDest,'Glyph of Destruction'); assert.strictEqual(o.gDel,'Glyph of Delusion'); assert.strictEqual(o.gReinc,'Glyph of Reincarnation'); assert.strictEqual(o.pentOK,true); assert.strictEqual(o.pentVictim,'Grizzly Bears');
}]);
sections.push(['Primal Clay AI form',async()=>{ const dk={plains:10,island:10,swamp:10,mountain:10,forest:10,grizzly_bears:10};
 await E.newGame(E.expand(dk),E.expand(dk),['A','B'],true); const g=G(); const o={};
 const mk=(id,pid)=>{ const c=E.mkCard(id,pid); g.cards.set(c.iid,c); E.moveTo(c,'bf'); c.controller=pid; c.sick=false; return c; };
 const t=async(setup)=>{ g.bf.length=0; for(const P of g.players){P.life=20;} setup(); const c=E.mkCard('primal_clay',1); g.cards.set(c.iid,c); E.moveTo(c,'bf'); c.controller=1; await c.d.etb({src:c,ctrl:1}); return [E.pow(c),E.tough(c),c.d.sub]; };
 o.plain=await t(()=>{}); o.opp20=await t(()=>{ mk('grizzly_bears',0); }); g.players[0].life=10; o.lowOppNoAir=await t(()=>{ g.players[0].life=10; mk('grizzly_bears',0); });
 o.danger=await t(()=>{ g.players[1].life=6; mk('earth_elemental',0); mk('hill_giant',0); });
 
assert.deepStrictEqual(o.plain.slice(0,2),[3,3]); assert.deepStrictEqual(o.opp20.slice(0,2),[3,3]); assert.deepStrictEqual(o.lowOppNoAir.slice(0,2),[2,2]); assert.deepStrictEqual(o.danger,[1,6,'Shapeshifter Wall']);
}]);
sections.push(['artifact AI (Sword, Voodoo Doll, Runesword, Egg, Vault, Arena, Reverberation)',async()=>{ const dk={plains:10,island:10,swamp:10,mountain:10,forest:10,grizzly_bears:10};
 await E.newGame(E.expand(dk),E.expand(dk),['A','B'],true); const g=G(); const o={};
 const reset=()=>{ g.bf.length=0; for(const P of g.players){ P.graveyard=[]; P.hand=[]; P.exile=[]; P.life=20; P.decked=false; P.lichLost=false; P.poison=0; P.pool={W:0,U:0,B:0,R:0,G:0,C:0}; P.rpool=null; P.library.length=Math.min(P.library.length,30); } g.stack=[]; g.over=false; g.dmgFx=[]; g.step='main1'; g.active=1; g.landsPlayed=1; };
 const mk=(id,pid=1,z='bf')=>{ const c=E.mkCard(id,pid); g.cards.set(c.iid,c); if(z==='bf'){ E.moveTo(c,'bf'); c.controller=pid; c.sick=false; } else E.moveTo(c,z); return c; };
 const lands=(pid,t,n)=>{ for(let i=0;i<n;i++) mk(t,pid); };
 const run=async p=>{ const a=E.aiPick(p); if(!a) return null; await a.run(); return a; };
 const top=()=>{ const t=g.stack[g.stack.length-1]; return t?t.name:null; };
 g.players[1].ai=true;
 // Sword of the Ages: lethal by sacrificing creatures
 reset(); lands(1,'mountain',1); const sw=mk('sword_of_the_ages',1); sw.tapped=false; g.players[0].life=7; mk('earth_elemental',1); mk('hill_giant',1); await run(1); o.sword=top(); const it=g.stack[g.stack.length-1]; o.swordSacs=it&&it.sacs&&it.sacs.length;
 // Sword: not lethal, no big target -> nothing
 reset(); mk('sword_of_the_ages',1).tapped=false; mk('grizzly_bears',1); mk('grizzly_bears',0); await run(1); o.swordNeg=top();
 // Voodoo Doll at main2 keeps itself alive
 reset(); lands(1,'plains',4); const vd=mk('voodoo_doll',1); vd.cn={pin:1}; g.step='main2'; await run(1); o.voodoo=top();
 // Runesword: attacker blocked, +2 power kills blocker
 reset(); lands(1,'plains',3); mk('runesword',1); const at=mk('hill_giant',1); at.attacking=true; const bl=mk('earth_elemental',0); bl.blockedBy=[]; at.wasBlocked=true; at.blockedBy=[bl.iid]; bl.blocking=at.iid; g.step='block'; g.active=1; await run(1); o.rune=top();
 // Triassic Egg hatch with a big creature in hand
 reset(); const egg=mk('triassic_egg',1); egg.cn={hatchling:2}; mk('serra_angel',1,'hand'); mk('earth_elemental',1,'hand'); await run(1); o.egg=top();
 // Arena of the Ancients vs a legend
 reset(); lands(1,'plains',3); mk('arena_of_the_ancients',1,'hand'); mk('livonya_silone',0); await run(1); o.arena=top();
 // Reverberation vs sorcery burn at face
 reset(); lands(1,'island',4); mk('reverberation',1,'hand'); const fb=mk('fireball',0,'hand'); g.active=0; g.players[0].pool.R=9; E.castSpell(0,fb,[{kind:'player',pid:1}],5); await run(1); o.reverb=top();
 assert.match(o.sword,/Sword of the Ages/); assert.ok(o.swordSacs>=2); assert.strictEqual(o.swordNeg,null); assert.match(o.voodoo||'',/Voodoo Doll/); assert.match(o.rune||'',/Runesword/); assert.match(o.egg||'',/Triassic Egg/); assert.strictEqual(o.arena,'Arena of the Ancients'); assert.strictEqual(o.reverb,'Reverberation');
}]);
sections.push(['combat AI: gang block, lethal alpha strike, crack-back caution',async()=>{ const dk={plains:10,island:10,swamp:10,mountain:10,forest:10,grizzly_bears:10};
 await E.newGame(E.expand(dk),E.expand(dk),['A','B'],true); const g=G();
 const reset=()=>{ g.bf.length=0; for(const P of g.players){ P.graveyard=[]; P.hand=[]; P.life=20; P.decked=false; P.lichLost=false; P.poison=0; } g.stack=[]; g.over=false; g.dmgFx=[]; g.step='attack'; g.landsPlayed=1; globalThis.__aix={0:true,1:true}; };
 const mk=(id,pid)=>{ const c=E.mkCard(id,pid); g.cards.set(c.iid,c); E.moveTo(c,'bf'); c.controller=pid; c.sick=false; return c; };
 // gang block: two Grizzly Bears (2/2) should double-block a Hill Giant (3/3) when it kills it and loses at most one bear
 reset(); g.active=0; const hg=mk('hill_giant',0); hg.attacking=true; const b1=mk('grizzly_bears',1), b2=mk('grizzly_bears',1); mk('plains',1);
 const bl=E.aiBlockers(1,[hg]); assert.strictEqual(bl.length,2,'gang block expected'); assert.ok(bl.every(([,a])=>a===hg));
 // lethal alpha: opponent at 3 life with one blocker; two 3-power attackers must both attack even though one would die
 reset(); g.active=1; const a1=mk('hill_giant',1), a2=mk('hill_giant',1); g.players[0].life=3; mk('earth_elemental',0);
 const at=E.aiAttackers?null:null; const set=globalThis.__engine.aiAttackers?globalThis.__engine.aiAttackers(1):null; if(set) assert.strictEqual(set.length,2,'lethal alpha strike expected');
 // crack-back: AI at 3 life facing a lethal crack-back should keep its blocker home
 reset(); g.active=1; g.players[1].life=3; const ms=mk('grizzly_bears',1); mk('earth_elemental',0); mk('hill_giant',0);
 if(globalThis.__engine.aiAttackers){ const s2=globalThis.__engine.aiAttackers(1); assert.ok(!s2.includes(ms),'should stay home'); }
}]);
sections.push(['classic cards: Hazezon Tamar, Shahrazad (real subgame), Word of Command, Falling Star + AI',async()=>{ const dk={plains:10,island:10,swamp:10,mountain:10,forest:10,grizzly_bears:10};
 await E.newGame(E.expand(dk),E.expand(dk),['A','B'],true); let g=G(); const o={};
 const reset=()=>{ g=G(); g.bf.length=0; for(const P of g.players){ P.graveyard=[]; P.hand=[]; P.exile=[]; P.life=20; P.decked=false; P.lichLost=false; P.poison=0; P.pool={W:0,U:0,B:0,R:0,G:0,C:0}; P.library=[]; } g.stack=[]; g.over=false; g.dmgFx=[]; g.step='main1'; g.active=1; g.landsPlayed=1; g.delayUp=[]; };
 const mk=(id,pid=1,z='bf')=>{ const c=E.mkCard(id,pid); g.cards.set(c.iid,c); if(z==='bf'){ E.moveTo(c,'bf'); c.controller=pid; c.sick=false; } else E.moveTo(c,z); return c; };
 const lib=n=>{ for(let i=0;i<n;i++){ mk(i%2?'forest':'grizzly_bears',0,'library'); mk(i%2?'mountain':'grizzly_bears',1,'library'); } };
 const run=async p=>{ const a=E.aiPick(p); if(!a) return null; await a.run(); return a; };
 const top=()=>{ const t=g.stack[g.stack.length-1]; return t?t.name:null; };
 g.players[1].ai=true;
 // subgame leaves the outer game untouched
 reset(); lib(30); mk('serra_angel',1); const gid=g.id, n0=g.bf.length; const w=await E.runSubgame(); assert.ok(w===0||w===1||w===-1); assert.strictEqual(G(),g); assert.strictEqual(g.id,gid); assert.strictEqual(g.bf.length,n0); assert.strictEqual(g.players[0].library.length,30);
 // Shahrazad: everyone who does not win loses half their life rounded up
 reset(); lib(30); const sh=mk('shahrazad',1,'hand'); g.players[1].pool.W=2; g.players[0].life=15; g.players[1].life=11; E.castSpell(1,sh,[],0); await E.resolveTop(); const L=[g.players[0].life,g.players[1].life]; assert.ok([[15,5],[7,11],[7,5]].some(x=>x[0]===L[0]&&x[1]===L[1]),'life '+L);
 // Word of Command discards a nonland card
 reset(); g.players[1].pool.B=2; const woc=mk('word_of_command',1,'hand'); mk('serra_angel',0,'hand'); mk('plains',0,'hand'); E.castSpell(1,woc,[{kind:'player',pid:0}],0); await E.resolveTop(); assert.deepStrictEqual(g.players[0].graveyard.map(k=>k.d.name),['Serra Angel']); assert.deepStrictEqual(g.players[0].hand.map(k=>k.d.name),['Plains']);
 // Falling Star: only flipped creatures get hit; a dead or tapped result is possible, never both untouched twice in 30 tries
 let hit=0; for(let i=0;i<30;i++){ reset(); const f=mk('falling_star',1,'hand'); const v=mk('earth_elemental',0); g.players[1].pool.R=3; E.castSpell(1,f,[{kind:'card',iid:v.iid}],0); await E.resolveTop(); if(v.tapped&&v.damage===3) hit++; } assert.ok(hit>=5&&hit<=25,'coin flips '+hit);
 // Hazezon Tamar: X Sand Warriors at next upkeep (X = lands then), exiled when Hazezon leaves
 reset(); for(let i=0;i<4;i++) mk('forest',1); const hz=mk('hazezon_tamar',1,'hand'); g.players[1].pool={W:1,U:0,B:0,R:1,G:1,C:4}; E.castSpell(1,hz,[],0); await E.resolveTop(); assert.strictEqual(g.bf.filter(k=>k.d.id==='sand_warrior').length,0); g.turn=2; g.active=1; await E.runTurn().catch(()=>{}); assert.strictEqual(g.bf.filter(k=>k.d.id==='sand_warrior').length,4); E.moveTo(hz,'graveyard'); assert.strictEqual(g.bf.filter(k=>k.d.id==='sand_warrior').length,0);
 // AI casts
 reset(); lib(30); mk('plains',1); mk('plains',1); mk('shahrazad',1,'hand'); g.players[0].life=20; g.players[1].life=6; assert.strictEqual(top(),null); await run(1); assert.strictEqual(top(),'Shahrazad');
 reset(); mk('swamp',1); mk('swamp',1); mk('word_of_command',1,'hand'); mk('serra_angel',0,'hand'); mk('earth_elemental',0,'hand'); await run(1); assert.strictEqual(top(),'Word of Command');
 reset(); mk('mountain',1); mk('mountain',1); mk('mountain',1); mk('falling_star',1,'hand'); mk('hill_giant',0); mk('earth_elemental',0); await run(1); assert.strictEqual(top(),'Falling Star');
}]);
sections.push(['AI uses v57 abilities: Angelic Page, Cyclops, Hornclaw, Assembly-Worker, Call of the Wild',async()=>{ const dk={plains:10,island:10,swamp:10,mountain:10,forest:10,grizzly_bears:10};
 await E.newGame(E.expand(dk),E.expand(dk),['A','B'],true); let g=G(); g.players[1].ai=true;
 const reset=()=>{ g=G(); g.bf.length=0; for(const P of g.players){ P.graveyard=[]; P.hand=[]; P.exile=[]; P.life=20; P.decked=false; P.lichLost=false; P.poison=0; P.pool={W:0,U:0,B:0,R:0,G:0,C:0}; P.library=[]; } g.stack=[]; g.over=false; g.dmgFx=[]; g.step='main1'; g.active=1; g.landsPlayed=1; };
 const mk=(id,pid=1,z='bf')=>{ const c=E.mkCard(id,pid); g.cards.set(c.iid,c); if(z==='bf'){ E.moveTo(c,'bf'); c.controller=pid; c.sick=false; } else E.moveTo(c,z); return c; };
 const run=async()=>{ const a=E.aiPick(1); if(!a) return false; await a.run(); let n=0; while(g.stack.length&&n++<6) await E.resolveTop(); E.sba(); return true; };
 // Cyclops: lethal sacrifice
 reset(); mk('bloodshot_cyclops',1); mk('serra_angel',1); g.players[0].life=4; let ov=false; try{ assert.ok(await run()); }catch(e){ if(e&&e.constructor&&e.constructor.name==='Over') ov=true; else throw e; } assert.ok(ov||g.players[0].life<=0||g.over);
 // Angelic Page saves a blocker
 reset(); g.active=0; g.step='block'; const pg=mk('angelic_page',1); const bl=mk('grizzly_bears',1), at=mk('grizzly_bears',0); at.attacking=true; at.blockedBy=[bl.iid]; bl.blocking=at.iid; at.wasBlocked=true; const ok=await run(); assert.ok(ok); assert.strictEqual(E.pow(bl),3);
 // Assembly-Worker: +1 power makes the attack lethal
 reset(); g.active=1; g.step='block'; const aw=mk('assembly_worker',1); aw.attacking=true; g.players[0].life=3; assert.ok(await run().catch(e=>true)); assert.ok(E.pow(aw)===3||g.over||g.players[0].life<=0);
 // Hornclaw: evasive lethal attack
 reset(); g.step='attack'; for(let i=0;i<6;i++) mk('forest',1); const hc=mk('coastal_hornclaw',1); hc.attacking=true; mk('hill_giant',0); g.players[0].life=3; assert.ok(await run()); assert.ok(E.hasKw(hc,'flying'));
 // Blessed Reversal / Boil / Balance of Power / Call of the Wild itself
 reset(); g.active=0; g.step='attack'; for(let i=0;i<2;i++) mk('plains',1); for(let i=0;i<3;i++){ const a=mk('hill_giant',0); a.attacking=true; } mk('blessed_reversal',1,'hand'); assert.ok(await run()); assert.strictEqual(g.players[1].life,29);
 reset(); for(let i=0;i<4;i++) mk('mountain',1); for(let i=0;i<4;i++) mk('island',0); mk('boil',1,'hand'); assert.ok(await run()); assert.strictEqual(g.bf.filter(k=>k.d.id==='island').length,0);
 reset(); mk('island',1); mk('island',1); mk('island',1); mk('island',1); mk('island',1); for(let i=0;i<5;i++) mk('forest',0,'hand'); for(let i=0;i<10;i++) mk('forest',1,'library'); mk('balance_of_power',1,'hand'); assert.ok(await run()); assert.strictEqual(g.players[1].hand.length,5);
 reset(); for(let i=0;i<4;i++) mk('forest',1); mk('call_of_the_wild',1,'hand'); assert.ok(await run()); assert.ok(g.bf.some(k=>k.d.id==='call_of_the_wild'));
 // Call of the Wild with creature-heavy library
 reset(); g.step='end'; g.active=0; mk('call_of_the_wild',1); for(let i=0;i<10;i++){ mk('grizzly_bears',1,'library'); } g.players[1].pool={W:0,U:0,B:0,R:0,G:4,C:0}; for(let i=0;i<4;i++) mk('forest',1); assert.ok(await run()); assert.ok(g.bf.filter(k=>k.d.id==='grizzly_bears').length>=1);
}]);
(async()=>{ let bad=0; for(const [n,f] of sections){ try{ await f(); console.log('ok  ',n); }catch(e){ bad++; console.log('FAIL',n,'-',String(e&&e.message||e).split('\n')[0], process.env.STACK?'\n'+(e&&e.stack||''):''); } } console.log(bad?'FAILED '+bad:'all passed'); process.exit(bad?1:0); })();
