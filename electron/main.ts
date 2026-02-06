import { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage } from 'electron'
import path from 'node:path'
import fs from 'node:fs'

// Setup Logging
const logPath = path.join(app.getPath('userData'), 'app-launch.log')
function log(msg: string) {
  try {
    fs.appendFileSync(logPath, `${new Date().toISOString()} - ${msg}\n`)
  } catch (e) {
    // ignore logging errors
  }
}

// Global Error Handlers
process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.stack || error.message}`)
  // Keep app running if possible, or quit gracefully
  // app.quit() 
})

log('App starting...')

process.env.DIST = path.join(__dirname, '../renderer-dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

log(`Environment: DIST=${process.env.DIST}, VITE_PUBLIC=${process.env.VITE_PUBLIC}`)

let win: BrowserWindow | null
let tray: Tray | null = null

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  log('Creating window...')
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width } = primaryDisplay.workAreaSize
  
  // Widget Panel Size
  const WIDGET_WIDTH = 1000
  const WIDGET_HEIGHT = 800

  const iconPath = path.join(process.env.VITE_PUBLIC, 'icon.ico')
  log(`Window icon path: ${iconPath}`)

  win = new BrowserWindow({
    width: WIDGET_WIDTH,
    height: WIDGET_HEIGHT,
    x: width - WIDGET_WIDTH - 20, // 20px padding from right
    y: 20, // 20px padding from top
    frame: false, // Transparent needs frameless
    transparent: true,
    backgroundColor: '#00000000', // Explicitly set transparent background
    hasShadow: true, // Enable shadow for better visibility
    icon: iconPath,
    type: 'toolbar', 
    skipTaskbar: true, 
    resizable: false, // Fixed size for now to maintain layout
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    const indexHtml = path.join(process.env.DIST, 'index.html')
    log(`Loading file: ${indexHtml}`)
    win.loadFile(indexHtml)
  }
  
  win.webContents.on('did-finish-load', () => {
    log('Window loaded successfully')
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    log(`Failed to load window: ${errorCode} - ${errorDescription}`)
  })

  // Prevent closing, just hide
  win.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      win?.hide()
    }
    return false
  })
}

function createTray() {
  log('Creating tray...')
  const iconPath = path.join(process.env.VITE_PUBLIC, 'icon.ico')
  log(`Tray icon path: ${iconPath}`)

  try {
      const icon = nativeImage.createFromPath(iconPath)
      
      tray = new Tray(icon)
      
      const contextMenu = Menu.buildFromTemplate([
        { 
          label: '显示/隐藏', 
          click: () => {
            if (win?.isVisible()) {
              win.hide()
            } else {
              win?.show()
            }
          } 
        },
        { type: 'separator' },
        { 
          label: '退出', 
          click: () => {
            app.isQuitting = true
            app.quit()
          } 
        }
      ])

      tray.setToolTip('GlassFlow Desktop')
      tray.setContextMenu(contextMenu)

      tray.on('click', () => {
        if (win?.isVisible()) {
            win.hide()
        } else {
            win?.show()
        }
      })
      log('Tray created successfully')
  } catch (error: any) {
      log(`Failed to create tray: ${error.message}`)
  }
}

// IPC Handlers
ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  win?.setIgnoreMouseEvents(ignore, options)
})

// Resize window for collapse/expand
ipcMain.on('resize-window', (event, { width, height }) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.setSize(width, height, true) // animate
})

// Auto-start handlers
ipcMain.handle('get-auto-start', () => {
  return app.getLoginItemSettings().openAtLogin
})

ipcMain.on('set-auto-start', (event, enable) => {
  app.setLoginItemSettings({
    openAtLogin: enable,
    path: app.getPath('exe'),
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Ignore SSL certificate errors in development
app.commandLine.appendSwitch('ignore-certificate-errors')
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  log(`Certificate Error: ${error} for ${url}`)
  event.preventDefault()
  callback(true)
})

app.whenReady().then(() => {
  log('App ready event fired')
  createWindow()
  createTray()
}).catch(e => {
    log(`App ready error: ${e.message}`)
})

// Add property to app to track quitting state
declare global {
  namespace Electron {
    interface App {
      isQuitting: boolean;
    }
  }
}
app.isQuitting = false
