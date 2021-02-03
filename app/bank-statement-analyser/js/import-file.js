const electron = require('electron');

let filePath = null;

window.onload = function(){

    var uploadedButton = document.getElementById('upload');

    let uploadFile = document.getElementById("file-input");

    uploadedButton.addEventListener('click',()=>{
        filePath = uploadFile.files[0].path;
        if( filePath!=null ){
            localStorage.setItem("filePath",filePath);
            window.location.href = "bank-stmt-preview.html";
        }else{
            alert("please fill the input");
        }
        
    });
}  
