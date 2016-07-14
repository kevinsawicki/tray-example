const {app, BrowserWindow, ipcMain, Tray} = require('electron')
const path = require('path')

const assetsDirectory = path.join(__dirname, 'assets')

let tray = undefined
let window = undefined

app.dock.hide()
app.on('ready', () => {
  createTray()
  createWindow()
})

const createTray = () => {
  tray = new Tray(path.join(assetsDirectory, 'sunTemplate.png'))
  tray.on('click', (event, bounds) => toggleWindow(bounds))
  tray.on('double-click', (event, bounds) => toggleWindow(bounds))
}

const getWindowPosition = () => {
  const windowBounds = window.getBounds()
  const trayBounds = tray.getBounds()
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))
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
      backgroundThrottling: false
    }
  })
  window.loadURL(`file://${path.join(__dirname, 'index.html')}`)
  window.on('blur', () => window.hide())
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
  const {icon, summary, temperature, time} = weather.currently
  tray.setTitle(`${Math.round(temperature)}°`)
  tray.setToolTip(`${summary} at ${new Date(time).toLocaleTimeString()}`)

  switch (icon) {
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
