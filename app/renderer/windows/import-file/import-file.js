const toast = require("../../utils/toast/toast");

let filePath = null;

window.onload = function () {
    let uploadedButton = document.getElementById('upload');
    let uploadFile = document.getElementById('file-input');

    $("#file-input").on('change', function () {
        toast('success', 'File imported successfully');
    });

    uploadedButton.addEventListener('click', () => {
        filePath = uploadFile.files[0].path;
        if (filePath != null) {
            localStorage.setItem('filePath', filePath);
            window.location.href = '../bank-statement-preview/bank-stmt-preview.html';
        } else {
            alert('please fill the input');
        }
    });
}  
