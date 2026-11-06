const {chromium}=require('playwright'); const assert=require('assert');
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1280,height:900}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+(process.env.GAME||require('path').join(__dirname,'..','..','web','index.html')));
  await p.evaluate(()=>{ try{ localStorage.clear(); }catch(e){} advTitle(); }); await p.waitForTimeout(300);
  const labels=await p.$$eval('[data-adv="diff"]',a=>a.map(x=>x.textContent)); assert.strictEqual(labels.length,4);
  for(const [i,min] of [[0,30],[1,35],[2,40],[3,40]]){
    await p.click(`[data-adv="diff"][data-id="${i}"]`); await p.waitForTimeout(100);
    await p.evaluate(()=>{ try{ localStorage.clear(); }catch(e){} ui.cfNew=null; });
    await p.click('[data-adv="new"][data-id="R"]'); await p.waitForTimeout(500);
    const r=await p.evaluate(()=>({d:adv.diff,n:Object.values(adv.deck.cards).reduce((a,b)=>a+b,0),min:advMin()}));
    assert.strictEqual(r.d,i); assert.strictEqual(r.min,min); assert.ok(r.n>=min&&r.n<=min+0||r.n>=min,JSON.stringify(r));
    if(i<2) assert.ok(r.n<40||r.n===40,'deck '+r.n);
    await p.evaluate(()=>{ try{ localStorage.clear(); }catch(e){} closeModal&&closeModal(); advTitle(); }); await p.waitForTimeout(200);
  }
  assert.deepStrictEqual(errs,[]); console.log('diff ui ok'); await b.close();
})().catch(e=>{ console.error(e); process.exit(1); });
