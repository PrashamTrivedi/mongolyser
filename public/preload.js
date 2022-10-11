// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require("electron");

// As an example, here we use the exposeInMainWorld API to expose the browsers
// and node versions to the main window.
// They'll be accessible at "window.versions".
process.once("loaded", () => {
  contextBridge.exposeInMainWorld("versions", process.versions);
  contextBridge.exposeInMainWorld('engineAPI', {
    dbStats: () => ipcRenderer.invoke('engine:dbStats'),
    indexStats: (...args) => ipcRenderer.invoke('engine:indexStats', ...args),
    logFilePicker: (...args) => ipcRenderer.invoke('engine:filePicker', ...args),
    queryAnalysis: (...args) => ipcRenderer.invoke('engine:queryAnalysis', ...args),
    queryAnalysisFilter: (...args) => ipcRenderer.invoke('engine:queryAnalysisFilter', ...args)
  })
});