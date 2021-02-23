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

    $('#file-input').on('change', function () {
        if (uploadFile.files[0]) {
            toast('success', 'File uploaded successfully!');
            $('#file-input-wrapper').attr('content', uploadFile.files[0].name)
        } else {
            toast('warning', 'File has been removed!');
            $('#file-input-wrapper').attr('content', 'Drag file here or click to select')
        }
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadFileWrapper.addEventListener(eventName, () => { $('#file-input-wrapper').css('border-color', 'var(--bsa-blue)'); }, false)
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadFileWrapper.addEventListener(eventName, () => { $('#file-input-wrapper').css('border-color', 'var(--bsa-grey)'); }, false)
    });

    optimalSheet.addEventListener('click', () => {
        let htmlContent = `<h2>Optimal Sheet</h2>
            <img id="optimal-spread-sheet" src=${img} alt="optimal spread sheet">`;
        modal(htmlContent);
    })

    uploadedButton.addEventListener('click', () => {
        let bankNameInput = $('#bank-name-input');
        let accountNumberInput = $('#account-num-input');
        if (uploadFile.files[0] && accountNumberInput.val().toString().length > 0 && bankNameInput.val().toString().length>0 ) {
            localStorage.setItem('filePath', uploadFile.files[0].path);
            localStorage.setItem('accountNumber', accountNumberInput.val().toString());
            localStorage.setItem('bankName', bankNameInput.val().toString());
            window.location.href = './bank-stmt-preview.html';
        } else {
            toast('error', 'Please enter all the information!');
        }
    });
}  
