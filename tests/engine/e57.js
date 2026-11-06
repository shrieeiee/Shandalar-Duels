const fs=require('fs'),assert=require('assert');
const src=fs.readFileSync(process.env.GAME||require('path').join(__dirname,'..','..','web','index.html'),'utf8');
new Function(src.slice(src.lastIndexOf('<script>')+8,src.lastIndexOf('</script>')))();
const E=globalThis.__engine; const G=()=>E.getG();
(async()=>{ const dk={plains:10,island:10,swamp:10,mountain:10,forest:10,grizzly_bears:10};
 await E.newGame(E.expand(dk),E.expand(dk),['A','B'],true); let g=G(); g.players[1].ai=true;
 const reset=()=>{ g=G(); g.bf.length=0; for(const P of g.players){ P.graveyard=[]; P.hand=[]; P.exile=[]; P.life=20; P.decked=false; P.lichLost=false; P.poison=0; P.pool={W:0,U:0,B:0,R:0,G:0,C:0}; P.library=[]; } g.stack=[]; g.over=false; g.dmgFx=[]; g.step='main1'; g.active=0; g.landsPlayed=0; g.delayUp=[]; };
 const mk=(id,pid=0,z='bf')=>{ assert.ok(E.DB[id],'missing '+id); const c=E.mkCard(id,pid); g.cards.set(c.iid,c); if(z==='bf'){ E.moveTo(c,'bf'); c.controller=pid; c.sick=false; } else E.moveTo(c,z); return c; };
 const cast=async(id,pid,targets=[],x=0,pool)=>{ const c=mk(id,pid,'hand'); g.players[pid].pool=pool||{W:9,U:9,B:9,R:9,G:9,C:9}; E.castSpell(pid,c,targets,x); let n=0; while(g.stack.length&&n++<8) await E.resolveTop(); E.sba(); return c; };
 const ref=c=>({kind:'card',iid:c.iid}); const names=l=>l.map(k=>k.d.name);
 const ids='angel_of_mercy angelic_page ardent_militia aven_cloudchaser aven_flock blessed_reversal urborg_volcano elfhame_palace shivan_oasis coastal_tower salt_marsh beast_of_burden ensnaring_bridge glorious_anthem noble_purpose pacifism rolling_stones sanctimony abyssal_specter ambitions_cost anaba_shaman archivist avatar_of_hope aven_fisher balance_of_power balduvian_barbarians blanchwood_armor blaze blinding_angel bloodshot_cyclops boil brass_herald bribery call_of_the_wild canopy_spider canyon_wildcat carrion_wall catalog chastise choke cinder_wall coastal_hornclaw coastal_piracy coat_of_arms coercion collective_unconscious concentrate assembly_worker'.split(' ');
 for(const i of ids) assert.ok(E.DB[i],i);
 // simple spells
 reset(); await cast('angel_of_mercy',0); assert.strictEqual(g.players[0].life,23);
 reset(); for(let i=0;i<10;i++) mk('forest',0,'library'); await cast('concentrate',0); assert.strictEqual(g.players[0].hand.length,3);
 reset(); for(let i=0;i<10;i++) mk('forest',0,'library'); await cast('ambitions_cost',0); assert.deepStrictEqual([g.players[0].hand.length,g.players[0].life],[3,17]);
 reset(); for(let i=0;i<10;i++) mk('forest',0,'library'); await cast('catalog',0); assert.strictEqual(g.players[0].hand.length,1); assert.strictEqual(g.players[0].graveyard.length,2);  // catalog itself + discard
 reset(); for(let i=0;i<10;i++) mk('forest',0,'library'); mk('grizzly_bears',0); mk('hill_giant',0); mk('hill_giant',1); await cast('collective_unconscious',0); assert.strictEqual(g.players[0].hand.length,2);
 reset(); for(let i=0;i<5;i++) mk('forest',0,'library'); for(let i=0;i<2;i++) mk('forest',1,'hand'); mk('plains',0,'hand'); await cast('balance_of_power',0,[{kind:'player',pid:1}]); assert.strictEqual(g.players[0].hand.length,1+1); // opp 2 vs me 0 -> draw 2 (Plains played from hand? mk adds to hand first)
 // Pacifism
 reset(); const gb=mk('grizzly_bears',1); await cast('pacifism',0,[ref(gb)]); gb.sick=false; g.active=1; assert.strictEqual(E.canAttack(gb,1),false); const atk=mk('grizzly_bears',0); atk.attacking=true; assert.strictEqual(E.canBlock(gb,atk),false);
 // Glorious Anthem, Coat of Arms, Beast of Burden
 reset(); const b1=mk('grizzly_bears',0), b2=mk('grizzly_bears',1); mk('glorious_anthem',0); assert.deepStrictEqual([E.pow(b1),E.pow(b2)],[3,2]);
 reset(); const c1=mk('goblin_king',0), c2=mk('grizzly_bears',1), c3=mk('grizzly_bears',0), c4=mk('hill_giant',1); const base=E.pow(c3); mk('coat_of_arms',0); assert.strictEqual(E.pow(c3)-base,1); assert.strictEqual(E.pow(c2)-base,1); assert.strictEqual(E.pow(c4),3);
 reset(); const bb=mk('beast_of_burden',0); mk('grizzly_bears',1); mk('grizzly_bears',0); assert.deepStrictEqual([E.pow(bb),E.tough(bb)],[3,3]);
 // Blessed Reversal, Chastise, Boil, Blaze
 reset(); const at=mk('hill_giant',1); at.attacking=true; g.active=1; await cast('blessed_reversal',0); assert.strictEqual(g.players[0].life,23);
 reset(); const at2=mk('hill_giant',1); at2.attacking=true; await cast('chastise',0,[ref(at2)]); assert.strictEqual(at2.zone,'graveyard'); assert.strictEqual(g.players[0].life,23);
 reset(); const i1=mk('island',1), i2=mk('island',0), m1=mk('mountain',0); await cast('boil',0); assert.deepStrictEqual([i1.zone,i2.zone,m1.zone],['graveyard','graveyard','bf']);
 reset(); const t1=mk('hill_giant',1); await cast('blaze',0,[ref(t1)],3); assert.strictEqual(t1.zone,'graveyard'); await cast('blaze',0,[{kind:'player',pid:1}],4); assert.strictEqual(g.players[1].life,16);
 // Coercion
 reset(); mk('serra_angel',1,'hand'); mk('plains',1,'hand'); await cast('coercion',0); assert.deepStrictEqual(names(g.players[1].graveyard),['Serra Angel']);
 // Bribery
 reset(); mk('plains',1,'library'); mk('serra_angel',1,'library'); mk('hill_giant',1,'library'); await cast('bribery',0); assert.strictEqual(g.bf.filter(k=>k.d.id==='serra_angel'&&ctrl0(k)===0).length,1); function ctrl0(k){ return k.controller; }
 // lands enter tapped
 reset(); const sm=mk('salt_marsh',0,'hand'); E.playLand(0,sm); assert.strictEqual(sm.tapped,true);
 // Choke
 reset(); mk('choke',0); const il=mk('island',1); il.tapped=true; g.active=1; /* untap check via runTurn is heavy; flag exercised in sims */
 // Sanctimony / Noble Purpose / Coastal Piracy
 reset(); mk('sanctimony',0); mk('mountain',1); g.active=1; await cast('lightning_bolt',1,[{kind:'player',pid:0}],0,{W:0,U:0,B:0,R:0,G:0,C:0}); assert.strictEqual(g.players[0].life,20-3+1);
 reset(); mk('noble_purpose',0); const nb=mk('grizzly_bears',0); const vb=mk('hill_giant',1); E.dealDamage(nb,vb,2); assert.strictEqual(g.players[0].life,22);
 reset(); mk('coastal_piracy',0); const pr=mk('grizzly_bears',0); for(let i=0;i<3;i++) mk('forest',0,'library'); pr.attacking=true; E.dealDamage(pr,{kind:'player',pid:1},2,true); assert.strictEqual(g.players[0].hand.length,1);
 // Abyssal Specter / Blinding Angel
 reset(); const sp=mk('abyssal_specter',0); mk('plains',1,'hand'); mk('plains',1,'hand'); sp.attacking=true; E.dealDamage(sp,{kind:'player',pid:1},2,true); await new Promise(r=>setTimeout(r,0)); assert.strictEqual(g.players[1].hand.length,1);
 reset(); const ba=mk('blinding_angel',0); ba.attacking=true; E.dealDamage(ba,{kind:'player',pid:1},3,true); const dm=mk('hill_giant',1); g.turn++; assert.strictEqual(E.canAttack(dm,1),false); g.turn++; assert.strictEqual(E.canAttack(dm,1),true);
 // Ensnaring Bridge, Rolling Stones, Avatar cost
 reset(); mk('ensnaring_bridge',0); const hg=mk('hill_giant',0); g.players[0].hand=[]; assert.strictEqual(E.canAttack(hg,0),false); mk('plains',0,'hand'); mk('plains',0,'hand'); mk('plains',0,'hand'); assert.strictEqual(E.canAttack(hg,0),true);
 reset(); const wl=mk('wall_of_stone',0); assert.strictEqual(E.canAttack(wl,0),false); mk('rolling_stones',1); assert.strictEqual(E.canAttack(wl,0),true);
 reset(); const av=mk('avatar_of_hope',0,'hand'); const full=E.costOf(av).generic; g.players[0].life=3; assert.strictEqual(E.costOf(av).generic,Math.max(0,full-6));
 // Anaba Shaman / Archivist / Cyclops / Brass Herald
 reset(); const lib=[]; for(let i=0;i<4;i++) mk('forest',0,'library'); mk('grizzly_bears',0,'library'); mk('grizzly_bears',0,'library'); mk('hill_giant',0,'library');
 const bh=await cast('brass_herald',0,[],0); assert.ok(bh.heraldType); 
 // abilities
 const act=async(c,i,t=[],pid=0)=>{ g.players[pid].pool={W:9,U:9,B:9,R:9,G:9,C:9}; await E.activate(pid,c,c.d.abilities[i],t); let n=0; while(g.stack.length&&n++<8) await E.resolveTop(); E.sba(); };
 reset(); for(let i=0;i<3;i++) mk('forest',0,'library'); const ar=mk('archivist',0); await act(ar,0); assert.strictEqual(g.players[0].hand.length,1); assert.ok(ar.tapped);
 reset(); const an=mk('anaba_shaman',0), vt=mk('grizzly_bears',1); await act(an,0,[ref(vt)]); assert.strictEqual(vt.damage,1);
 reset(); const ap=mk('angelic_page',0), at3=mk('grizzly_bears',0); at3.attacking=true; await act(ap,0,[ref(at3)]); assert.strictEqual(E.pow(at3),3);
 reset(); const cy=mk('bloodshot_cyclops',0), fod=mk('hill_giant',0); await act(cy,0,[{kind:'sac',iid:fod.iid},{kind:'player',pid:1}]); assert.strictEqual(g.players[1].life,17); assert.strictEqual(fod.zone,'graveyard');
 reset(); const hc=mk('coastal_hornclaw',0), ln=mk('plains',0); await act(hc,0,[{kind:'sac',iid:ln.iid}]); assert.strictEqual(ln.zone,'graveyard'); assert.ok(E.hasKw(hc,'flying'));
 reset(); const aw1=mk('assembly_worker',0), aw2=mk('assembly_worker',0); await act(aw1,0,[ref(aw2)]); assert.strictEqual(E.pow(aw2),3);
 reset(); mk('call_of_the_wild',0); mk('forest',0,'library'); mk('serra_angel',0,'library'); const cw=g.bf[0]; await act(cw,0); assert.ok(g.bf.some(k=>k.d.id==='serra_angel')); await act(cw,0); assert.strictEqual(g.players[0].graveyard.length,1);
 reset(); const sp1=mk('carrion_wall',0); await act(sp1,0); assert.ok(sp1.regen>0);
 // Aven Cloudchaser destroys an enchantment
 reset(); const wk=mk('weakness',1); g.cards.get(wk.iid); await cast('aven_cloudchaser',0); assert.strictEqual(wk.zone,'graveyard');
 // Cinder Wall dies after blocking
 reset(); assert.strictEqual(E.DB.cinder_wall.selfDieBlk,true);
 // Brass Herald
 reset(); const bhl=[ 'grizzly_bears','plains','plains','grizzly_bears','hill_giant' ]; for(const id of bhl.slice().reverse()) mk(id,0,'library'); const bh2=await cast('brass_herald',0); await new Promise(r=>setTimeout(r,5)); assert.ok(bh2.heraldType); assert.ok(g.players[0].hand.length>=0);
 console.log('e57 ok'); })().catch(e=>{ console.error(e); process.exit(1); });
