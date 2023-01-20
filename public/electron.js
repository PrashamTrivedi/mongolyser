// Module to control the application lifecycle and the native browser window.
const { app, BrowserWindow, protocol, dialog, ipcMain, nativeTheme, clipboard } = require("electron")
const path = require("path")
const url = require("url")

// Require Engine Services
const indexStats = require("./engine/analysers/index.analyser")
const queryAnalysis = require("./engine/analysers/query.analyser")
const connectionAnalysis = require("./engine/analysers/connections.analysis")
const writeLoadAnalysis = require("./engine/analysers/write_load.analyser")
const clusterEventAnalysis = require("./engine/analysers/cluster_events.analysis")
const pickerUtils = require('./engine/utils/pickers')

// Create the native browser window.
function createWindow() {



  const mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    // Set the path of an additional "preload" script that can be used to
    // communicate between node-land and browser-land.
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  })

  // In production, set the initial browser path to the local bundle generated
  // by the Create React App build process.
  // In development, set it to localhost to allow live/hot-reloading.
  const appURL = app.isPackaged
    ? url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true,
    })
    : "http://localhost:3000"
  mainWindow.loadURL(appURL)

  ipcMain.handle('dark-mode:toggle', () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'light'
    } else {
      nativeTheme.themeSource = 'dark'
    }
    return nativeTheme.shouldUseDarkColors
  })

  ipcMain.handle('dark-mode:system', () => {
    nativeTheme.themeSource = 'system'
  })
  ipcMain.handle('dark-mode:get', () => {
    return nativeTheme.shouldUseDarkColors
  })

  ipcMain.handle('copyToClipboard', async (chan,clipboardText) => {
     clipboard.writeText(clipboardText)

  })

  // Automatically open Chrome's DevTools in development mode.
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools()
  }

}

// Setup a local proxy to adjust the paths of requested files when loading
// them from the local production bundle (e.g.: local fonts, etc...).
function setupLocalFilesNormalizerProxy() {
  protocol.registerHttpProtocol(
    "file",
    (request, callback) => {
      const url = request.url.substr(8)
      callback({ path: path.normalize(`${__dirname}/${url}`) })
    },
    (error) => {
      if (error) console.error("Failed to register protocol")
    }
  )
}

// This method will be called when Electron has finished its initialization and
// is ready to create the browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Register Index Stats IPC 

  try {
    ipcMain.handle('engine:indexStats', indexStats.get_index_stats)
    ipcMain.handle('engine:filePicker', pickerUtils.filePicker)
    ipcMain.handle('engine:queryAnalysis', queryAnalysis.analyse_queries)
    ipcMain.handle('engine:queryAnalysisFilter', queryAnalysis.analyse_queries_filter)
    ipcMain.handle('engine:connectionAnalysis', connectionAnalysis.get_current_conn_analysis)
    ipcMain.handle('engine:writeLoadAnalysis', writeLoadAnalysis.get_write_load_analysis)
    ipcMain.handle('engine:clusterEventAnalysis', clusterEventAnalysis.analyse_events)
  } catch (error) {
    console.error(error)
  }

  createWindow()
  setupLocalFilesNormalizerProxy()

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
    console.log(nativeTheme.shouldUseDarkColors)
  })
}).catch(e => {
  dialog.showErrorBox("Error", e)
})

// Quit when all windows are closed, except on macOS.
// There, it's common for applications and their menu bar to stay active until
// the user quits  explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

// If your app has no need to navigate or only needs to navigate to known pages,
// it is a good idea to limit navigation outright to that known scope,
// disallowing any other kinds of navigation.
const allowedNavigationDestinations = "https://my-electron-app.com"
app.on("web-contents-created", (event, contents) => {
  contents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl)

    if (!allowedNavigationDestinations.includes(parsedUrl.origin)) {
      event.preventDefault()
    }
  })
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.