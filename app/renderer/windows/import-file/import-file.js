const toast = require('../../utils/toast/toast');
window.onload = function () {
    let uploadedButton = document.getElementById('upload');
    let uploadFile = document.getElementById('file-input');

    $('#file-input').on('change', function () {
        let filename = $(this).val();
        if (filename) {
            toast('success', 'File imported successfully');
        }
    });

    uploadedButton.addEventListener('click', () => {
        if (uploadFile.files[0]) {
            localStorage.setItem('filePath', uploadFile.files[0].path);
            window.location.href = '../bank-statement-preview/bank-stmt-preview.html';
        } else {
            toast('error', 'please fill the input');
        }
    });
}  
