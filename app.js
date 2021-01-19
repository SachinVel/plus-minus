const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

let window = null

require('electron-reload')(__dirname);

console.log("HI! Welcome to electron!\n");

// Wait until the app is ready
app.once('ready', () => {
  // Create a new window
  window = new BrowserWindow({
    webPreferences: {
        nodeIntegration: true
    },
    // Set the initial width to 500px
    width: 500,
    // Set the initial height to 400px
    height: 400,
    
    backgroundColor: "#fff",
    // Don't show the window until it's ready, this prevents any white flickering
    show: false
  })

  window.loadURL(url.format({
    pathname: path.join(__dirname, 'app/bank-statement-analyser/importFile.html'),
    protocol: 'file:',
    slashes: true
  }))

  window.once('ready-to-show', () => {
    window.show()
  })
})
