const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1100,height:1000}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+(process.env.GAME||require('path').join(__dirname,'..','..','web','index.html'))); await p.waitForTimeout(500);
  // slots
  await p.click('[data-adv="slot"][data-id="2"]'); await p.click('[data-adv="new"][data-id="R"]'); await p.waitForTimeout(500);
  console.log('slot2 saved', await p.evaluate(()=>!!localStorage.getItem('shandalar-adv-v1-s2')), 'slot1', await p.evaluate(()=>!!localStorage.getItem('shandalar-adv-v1')));
  for(let i=0;i<8;i++){ await p.keyboard.press('Enter'); await p.waitForTimeout(100); }
  // tap to walk: tap tile 3 to the right/up whichever passable
  const before=await p.evaluate(()=>[adv.x,adv.y,adv.steps]);
  const tgt=await p.evaluate(()=>{ for(let d=3;d>=1;d--) for(const [dx,dy] of [[d,0],[-d,0],[0,d],[0,-d]]){ const x=adv.x+dx,y=adv.y+dy; if(advPathTo(x,y,false)) return [dx,dy]; } return null; });
  const box=await (await p.$('#advCanvas')).boundingBox();
  await p.mouse.click(box.x+box.width*(7.5+tgt[0])/15, box.y+box.height*(5.5+tgt[1])/11);
  await p.waitForTimeout(1500);
  console.log('tap walk', before, await p.evaluate(()=>[adv.x,adv.y,adv.steps]), 'target', tgt);
  // menu -> export
  await p.keyboard.press('m'); await p.waitForTimeout(300);
  const items=await p.evaluate(()=>ADV.dlg&&ADV.dlg.choices);
  console.log('menu',items);
  await p.waitForTimeout(700); await p.evaluate(()=>{ ADV.dlg.sel=3; dlgAct(); }); await p.waitForTimeout(400);
  const ta=await p.evaluate(()=>document.getElementById('exTxt').value.length);
  console.log('export len',ta);
  // import round trip into slot 3
  await p.evaluate(()=>{ pset('shd-slot','3'); const t=document.getElementById('exTxt'); window.__r=saveImport(t.value); });
  console.log('import msg',await p.evaluate(()=>window.__r), 'slot3', await p.evaluate(()=>!!localStorage.getItem('shandalar-adv-v1-s3')));
  await p.click('[data-x="ex-close"]'); await p.waitForTimeout(200);
  // a11y
  await p.evaluate(()=>{ pset('shd-cb','on'); pset('shd-rm','on'); applyA11y(); });
  console.log('classes', await p.evaluate(()=>document.body.className), 'qual', await p.evaluate(()=>advQual()));
  // keyboard nav in modal: open title
  await p.evaluate(()=>{ ADV.mode='idle'; advTitle(); }); await p.waitForTimeout(300);
  console.log('focus', await p.evaluate(()=>document.activeElement.className||document.activeElement.tagName));
  await p.keyboard.press('ArrowRight'); console.log('focus2', await p.evaluate(()=>document.activeElement.textContent.slice(0,20)));
  await p.screenshot({path:require('os').tmpdir()+'/'+require('path').basename('../u36_title.png')});
  // duel screenshot
  await p.evaluate(()=>{ ui.titleOpen=false; closeModal(); ADV.mode='busy'; advDuel(OPPONENTS[1],{kind:'wild',weak:true,reward:35}); });
  await p.waitForFunction(()=>g&&ui.view==='duel'&&ui.wait,null,{timeout:30000}); await p.waitForTimeout(600);
  await p.screenshot({path:require('os').tmpdir()+'/'+require('path').basename('../u36_duel.png')});
  await p.evaluate(()=>{ setView('deck'); }); await p.waitForTimeout(300); await p.screenshot({path:require('os').tmpdir()+'/'+require('path').basename('../u36_deck.png')});
  console.log('errors',errs); await b.close();
})().catch(e=>{console.log('FAIL',e.message.split('\n')[0]); process.exit(1)});
