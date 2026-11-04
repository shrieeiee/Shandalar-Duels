const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1280,height:900}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+(process.env.GAME||require('path').join(__dirname,'..','..','web','index.html'))); await p.evaluate(()=>setView('deck')); await p.waitForTimeout(400);
  await p.evaluate(()=>{ ui.speed=0.02; });
  await p.click('#startDuel'); await p.waitForTimeout(500);
  const keep=await p.$('[data-act="keep"]'); if(keep) await keep.click();
  await p.waitForFunction(()=>ui.wait&&ui.wait.kind==='priority'&&g.active===0&&g.step==='main1',null,{timeout:60000});
  await p.evaluate(()=>{ window.mk=(id,zone,owner)=>{ const c=mkCard(id,owner); g.cards.set(c.iid,c); c.zone=zone; if(zone==='bf') g.bf.push(c); return c; };
    window.push=(c,ctrl,targets,x)=>{ const it={sid:SID++,kind:'spell',card:c,ctrl,targets:targets||[],x:x||0,name:c.d.name}; g.stack.push(it); return it; }; });
  // Steal Artifact on AI's sol ring
  const r1=await p.evaluate(async()=>{ const ring=mk('sol_ring','bf',1); const a=mk('steal_artifact','stack',0); push(a,0,[{kind:'card',iid:ring.iid}]); await resolveTop(); sba(); return {ctrl:ctrl(ring),auraOn:g.bf.includes(a)}; });
  console.log('steal artifact:',r1);
  // Threaten
  const r2=await p.evaluate(async()=>{ const k=mk('sengir_vampire','bf',1); k.tapped=true; const a=mk('threaten','stack',0); push(a,0,[{kind:'card',iid:k.iid}]); await resolveTop(); const mid={ctrl:ctrl(k),tapped:k.tapped,haste:hasKw(k,'haste')}; window.__k=k; return mid; });
  console.log('threaten now:',r2);
  // Fork a Lightning Bolt aimed at AI face (human casts bolt, then forks) -> choose new target via UI
  await p.evaluate(()=>{ const bolt=mk('lightning_bolt','stack',0); window.__bi=push(bolt,0,[{kind:'player',pid:1}]); const f=mk('fork','stack',0); push(f,0,[{kind:'stack',sid:window.__bi.sid}]); window.__life=g.players[1].life; window.__d=false; resolveTop().then(()=>{window.__d=true}); });
  await p.waitForFunction(()=>ui.targeting); console.log('fork prompt:',await p.evaluate(()=>ui.targeting.label));
  await p.evaluate(()=>{ const t=ui.targeting; ui.targeting=null; t.done({kind:'player',pid:0}); }); await p.waitForFunction(()=>window.__d);
  console.log('stack after fork:',await p.evaluate(()=>g.stack.map(s=>s.name+'→'+JSON.stringify(s.targets))));
  await p.evaluate(async()=>{ await resolveTop(); await resolveTop(); });
  console.log('life me',await p.evaluate(()=>g.players[0].life),'opp',await p.evaluate(()=>g.players[1].life),'(was',await p.evaluate(()=>window.__life),') gy has copy:',await p.evaluate(()=>g.players.some(P=>P.graveyard.some(c=>c.copy))));
  // Deflection: AI bolt at me, I deflect to opponent
  await p.evaluate(()=>{ const bolt=mk('lightning_bolt','stack',1); window.__bi=push(bolt,1,[{kind:'player',pid:0}]); const f=mk('deflection','stack',0); push(f,0,[{kind:'stack',sid:window.__bi.sid}]); window.__d=false; window.__l=[g.players[0].life,g.players[1].life]; resolveTop().then(()=>{window.__d=true}); });
  await p.waitForFunction(()=>ui.targeting); console.log('deflect prompt:',await p.evaluate(()=>ui.targeting.label));
  await p.evaluate(()=>{ const t=ui.targeting; ui.targeting=null; t.done({kind:'player',pid:1}); }); await p.waitForFunction(()=>window.__d);
  await p.evaluate(async()=>{ await resolveTop(); });
  console.log('life before',await p.evaluate(()=>window.__l),'after',await p.evaluate(()=>[g.players[0].life,g.players[1].life]));
  // Threaten returns at cleanup: simulate
  await p.evaluate(()=>{ g.step='end'; }); 
  console.log('errors',errs); await b.close();
})().catch(e=>{console.log('FAIL',e.message.split('\n')[0]); process.exit(1)});
