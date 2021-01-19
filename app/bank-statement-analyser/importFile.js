const electron = require('electron'); 
const path = require('path'); 
const analyser = require('./analyser'); 

const dialog = electron.remote.dialog; 
  
var uploadFile = document.getElementById('upload'); 
  
uploadFile.addEventListener('click', () => { 
    // If the platform is 'win32' or 'Linux' 
    if (process.platform !== 'darwin') { 
        dialog.showOpenDialog({ 
            title: 'Select the File to be uploaded', 
            defaultPath: path.join(__dirname), 
            buttonLabel: 'Upload', 
            filters: [ 
                { 
                    name: 'Excel Files', 
                    extensions: ['xls', 'xlsx'] 
                }, ],
            properties: ['openFile'] 
        }).then(file => {
            if (!file.canceled) { 
              let bankStatementFilePath = file.filePaths[0].toString(); 
              analyser.bankStatementAnalyser.anaylseFile(bankStatementFilePath);
            }   
        }).catch(err => { 
            console.error(err);
        }); 
    } 
    else { 
        // If the platform is 'darwin' (macOS) 
        dialog.showOpenDialog({ 
            title: 'Select the File to be uploaded', 
            defaultPath: path.join(__dirname, '../assets/'), 
            buttonLabel: 'Upload', 
            filters: [ 
                { 
                    name: 'Excel Files', 
                    extensions: ['xlsx','csv'] 
                }, ],
            properties: ['openFile', 'openDirectory'] 
        }).then(file => {
            if (!file.canceled) { 
              let bankStatementFilePath = file.filePaths[0].toString();  
              analyser.bankStatementAnalyser.anaylseFile(bankStatementFilePath);
            }   
        }).catch(err => { 
            console.log(err) 
        }); 
    } 
});