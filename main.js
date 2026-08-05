const { app, BrowserWindow, shell } = require('electron')
const path = require('path')

let mainWin = null

function createWindow() {
  mainWin = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, "build/app.icns")
  })

  // 加载首页
  mainWin.loadFile(path.join(__dirname, "index.html"))

  // 拦截内部跳转，新开子窗口（适配你页面window.location跳转逻辑）
  mainWin.webContents.on('will-navigate', (e, url) => {
    if (url.startsWith('file://')) {
      e.preventDefault()
      const childWin = new BrowserWindow({
        width: 1280,
        height: 800,
        parent: mainWin,
        modal: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
      })
      childWin.loadFile(url.replace('file://', ''))
      // 子窗口关闭时通知父页面更新进度
      childWin.on('close', () => {
        mainWin.webContents.reload()
      })
    }
  })

  // 禁止外部链接打开浏览器
  mainWin.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})