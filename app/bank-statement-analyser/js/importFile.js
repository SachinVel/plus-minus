const electron = require('electron');
const path = require('path');
const analyser = require('../js/analyser');
const toast = require('../../common/js/toast');

const dialog = electron.remote.dialog;

let filePath = null;

window.onload = function () {
    toast("error", "im kishore");
    var uploadedButton = document.getElementById('upload');

    let uploadFile = document.getElementById("file-input");

    uploadedButton.addEventListener('click', () => {
        let bankType = document.getElementById("bank-type-input").value;
        filePath = uploadFile.files[0].path;
        if (filePath != null && bankType) {
            analyser.bankStatementAnalyser.anaylseFile(filePath, bankType).then((consolidationData) => {
                localStorage.setItem("consolidationData", JSON.stringify(consolidationData));
                localStorage.setItem("bankType", bankType);
                window.location.href = "consolidation-view.html";
            }).catch(error => {
                console.error("Error in analysing bank statement : ", error);
            });
        } else {
            alert("please fill the input");
        }

    });
}  
