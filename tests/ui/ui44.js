const {chromium}=require('playwright');
const step=(n)=>console.log('step',n);
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1280,height:900}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+(process.env.GAME||require('path').join(__dirname,'..','..','web','index.html'))); await p.evaluate(()=>{ setView('deck'); ui.speed=0.02; });
  await p.waitForTimeout(300); await p.click('#startDuel'); await p.waitForTimeout(500);
  const keep=await p.$('[data-act="keep"]'); if(keep) await keep.click();
  await p.waitForFunction(()=>ui.wait&&ui.wait.kind==='priority'&&g.active===0&&g.step==='main1',null,{timeout:60000});
  step('ready'); const out={};
  await p.evaluate(()=>{ window.mk=(id,pid=0)=>{ const c=mkCard(id,pid); g.cards.set(c.iid,c); c.zone='bf'; c.controller=pid; g.bf.push(c); c.sick=false; return c; }; g.players[0].pool={W:9,U:9,B:9,R:9,G:9,C:9}; window.cs=mk('city_of_shadows'); window.vic=mk('grizzly_bears'); setTimeout(()=>humanUsePermanent(cs),0); });
  await p.waitForTimeout(600); step('city click');
  out.modal=await p.evaluate(()=>{ const m=document.querySelector('#modal'); return m?m.innerText.slice(0,160):null; });
  const btns=await p.$$('#modal [data-ask]'); out.nb=btns.length; if(btns.length) await btns[1].click(); await p.waitForTimeout(600); out.m2=await p.evaluate(()=>{ const m=document.querySelector('#modal'); return m?m.innerText.slice(0,200):null; }); const b2=await p.$$('#modal [data-ask]'); if(b2.length) await b2[0].click(); await p.waitForTimeout(800);
  out.cs=await p.evaluate(()=>[vic.zone,cs.cn&&cs.cn.storage,g.stack.length,ui.wait&&ui.wait.kind]);
  // Faerie Dragon (no target prompt)
  await p.evaluate(()=>{ window.fd=mk('faerie_dragon'); mk('grizzly_bears',1); setTimeout(()=>humanUsePermanent(fd),0); }); await p.waitForTimeout(600);
  out.fd=await p.evaluate(()=>[!!ui.targeting,JSON.stringify(g.players[0].pool),fd.tapped,(g.log||[]).slice(-3).map(l=>l.t||l.text||l),document.querySelector('#modal')&&document.querySelector('#modal').innerText.slice(0,80)]);
  // Camouflage piles for a human defender
  await p.evaluate(()=>{ g.stack.length=0; window.at=mk('grizzly_bears',1); at.attacking=true; window.bl=mk('grizzly_bears',0); window.camoRes=null; camoBlocks(0,[at]).then(r=>{ window.camoRes=r.map(([x,y])=>x.d.name+'>'+y.d.name); }); }); await p.waitForTimeout(500);
  out.camoModal=await p.evaluate(()=>{ const m=document.querySelector('#modal'); return m?m.innerText.slice(0,200):null; });
  for(let i=0;i<4;i++){ const bb=await p.$$('#modal [data-ask]'); if(!bb.length) break; await bb[0].click(); await p.waitForTimeout(400); }
  out.camo=await p.evaluate(()=>window.camoRes);
  // Gem Bazaar tap
  await p.evaluate(()=>{ window.gb=mk('gem_bazaar'); gb.d.etb({src:gb,ctrl:0}); window.gcol=gb.gemCol; g.players[0].pool={W:0,U:0,B:0,R:0,G:0,C:0}; setTimeout(()=>humanUsePermanent(gb),0); }); await p.waitForTimeout(600);
  out.gem=await p.evaluate(()=>[gcol,gb.tapped,JSON.stringify(g.players[0].pool),document.querySelector('#modal')&&document.querySelector('#modal').innerText.slice(0,100)]);
  console.log(JSON.stringify(out)); console.log('errors',errs); await b.close();
})().catch(e=>{console.log('FAIL',e.message.split('\n')[0]); process.exit(1)});
