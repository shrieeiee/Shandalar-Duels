const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch({args:['--disable-features=WebRtcHideLocalIpsWithMdns']});
  const ctx=await b.newContext({viewport:{width:1100,height:800}});
  const H=await ctx.newPage(), G=await ctx.newPage(); const errs=[];
  for(const [n,p] of [['H',H],['G',G]]) p.on('pageerror',e=>errs.push(n+': '+e.message+' '+(e.stack||'').split('\n').slice(0,3).join('|')));
  for(const p of [H,G]){ await p.goto('file://'+(process.env.GAME||require('path').join(__dirname,'..','..','web','index.html'))); await p.waitForTimeout(400); await p.evaluate(()=>{ setView('duel'); closeModal(); }); }
  await H.evaluate(()=>{ NET.nick='Hosty'; netOpen(); netClick('host'); });
  await H.waitForFunction(()=>NET.code,null,{timeout:15000}); const code=await H.evaluate(()=>NET.code); console.log('invite len',code.length);
  await G.evaluate(c=>{ NET.nick='Guesty'; netOpen(); netClick('join'); document.getElementById('netIn').value=c; netClick('doJoin'); },code);
  await G.waitForFunction(()=>NET.reply,null,{timeout:15000}); const reply=await G.evaluate(()=>NET.reply); console.log('reply len',reply.length);
  await H.evaluate(r=>{ document.getElementById('netIn').value=r; netClick('accept'); },reply);
  await H.waitForFunction(()=>g&&g.players&&g.players.length===2&&g.turn>=0&&NET.ch&&NET.ch.readyState==='open',null,{timeout:20000});
  await G.waitForFunction(()=>g&&g.players&&g.players.length===2,null,{timeout:20000});
  console.log('connected; game started. host sees',await H.evaluate(()=>g.players.map(p=>p.name)),'guest sees',await G.evaluate(()=>g.players.map(p=>p.name)));
  const bot=()=>{ try{
    const w=ui.wait; if(ui.targeting){ const t=ui.targeting; window.__tg=(window.__tg||0)+1; let ok=finishTarget({kind:'player',pid:1}); if(!ok){ const o=g.bf.filter(c=>ctrl(c)===1); for(const c of o){ if(finishTarget({kind:'card',iid:c.iid})){ ok=true; break; } } } if(!ok){ for(const c of g.bf){ if(finishTarget({kind:'card',iid:c.iid})){ ok=true; break; } } } if(!ok||window.__tg>40){ ui.targeting=null; render(); } return; } if(!w||(document.getElementById('modal')&&!document.getElementById('modal').hidden&&ui.modal&&ui.modal.kind!=='net'&&false)) return;
    if(w.kind==='mulligan'){ handleAct('keep'); return; }
    if(w.kind==='priority'){
      const P=g.players[0]; window.__tries=window.__tries||{};
      const land=P.hand.find(isLand); if(land&&timingOK(0,land)){ onHandClick(land); return; }
      if(w.data&&w.data.sorc||g.active===0&&!g.stack.length&&(g.step==='main1'||g.step==='main2')){
        // tap everything then cast a creature
        const c=P.hand.find(c=>!isLand(c)&&timingOK(0,c)&&castableNow(0,c)&&!(c.d.cost||'').includes('X')&&((window.__tries[c.iid]||0)<2));
        if(c){ window.__tries[c.iid]=(window.__tries[c.iid]||0)+1; humanCast(c); return; } }
      handleAct('pass'); return; }
    if(w.kind==='attack'){ for(const i of ui.attackable) ui.attack.add(i); handleAct('confirmAttack'); return; }
    if(w.kind==='block'){ handleAct('confirmBlock'); return; }
    if(w.kind==='discard'){ const c=g.players[0].hand[0]; if(c) onHandClick(c); return; }
  }catch(e){ window.__boterr=(window.__boterr||[]).concat(String(e.stack||e).slice(0,300)); } };
  for(const p of [H,G]) await p.evaluate(`(()=>{ window.__bot=${bot.toString()}; setInterval(window.__bot,120); })()`);
  const sum=async p=>p.evaluate(()=>({turn:g.turn,over:g.over&&g.over.winner,life:g.players.map(x=>x.life),hand:g.players.map(x=>x.hand.length),bf:g.bf.map(c=>c.iid+(c.tapped?'t':'')+':'+c.controller).sort().join(','),gy:g.players.map(x=>x.graveyard.length)}));
  let last=0;
  for(let i=0;i<150;i++){ await H.waitForTimeout(1000); const h=await sum(H); if(h.turn!==last){ last=h.turn; }
    if(h.over!=null||h.turn>=14) break; }
  await H.waitForTimeout(1500);
  const h=await sum(H), gu=await sum(G);
  console.log('HOST ',JSON.stringify(h)); console.log('GUEST',JSON.stringify(gu));
  const flip=s=>s.split(',').map(x=>{ const [a,c]=x.split(':'); return a+':'+(1-c); }).sort().join(',');
  console.log('life match',JSON.stringify(h.life)===JSON.stringify([...gu.life].reverse()),'hand match',JSON.stringify(h.hand)===JSON.stringify([...gu.hand].reverse()),'bf match',h.bf===flip(gu.bf),'turn match',h.turn===gu.turn);
  console.log('bot errors H',await H.evaluate(()=>window.__boterr), 'G',await G.evaluate(()=>window.__boterr));
  await H.screenshot({path:require('os').tmpdir()+'/'+require('path').basename('net_host.png')}); await G.screenshot({path:require('os').tmpdir()+'/'+require('path').basename('net_guest.png')});
  console.log('errors',errs); await b.close();
})();
