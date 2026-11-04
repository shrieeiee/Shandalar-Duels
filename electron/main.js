const {app,BrowserWindow,Menu,globalShortcut}=require('electron');
const path=require('path');
app.commandLine.appendSwitch('autoplay-policy','no-user-gesture-required');
app.commandLine.appendSwitch('disable-features','WebRtcHideLocalIpsWithMdns');
function mk(){
  const w=new BrowserWindow({width:1280,height:800,backgroundColor:'#10181f',autoHideMenuBar:true,fullscreen:process.argv.includes('--fullscreen')||!!process.env.SteamDeck||process.env.SteamOS==='1',webPreferences:{contextIsolation:true,sandbox:true}});
  Menu.setApplicationMenu(null);
  w.loadFile(path.join(__dirname,'index.html'));
  w.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  globalShortcut.register('F11',()=>w.setFullScreen(!w.isFullScreen()));
}
app.whenReady().then(mk);
app.on('window-all-closed',()=>app.quit());
