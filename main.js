const {app, BrowserWindow, ipcMain, Tray} = require('electron')
const path = require('path')

let tray = undefined
let window = undefined

app.dock.hide()
app.on('ready', () => {
  createTray()
  createWindow()
})

ipcMain.on('weather', (event, weather) => {
  const {icon, summary, temperature} = weather.currently
  tray.setTitle(`${Math.round(temperature)}°`)
  tray.setToolTip(summary)

  switch (icon) {
    case 'cloudy':
    case 'fog':
    case 'partly-cloudy-day':
    case 'partly-cloudy-night':
      tray.setImage(path.join(__dirname, 'assets', 'cloudTemplate.png'))
      break
    case 'rain':
    case 'sleet':
    case 'snow':
      tray.setImage(path.join(__dirname, 'assets', 'umbrellaTemplate.png'))
      break
    case 'clear-night':
      tray.setImage(path.join(__dirname, 'assets', 'moonTemplate.png'))
      break
    case 'wind':
      tray.setImage(path.join(__dirname, 'assets', 'flagTemplate.png'))
      break
    case 'clear-day':
    default:
      tray.setImage(path.join(__dirname, 'assets', 'sunTemplate.png'))
  }
})

const createTray = () => {
  tray = new Tray(path.join(__dirname, 'assets', 'sunTemplate.png'))
  tray.on('click', (event, bounds) => toggleWindow(bounds))
  tray.on('double-click', (event, bounds) => toggleWindow(bounds))
}

const createWindow = () => {
  window = new BrowserWindow({
    width: 300,
    height: 450,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true
  })
  window.loadURL(`file://${path.join(__dirname, 'index.html')}`)
  window.on('blur', () => window.hide())
}

const toggleWindow = (trayIconBounds) => {
  const windowBounds = window.getBounds()
  const x = Math.round(trayIconBounds.x + (trayIconBounds.width / 2) - (windowBounds.width / 2))
  const y = Math.round(trayIconBounds.y + trayIconBounds.height + 4)

  window.setPosition(x, y, false)
  window.isVisible() ? window.hide() : window.show()
}
