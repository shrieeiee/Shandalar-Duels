const {app,BrowserWindow,Menu,globalShortcut,dialog}=require('electron');
const path=require('path'), fs=require('fs');
const LOG=()=>path.join(app.getPath('userData'),'shandalar-log.txt');
const log=m=>{ try{ fs.appendFileSync(LOG(),new Date().toISOString()+' '+m+'\n'); }catch(e){} };
const NOGPU=path.join(app.getPath('userData'),'nogpu');
try{ if(fs.existsSync(NOGPU)||process.argv.includes('--disable-gpu')) app.disableHardwareAcceleration(); }catch(e){}
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('in-process-gpu');
app.commandLine.appendSwitch('autoplay-policy','no-user-gesture-required');
process.on('uncaughtException',e=>{ log('uncaught '+(e&&e.stack||e)); try{ dialog.showErrorBox('Shandalar Duels',String(e&&e.message||e)+'\n\nLog: '+LOG()); }catch(x){} });
const cardart=require('./cardart');
cardart.registerScheme();
let win=null;
function mk(){
  win=new BrowserWindow({width:1280,height:800,show:false,backgroundColor:'#10181f',autoHideMenuBar:true,fullscreen:process.argv.includes('--fullscreen')||process.env.SteamOS==='1',webPreferences:{contextIsolation:true,preload:path.join(__dirname,'preload.js')}});
  Menu.setApplicationMenu(null);
  win.once('ready-to-show',()=>win.show());
  win.webContents.on('did-fail-load',(e,c,d)=>{ log('did-fail-load '+c+' '+d); win.show(); });
  win.webContents.on('render-process-gone',(e,d)=>{ log('render-process-gone '+JSON.stringify(d)); if(process.argv.includes('--retry')||fs.existsSync(NOGPU)) return; try{ fs.writeFileSync(NOGPU,'1'); }catch(x){} app.relaunch({args:process.argv.slice(1).concat('--retry')}); app.exit(0); });
  win.loadFile(path.join(__dirname,'index.html')).catch(e=>log('load '+e));
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
}
app.on('child-process-gone',(e,d)=>{ log('child-process-gone '+JSON.stringify(d)); if(d.type==='GPU'&&!fs.existsSync(NOGPU)&&!process.argv.includes('--retry')){ try{ fs.writeFileSync(NOGPU,'1'); }catch(x){} app.relaunch({args:process.argv.slice(1).concat('--retry')}); app.exit(0); } });
app.whenReady().then(()=>{ try{ cardart.register(()=>win); }catch(e){ log('cardart '+e); } mk(); try{ globalShortcut.register('F11',()=>win&&win.setFullScreen(!win.isFullScreen())); }catch(e){ log('shortcut '+e); } });
app.on('window-all-closed',()=>app.quit());
