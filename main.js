const {app, BrowserWindow, ipcMain, Tray} = require('electron')
const path = require('path')

const assetsDirectory = path.join(__dirname, 'assets')

let tray = undefined
let window = undefined

// Don't show the app in the doc
app.dock.hide()

app.on('ready', () => {
  createTray()
  createWindow()
})

// Quit the app when the window is closed
app.on('window-all-closed', () => {
  app.quit()
})

const createTray = () => {
  tray = new Tray(path.join(assetsDirectory, 'sunTemplate.png'))
  tray.on('right-click', toggleWindow)
  tray.on('double-click', toggleWindow)
  tray.on('click', function (event) {
    toggleWindow()

    // Show devtools when command clicked
    if (window.isVisible() && process.defaultApp && event.metaKey) {
      window.openDevTools({mode: 'detach'})
    }
  })
}

const getWindowPosition = () => {
  const windowBounds = window.getBounds()
  const trayBounds = tray.getBounds()

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 4)

  return {x: x, y: y}
}

const createWindow = () => {
  window = new BrowserWindow({
    width: 300,
    height: 450,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      // Prevents renderer process code from not running when window is
      // hidden
      backgroundThrottling: false
    }
  })
  window.loadURL(`file://${path.join(__dirname, 'index.html')}`)

  // Hide the window when it loses focus
  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide()
    }
  })
}

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  const position = getWindowPosition()
  window.setPosition(position.x, position.y, false)
  window.show()
  window.focus()
}

ipcMain.on('show-window', () => {
  showWindow()
})

ipcMain.on('weather-updated', (event, weather) => {
  // Show "feels like" temperature in tray
  tray.setTitle(`${Math.round(weather.currently.apparentTemperature)}°`)

  // Show summary and last refresh time as hover tooltip
  const time = new Date(weather.currently.time).toLocaleTimeString()
  tray.setToolTip(`${weather.currently.summary} at ${time}`)

  // Update icon for different weather types
  switch (weather.currently.icon) {
    case 'cloudy':
    case 'fog':
    case 'partly-cloudy-day':
    case 'partly-cloudy-night':
      tray.setImage(path.join(assetsDirectory, 'cloudTemplate.png'))
      break
    case 'rain':
    case 'sleet':
    case 'snow':
      tray.setImage(path.join(assetsDirectory, 'umbrellaTemplate.png'))
      break
    case 'clear-night':
      tray.setImage(path.join(assetsDirectory, 'moonTemplate.png'))
      break
    case 'wind':
      tray.setImage(path.join(assetsDirectory, 'flagTemplate.png'))
      break
    case 'clear-day':
    default:
      tray.setImage(path.join(assetsDirectory, 'sunTemplate.png'))
  }
})
