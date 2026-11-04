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
  await T('clergy',async()=>{ prep(); g.turn=80; g.active=1; g.step='main1'; lands(2,'mountain'); const c=mk('clergy_of_the_holy_nimbus',0); c.d.abilities[0]; const b=inHand('lightning_bolt',1); b.zone='stack'; g.stack.push({sid:SIDN++,kind:'spell',card:b,ctrl:1,targets:[ref(c)],x:0,name:'Bolt'}); const r=await runs(pick()); return [r,c.noRegenT===g.turn,g.stack.length]; });
  console.log(JSON.stringify(o));
})();
