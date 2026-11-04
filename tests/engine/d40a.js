const fs=require('fs');
const src=fs.readFileSync(process.env.GAME||require('path').join(__dirname,'..','..','web','index.html'),'utf8');
new Function(src.slice(src.lastIndexOf('<script>')+8,src.lastIndexOf('</script>')))();
const E=globalThis.__engine; const G=()=>E.getG();
(async()=>{
  const o={};
  const dk={plains:10,island:10,swamp:10,mountain:10,forest:10,grizzly_bears:10};
  await E.newGame(E.expand(dk),E.expand(dk),['A','B'],true);
  const g=G(); const reset=()=>{ g.bf.length=0; for(const P of g.players){ P.graveyard=[]; P.hand=[]; P.life=20; P.decked=false; P.lichLost=false; P.poison=0; P.pool={W:0,U:0,B:0,R:0,G:0,C:0}; } g.stack=[]; g.over=null; g.cause=null; };
  reset();
  const mk=(id,pid=0)=>{ const c=E.mkCard(id,pid); g.cards.set(c.iid,c); E.moveTo(c,'bf'); c.controller=pid; c.sick=false; return c; };
  const ref=c=>({kind:'card',iid:c.iid});
  const dmg=(s,t,n)=>E.dealDamage(s,t,n,false);
  // Axelrod
  reset(); g.turn=5; const ax=mk('axelrod_gunnarson',0); const bear=mk('grizzly_bears',1); dmg(ax,ref(bear),2); g.players[1].life=20; g.players[0].life=20; E.sba(); o.axel=[bear.zone,g.players[0].life,g.players[1].life];
  // Ali
  reset(); const ali=mk('ali_from_cairo',0); g.players[0].life=3; dmg(bear,{kind:'player',pid:0},5); o.ali=g.players[0].life; g.players[0].life=1; dmg(bear,{kind:'player',pid:0},2); o.ali1=g.players[0].life;
  // Brine Hag
  reset(); const hag=mk('brine_hag',0); const big=mk('grizzly_bears',1); dmg(big,ref(hag),2); E.sba(); o.hag=[hag.zone,E.pow(big),E.tough(big)];
  // Serendib sba
  reset(); const sd=mk('serendib_djinn',0); E.sba(); o.sd=sd.zone; const il=mk('island',0); E.sba(); o.sd2=sd.zone; await sd.d.upkeep({src:sd,pid:0}); o.sd3=[il.zone,g.players[0].life,sd.zone]; E.sba(); o.sd4=sd.zone;
  // Bronze horse
  reset(); const bh=mk('bronze_horse',0); const bolt=E.mkCard('lightning_bolt',1); g.cards.set(bolt.iid,bolt); bolt.zone='stack'; dmg(bolt,ref(bh),3); o.bh1=bh.damage; mk('grizzly_bears',0); dmg(bolt,ref(bh),3); o.bh2=bh.damage;
  // Lurker
  reset(); const lu=mk('lurker',1); const bolt2=E.mkCard('lightning_bolt',0); g.cards.set(bolt2.iid,bolt2); bolt2.zone='hand'; o.lurk1=E.legal(E.TG.creature,ref(lu),bolt2); lu.d.onAttack(lu); o.lurk2=E.legal(E.TG.creature,ref(lu),bolt2);
  // Whippoorwill exile
  reset(); const w=mk('whippoorwill',0), vic=mk('grizzly_bears',1); await w.d.abilities[0].resolve({src:w,ctrl:0,targets:[ref(vic)]}); vic.regen=1; E.destroy(vic); o.wip=vic.zone;
  // Wood Elemental
  reset(); for(let i=0;i<4;i++) mk('forest',0); const we=mk('wood_elemental',0); await we.d.etb({src:we,ctrl:0}); o.we=[we.woodN,E.pow(we),E.tough(we),g.bf.filter(c=>c.d.id==='forest').length];
  // Mijae / King Suleiman
  reset(); const ks=mk('king_suleiman',0); const dj=mk('juzam_djinn',1); await ks.d.abilities[0].resolve({src:ks,ctrl:0,targets:[ref(dj)]}); o.ks=dj.zone; o.ksLegal=E.legal(ks.d.abilities[0].target,ref(mk('grizzly_bears',1)),ks);
  // Master of hunt + Prismatic
  reset(); const mh=mk('master_of_the_hunt',0); await mh.d.abilities[0].resolve({src:mh,ctrl:0,targets:[]}); o.wolf=g.bf.filter(c=>c.d.id==='wolves_of_the_hunt').length;
  const pd=mk('prismatic_dragon',0); pd.d.upkeep({src:pd,pid:0}); o.pd=pd.colOv;
  // Rust
  reset(); const art2=mk('icy_manipulator',1); g.stack.push({sid:950,kind:'ability',act:true,src:art2,ab:{resolve:()=>{}},ctrl:1,targets:[],name:'Icy'}); E.DB.rust.resolve({targets:[{kind:'stack',sid:950}],ctrl:0}); o.rust=g.stack.length;
  // Slug
  reset(); const sl=mk('spitting_slug',0), at=mk('grizzly_bears',1); await sl.d.onBlock(sl,at); o.slug=[sl.temp.kw.includes('firstStrike'),at.temp.kw.includes('firstStrike')];
  reset(); const sl2=mk('spitting_slug',0), at2=mk('grizzly_bears',1); mk('forest',0); mk('forest',0); await sl2.d.onBlock(sl2,at2); o.slugPaid=[sl2.temp.kw.includes('firstStrike'),at2.temp.kw.includes('firstStrike')];
  reset(); const sd5=mk('serendib_djinn',0); const il5=mk('island',0), sw5=mk('swamp',0); await sd5.d.upkeep({src:sd5,pid:0}); o.sdUp=[il5.zone,sw5.zone,g.players[0].life]; await sd5.d.upkeep({src:sd5,pid:0}); o.sdUp2=[il5.zone,g.players[0].life]; E.sba(); o.sdUp3=sd5.zone;
  console.log(JSON.stringify(o));
})();
