const fs=require('fs');
const src=fs.readFileSync(process.env.GAME||require('path').join(__dirname,'..','..','web','index.html'),'utf8');
new Function(src.slice(src.lastIndexOf('<script>')+8,src.lastIndexOf('</script>')))();
const E=globalThis.__engine; const G=()=>E.getG();
(async()=>{
  const o={}; const T=async(name,fn)=>{ try{ o[name]=await fn(); }catch(e){ o[name]='ERR '+String(e.stack).split('\n').slice(0,3).join(' | ').slice(0,260); } };
  const dk={plains:10,island:10,swamp:10,mountain:10,forest:10,grizzly_bears:10};
  await E.newGame(E.expand(dk),E.expand(dk),['A','B'],true);
  const g=G(); let SIDN=9000;
  const reset=()=>{ g.bf.length=0; for(const P of g.players){ P.graveyard=[]; P.hand=[]; P.exile=[]; P.life=20; P.decked=false; P.pool={W:9,U:9,B:9,R:9,G:9,C:9}; P.rpool=null; P.actTurn=0; P.northStar=0; } g.stack=[]; g.over=false; g.dmgFx=[]; g.sorcLog=[]; g.glyphDoom=[]; g.step='main1'; g.active=0; g.camo=0; g.fog=false; };
  const mk=(id,pid=0)=>{ const c=E.mkCard(id,pid); g.cards.set(c.iid,c); E.moveTo(c,'bf'); c.controller=pid; c.sick=false; return c; };
  const inHand=(id,pid=0)=>{ const c=E.mkCard(id,pid); g.cards.set(c.iid,c); c.zone='hand'; g.players[pid].hand.push(c); return c; };
  const inGy=(id,pid=0)=>{ const c=E.mkCard(id,pid); g.cards.set(c.iid,c); c.zone='graveyard'; g.players[pid].graveyard.push(c); return c; };
  const ref=c=>({kind:'card',iid:c.iid}); const pl=p=>({kind:'player',pid:p});
  const cast=async(c,targets=[],x=0,pid=0,extra={})=>{ const P=g.players[c.owner]; P.hand=P.hand.filter(k=>k!==c); c.zone='stack'; g.stack.push(Object.assign({sid:SIDN++,kind:'spell',card:c,ctrl:pid,targets,x,sacCmc:0,name:c.d.name},extra)); await E.resolveTop(); };
  const act=async(c,i,targets=[],x=0,pid=0)=>{ const ok=E.activate(pid,c,c.d.abilities[i],targets,x); let n=0; while(g.stack.length&&n++<5) await E.resolveTop(); return ok; };
  const L=id=>g.players[0].life;


  const lands=(n,id,pid=1)=>{ for(let i=0;i<n;i++) mk(id,pid); };
  const pick=(pid=1)=>{ const a=E.aiPick(pid,{}); return a; };
  const runs=async(a)=>{ if(!a) return null; a.run(); let n=0; while(g.stack.length&&n++<6) await E.resolveTop(); return Math.round(a.score); };
  const prep=()=>{ reset(); for(const P of g.players) P.pool={W:0,U:0,B:0,R:0,G:0,C:0}; };
  await T('disharm',async()=>{ prep(); g.turn=70; g.active=0; g.step='attack'; lands(3,'mountain'); inHand('disharmony',1); const a=mk('craw_wurm',0); a.attacking=true; const r=await runs(pick()); return [r,a.controller,a.attacking]; });
  await T('silh',async()=>{ prep(); g.turn=71; g.active=0; g.step='main1'; lands(2,'island'); inHand('silhouette',1); const v=mk('craw_wurm',1); const b=inHand('lightning_bolt',0); b.zone='stack'; g.stack.push({sid:SIDN++,kind:'spell',card:b,ctrl:0,targets:[ref(v)],x:0,name:'Bolt'}); v.damage=3; const r=await runs(pick()); return [r,g.dmgFx.length]; });
  await T('backdraft',async()=>{ prep(); g.turn=72; g.active=0; lands(2,'mountain'); inHand('backdraft',1); const s=inHand('earthquake',0); g.sorcLog=[{turn:72,pid:0,n:8,iid:s.iid}]; const r=await runs(pick()); return [r,g.players[0].life]; });
  await T('juxta',async()=>{ prep(); g.turn=73; g.active=1; g.step='main1'; lands(4,'island'); inHand('juxtapose',1); mk('grizzly_bears',1); mk('craw_wurm',0); const r=await runs(pick()); return [r,g.bf.filter(k=>k.d.name==='Craw Wurm')[0].controller]; });
  await T('steal',async()=>{ prep(); g.turn=74; g.active=1; g.step='main1'; const r1=mk('rubinia_soulsinger',1); const v=mk('craw_wurm',0); const r=await runs(pick()); return [r,v.controller]; });
  await T('shimian',async()=>{ prep(); g.turn=75; g.active=0; g.step='block'; lands(1,'swamp'); const s=mk('shimian_night_stalker',1); const a=mk('craw_wurm',0); a.attacking=true; const r=await runs(pick()); return [r,g.players[1].life,s.damage]; });
  await T('avoidfate',async()=>{ prep(); g.turn=76; g.active=0; lands(1,'forest'); inHand('avoid_fate',1); const k=mk('craw_wurm',1); const b=inHand('lightning_bolt',0); b.zone='stack'; const it={sid:SIDN++,kind:'spell',card:b,ctrl:0,targets:[ref(k)],x:0,name:'Bolt'}; g.stack.push(it); const r=await runs(pick()); return [r,it&&g.stack.length]; });
  await T('dust',async()=>{ prep(); g.turn=77; g.active=1; g.step='main1'; lands(3,'plains'); inHand('dust_to_dust',1); mk('mana_vault',0); mk('nevinyrrals_disk',0); mk('sol_ring',0); const r=await runs(pick()); return [r,g.bf.filter(k=>k.d.type==='Artifact').length]; });
  console.log(JSON.stringify(o));
})();
