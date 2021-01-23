const electron = require('electron'); 
const path = require('path'); 
const analyser = require('../js/analyser');

const dialog = electron.remote.dialog; 

let filePath = null;

window.onload = function(){

    // var fileInputButton = document.getElementById('file-input'); 
    var uploadedButton = document.getElementById('upload');
  
    // fileInputButton.addEventListener('click', () => { 
    //     // If the platform is 'win32' or 'Linux' 
    //     if (process.platform !== 'darwin') { 
    //         dialog.showOpenDialog({ 
    //             title: 'Select the File to be uploaded', 
    //             defaultPath: path.join(__dirname), 
    //             buttonLabel: 'Upload', 
    //             filters: [ 
    //                 { 
    //                     name: 'Excel Files', 
    //                     extensions: ['xls', 'xlsx'] 
    //                 }, ],
    //             properties: ['openFile'] 
    //         }).then(file => {
    //             if (!file.canceled) { 
    //             let bankStatementFilePath = file.filePaths[0].toString(); 
    //             analyser.bankStatementAnalyser.anaylseFile(bankStatementFilePath);
    //             }   
    //         }).catch(err => { 
    //             console.error(err);
    //         }); 
    //     } 
    //     else { 
    //         // If the platform is 'darwin' (macOS) 
    //         dialog.showOpenDialog({ 
    //             title: 'Select the File to be uploaded', 
    //             defaultPath: path.join(__dirname, '../assets/'), 
    //             buttonLabel: 'Upload', 
    //             filters: [ 
    //                 { 
    //                     name: 'Excel Files', 
    //                     extensions: ['xlsx','xls'] 
    //                 }, ],
    //             properties: ['openFile', 'openDirectory'] 
    //         }).then(file => {
    //             if (!file.canceled) { 
    //                 filePath = file.filePaths[0].toString();
    //             }   
    //         }).catch(err => { 
    //             console.log(err) 
    //         }); 
    //     } 
    // });
        
    // uploadedButton.addEventListener('click', () => {
    //     location.href = "consolidation-view.html";
    // });

    let uploadFile = document.getElementById("file-input");

    uploadedButton.addEventListener('click',()=>{
        let bankType = document.getElementById("bank-type-input").value;
        filePath = uploadFile.files[0].path;
        console.log("File path : ",filePath);
        if( filePath!=null && bankType ){
            analyser.bankStatementAnalyser.anaylseFile(filePath,bankType).then((consolidationData)=>{
                localStorage.setItem("consolidationData",JSON.stringify(consolidationData));
                localStorage.setItem("bankType",bankType);
                window.location.href = "consolidation-view.html";
            }).catch(error=>{
            console.error("Error in analysing bank statement : ",error);
            });
        }else{
            alert("please fill the input");
        }
        
    });
}  
