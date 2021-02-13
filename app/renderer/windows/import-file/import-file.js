import toast from '../../utils/toast/toast';
import modal from '../../utils/modal/modal';
import './import-file.css';
import img from '../../../assets/images/optimal-sheet.jpg';

let filePath = null;

window.onload = function () {
    let uploadedButton = document.getElementById('upload');
    let uploadFile = document.getElementById('file-input');
    let uploadFileWrapper = document.getElementById('file-input-wrapper');
    let optimalSheet = document.getElementById('optimal-sheet');

    $("#file-input").on('change', function () {
        if (uploadFile.files[0]) {
            toast('success', 'File imported successfully');
            $("#file-input-wrapper").attr('content', uploadFile.files[0].name)
        } else {
            toast('warning', 'File has been removed');
            $("#file-input-wrapper").attr('content', 'Drag file here or click to select')
        }
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadFileWrapper.addEventListener(eventName, () => { $("#file-input-wrapper").css('border-color', "var(--bsa-blue)"); }, false)
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadFileWrapper.addEventListener(eventName, () => { $("#file-input-wrapper").css('border-color', "var(--bsa-grey)"); }, false)
    });

    optimalSheet.addEventListener('click', () => {
        let htmlContent = `<h1>Optimal Sheet</h1>
            <img id="optimal-spread-sheet" src=${img} alt="optimal spread sheet">`;
        modal(htmlContent);
    })

    uploadedButton.addEventListener('click', () => {
        filePath = uploadFile.files[0].path;
        if (filePath != null) {
            localStorage.setItem('filePath', filePath);
            window.location.href = './bank-stmt-preview.html';
        } else {
            alert('please fill the input');
        }
    });
}  
