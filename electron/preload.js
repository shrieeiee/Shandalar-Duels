const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('shNative',{
  artList:()=>ipcRenderer.invoke('art:list'),
  artDownload:cards=>ipcRenderer.invoke('art:download',cards),
  artCancel:()=>ipcRenderer.invoke('art:cancel'),
  artClear:()=>ipcRenderer.invoke('art:clear'),
  artFolder:()=>ipcRenderer.invoke('art:folder'),
  onArtProgress:cb=>{ ipcRenderer.removeAllListeners('art:progress'); ipcRenderer.on('art:progress',(e,d)=>cb(d)); }
});
