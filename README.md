# Tray Example

An example app for building a native-looking Mac OS X tray app with a popover
using [Electron](http://electron.atom.io).

The app shows the weather for the current location and refreshes every 10
minutes.

Built with [photon](http://photonkit.com).
Uses the [Dark Sky Forecast API](https://developer.forecast.io).

## Running

```sh
git clone https://github.com/kevinsawicki/tray-example
cd tray-example
npm install
npm start
```

## Packaging

```sh
npm run package
open out/Weathered-darwin-x64/Weathered.app
```

![screenshot](https://cloud.githubusercontent.com/assets/671378/15033544/97011f38-1220-11e6-9611-1571063fe107.png)
