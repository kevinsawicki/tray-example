const {ipcRenderer, shell} = require('electron')

let previousWeather = undefined

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
  document.querySelector('.js-update-time').textContent = `at ${new Date(currently.time).toLocaleTimeString()}`

  document.querySelector('.js-temperature').textContent = `${Math.round(currently.temperature)}° F`
  document.querySelector('.js-apparent').textContent = `${Math.round(currently.apparentTemperature)}° F`

  document.querySelector('.js-wind').textContent = `${Math.round(currently.windSpeed)} mph`
  document.querySelector('.js-wind-direction').textContent = getWindDirection(currently.windBearing)

  document.querySelector('.js-dewpoint').textContent = `${Math.round(currently.dewPoint)}° F`
  document.querySelector('.js-humidity').textContent = `${Math.round(currently.humidity * 100)}%`

  document.querySelector('.js-visibility').textContent = `${Math.round(currently.windSpeed)} miles`
  document.querySelector('.js-cloud-cover').textContent = `${Math.round(currently.cloudCover * 100)}%`

  document.querySelector('.js-precipitation-chance').textContent = `${Math.round(currently.precipProbability * 100)}%`
  document.querySelector('.js-precipitation-rate').textContent = currently.precipIntensity
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

const isWeatherIdeal = (weather) => {
  // Precipipation is never ideal...
  if (weather.currently.precipIntensity !== 0) return false

  // Ideal weather is within 3 degress of the ideal temperature
  const idealTemperature = 70
  const feelsLikeTemperature = weather.currently.apparentTemperature
  return Math.abs(idealTemperature - feelsLikeTemperature) <= 3
}

const sendNotification = (weather) => {
  if (!isWeatherIdeal(weather)) return

  // Show notification if it is the first time checking the weather or if it was
  // previously not ideal but is now ideal
  if (previousWeather == null || !isWeatherIdeal(previousWeather)) {
    const summary = weather.currently.summary.toLowerCase()
    const feelsLike = Math.round(weather.currently.apparentTemperature)
    let notification = new Notification('Go outside', {
      body: `The weather is ${summary} and feels like ${feelsLike}° F`
    })

    // Show window when notification is clicked
    notification.onclick = () => {
      ipcRenderer.send('show-window')
    }
  }
}

const updateWeather = () => {
  getGeoLocation().then(getWeather).then((weather) => {
    // Use local time
    weather.currently.time = Date.now()

    ipcRenderer.send('weather-updated', weather)
    render(weather)
    sendNotification(weather)
    previousWeather = weather
  })
}

document.addEventListener('click', (event) => {
  if (event.target.href) {
    shell.openExternal(event.target.href)
    event.preventDefault()
  } else if (event.target.classList.contains('js-refresh-action')) {
    updateWeather()
  }
})

const tenMinutes = 10 * 60 * 1000
setInterval(updateWeather, tenMinutes)
updateWeather()
