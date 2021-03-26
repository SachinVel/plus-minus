const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const url = require('url')
const Config = require('./config/config');
const LicenseValidation = require('./app/main/license-validation/license-validation');
let window = null;

const processRendererMessage = function (message) {
  switch (message.type) {
    case 'userRegisterSuccessful':
      LicenseValidation.persistData(message).then(() => {
        preprocess();
      });
      break;
    case 'tryAgain':
      //start preprocess once again
      preprocess();
      break;
    case 'cancel':
      window.close();
      break;
  }
}
// Event handler for asynchronous incoming messages from renderer
ipcMain.on('asynchronous-message', (event, message) => {
  processRendererMessage(message);
});

// In the Main process.
ipcMain.on('synchronous-message', (event, properyName) => {
  event.returnValue = Config.getProperty(properyName);
})

// Wait until the app is ready
app.once('ready', () => {
  preprocess();
})


const preprocess = async function () {
  //function to check user status before opening application
  if (window === null) {
    // Create a new window
    window = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true  // For enabling remote module in windows os
      },
      backgroundColor: '#fff',
      // Don't show the window until it's ready, this prevents any white flickering
      show: false
    });
  }

  let userStatus = await LicenseValidation.getUserStatus();
  let windowWidth, windowHeight, animate;

  if (userStatus == 'validUser') {
    //open application window
    windowWidth = 1100;
    windowHeight = 600;
    animate = false;
    window.loadURL(url.format({
      pathname: path.join(__dirname, './dist/application-index.html'),
      protocol: 'file:',
      slashes: true
    }));
    window.setSize(windowWidth, windowHeight, animate);
  } else {
    //open authentication window
    windowWidth = 500;
    windowHeight = 300;
    animate = false;
    window.loadURL(url.format({
      pathname: path.join(__dirname, './dist/authentication-index.html'),
      protocol: 'file:',
      slashes: true
    }));
    window.webContents.on('did-finish-load', () => {
      // send message to renderer process
      window.webContents.send('page-load', userStatus);
    });
    window.setSize(windowWidth, windowHeight, animate);
  }

  window.setMenuBarVisibility(false);

  window.once('ready-to-show', () => {
    window.show();
  })
}