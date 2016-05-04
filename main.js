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
  const {temperature} = weather.currently
  tray.setTitle(`${Math.round(temperature)}°`)
})

const createTray = () => {
  tray = new Tray(path.join(__dirname, 'assets', 'trayTemplate.png'))
  tray.setToolTip('Weather')
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
