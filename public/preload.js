// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require("electron")


// As an example, here we use the exposeInMainWorld API to expose the browsers
// and node versions to the main window.
// They'll be accessible at "window.versions".
process.once("loaded", () => {

  contextBridge.exposeInMainWorld("versions", process.versions)

  contextBridge.exposeInMainWorld('darkMode', {
    toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
    resetToSystemTheme: () => ipcRenderer.invoke('dark-mode:system'),
    isDarkMode:()=> ipcRenderer.invoke('dark-mode:get')
  })

  contextBridge.exposeInMainWorld('utils', {
    copy: (...args)=>ipcRenderer.invoke('copyToClipboard',...args)
  })

  contextBridge.exposeInMainWorld('engineAPI', {
    dbStats: () => ipcRenderer.invoke('engine:dbStats'),
    indexStats: (...args) => ipcRenderer.invoke('engine:indexStats', ...args),
    logFilePicker: (...args) => ipcRenderer.invoke('engine:filePicker', ...args),
    queryAnalysis: (...args) => ipcRenderer.invoke('engine:queryAnalysis', ...args),
    queryAnalysisFilter: (...args) => ipcRenderer.invoke('engine:queryAnalysisFilter', ...args),
    connectionAnalysis: (...args) => ipcRenderer.invoke('engine:connectionAnalysis', ...args),
    writeLoadAnalysis: (...args) => ipcRenderer.invoke('engine:writeLoadAnalysis', ...args),
    clusterEventAnalysis: (...args) => ipcRenderer.invoke('engine:clusterEventAnalysis', ...args)
  })
})