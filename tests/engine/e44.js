const fs=require('fs');
const src=fs.readFileSync(process.env.GAME||require('path').join(__dirname,'..','..','web','index.html'),'utf8');
new Function(src.slice(src.lastIndexOf('<script>')+8,src.lastIndexOf('</script>')))();
const E=globalThis.__engine; const G=()=>E.getG();
(async()=>{ const o={}; const dk={plains:10,island:10,swamp:10,mountain:10,forest:10,grizzly_bears:10};
 await E.newGame(E.expand(dk),E.expand(dk),['A','B'],true); const g=G();
 const reset=()=>{ g.bf.length=0; for(const P of g.players){ P.graveyard=[]; P.hand=[]; P.exile=[]; P.life=20; P.pool={W:9,U:9,B:9,R:9,G:9,C:9}; } g.stack=[]; g.over=false; g.dmgFx=[]; g.step='main1'; g.active=0; };
 const mk=(id,pid=0)=>{ const c=E.mkCard(id,pid); g.cards.set(c.iid,c); E.moveTo(c,'bf'); c.controller=pid; c.sick=false; return c; };
 reset(); const sp=mk('sorrows_path',0); const k=mk('earth_elemental',0); sp.tapped=true; E.sba(); const st=g.stack.length; let n=0; while(g.stack.length&&n++<5) await E.resolveTop(); E.sba(); const st2=g.stack.length; o.sorrowAnyTap=[st,g.players[0].life,k.damage,st2]; sp.tapped=false; E.sba(); sp.tapped=true; E.sba(); o.again=g.stack.length;
 // blood HEADLESS
 reset(); const m=mk('grizzly_bears',0); const b=E.mkCard('blood_of_the_martyr',0); g.cards.set(b.iid,b); b.zone='stack'; g.stack.push({sid:5001,kind:'spell',card:b,ctrl:0,targets:[],x:0,name:'B'}); await E.resolveTop(); E.dealDamage(m,{kind:'player',pid:1},1); E.dealDamage({zone:'bf',d:{name:'x'},temp:{},kw:[]},m,2); o.blood=[g.players[0].life,m.damage];
 console.log(JSON.stringify(o)); })();
