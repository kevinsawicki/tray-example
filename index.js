const {ipcRenderer, shell} = require('electron')

const getGeoLocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject)
  })
}

const getWeather = (position) => {
  // FIXME replace with your own API key
  // Register for one at https://developer.forecast.io/register
  const apiKey = '781969e20c5d295ae9bd8da62df0d3f7'

  const location = `${position.coords.latitude},${position.coords.longitude}`
  const url = `https://api.forecast.io/forecast/${apiKey}/${location}`

  return window.fetch(url).then((response) => {
    return response.json()
  })
}

const render = (weather) => {
  const currently = weather.currently

  document.querySelector('.js-summary').textContent = currently.summary

  document.querySelector('.js-temperature').textContent = `${Math.round(currently.temperature)}° F`
  document.querySelector('.js-apparent').textContent = `${Math.round(currently.apparentTemperature)}° F`

  document.querySelector('.js-wind').textContent = `${Math.round(currently.windSpeed)} mph`
  document.querySelector('.js-wind-direction').textContent = getWindDirection(currently.windBearing)

  document.querySelector('.js-dewpoint').textContent = `${Math.round(currently.dewPoint)}° F`
  document.querySelector('.js-humidity').textContent = `${Math.round(currently.humidity * 100)}%`

  document.querySelector('.js-visibility').textContent = `${Math.round(currently.windSpeed)} miles`
  document.querySelector('.js-cloud-cover').textContent = `${Math.round(currently.cloudCover * 100)}%`

  document.querySelector('.js-precipitation-chance').textContent = `${Math.round(currently.precipProbability * 100)}%`
  document.querySelector('.js-precipitation-rate').textContent = `${Math.round(currently.precipIntensity * 100)}%`
}

const getWindDirection = (direction) => {
  if (direction < 45) return 'NNE'
  if (direction === 45) return 'NE'

  if (direction < 90) return 'ENE'
  if (direction === 90) return 'E'

  if (direction < 135) return 'ESE'
  if (direction === 135) return 'SE'

  if (direction < 180) return 'SSE'
  if (direction === 180) return 'S'

  if (direction < 225) return 'SSW'
  if (direction === 225) return 'SW'

  if (direction < 270) return 'WSW'
  if (direction === 270) return 'W'

  if (direction < 315) return 'WNW'
  if (direction === 315) return 'NW'

  if (direction < 360) return 'NNW'
  return 'N'
}

const updateWeather = () => {
  getGeoLocation().then(getWeather).then(function (weather) {
    ipcRenderer.send('weather', weather)
    render(weather)
  })

  const fiveMinutes = 5 * 60 * 1000
  setTimeout(updateWeather, fiveMinutes)
}

document.addEventListener('click', (event) => {
  if (event.target.href) {
    shell.openExternal(event.target.href)
    event.preventDefault()
  }
})

updateWeather()
