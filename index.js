const {ipcRenderer} = require('electron')

const getGeoLocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject)
  })
}

const getWeather = (position) => {
  const apiKey = '781969e20c5d295ae9bd8da62df0d3f7'
  const location = `${position.coords.latitude},${position.coords.longitude}`
  const url = `https://api.forecast.io/forecast/${apiKey}/${location}`

  return window.fetch(url).then((response) => {
    return response.json()
  })
}

const updateWeather = () => {
  getGeoLocation().then(getWeather).then(function (weather) {
    ipcRenderer.send('weather', weather)
  })

  const fiveMinutes = 5 * 60 * 1000
  setTimeout(updateWeather, fiveMinutes)
}

updateWeather()
