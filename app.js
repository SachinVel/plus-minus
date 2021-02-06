const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

let window = null

// require('electron-reload')(__dirname);

// Wait until the app is ready
app.once('ready', () => {
  // Create a new window
  window = new BrowserWindow({
    webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true  // For enabling remote module in windows os
    },
    // Set the initial width to 500px
    width: 1200,
    // Set the initial height to 400px
    height: 800,
    
    backgroundColor: "#fff",
    // Don't show the window until it's ready, this prevents any white flickering
    show: false
  })
  
  window.setMenuBarVisibility(false)

  window.loadURL(url.format({
    pathname: path.join(__dirname, '/app/bank-statement-analyser/html/import-file.html'),
    protocol: 'file:',
    slashes: true
  }))

  window.once('ready-to-show', () => {
    window.show()
  })
})
