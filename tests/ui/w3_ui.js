const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1280,height:900}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+(process.env.GAME||require('path').join(__dirname,'..','..','web','index.html'))); await p.evaluate(()=>setView('deck')); await p.waitForTimeout(400);
  await p.evaluate(()=>{ ui.speed=0.02; });
  await p.click('#startDuel'); await p.waitForTimeout(500);
  const keep=await p.$('[data-act="keep"]'); if(keep) await keep.click();
  await p.waitForFunction(()=>ui.wait&&ui.wait.kind==='priority'&&g.active===0&&g.step==='main1',null,{timeout:60000});
  await p.evaluate(()=>{ window.mk=(id,zone,owner)=>{ const c=mkCard(id,owner); g.cards.set(c.iid,c); c.zone=zone; if(zone==='bf') g.bf.push(c); if(zone==='hand') g.players[owner].hand.push(c); c.controller=owner; return c; }; });
  // Field of Dreams + Revelation chips
  await p.evaluate(()=>{ mk('field_of_dreams','bf',0); mk('revelation','bf',1); render(); });
  console.log('chips',await p.evaluate(()=>[...document.querySelectorAll('.rev')].map(e=>e.textContent).slice(0,6)));
  // Land's Edge owned by AI, human uses it via click -> choose target then discard card
  const r=await p.evaluate(()=>{ const le=mk('lands_edge','bf',1); window.__le=le; const lh=mk('forest','hand',0); window.__lh=lh; render(); return {usable:abilityUsable(0,le,le.d.abilities[0]),click:(c=>typeof onCardClick)(0)}; });
  console.log(r);
  await p.evaluate(()=>{ ui.wait&&0; onCardClick(window.__le); });
  await p.waitForFunction(()=>ui.targeting,null,{timeout:5000}); console.log('target prompt',await p.evaluate(()=>ui.targeting.label));
  const before=await p.evaluate(()=>g.players[1].life);
  await p.evaluate(()=>{ const t=ui.targeting; ui.targeting=null; t.done({kind:'player',pid:1}); });
  await p.waitForTimeout(300);
  console.log('discard modal', await p.evaluate(()=>!!document.querySelector('.modal, #modal, dialog')&&document.body.innerText.includes('Choose a card to discard')));
  console.log('errors',errs);
  await p.screenshot({path:require('os').tmpdir()+'/'+require('path').basename('/tmp/w3.png')}); await b.close();
})().catch(e=>{ console.error('ERR',e.message); process.exit(1); });
