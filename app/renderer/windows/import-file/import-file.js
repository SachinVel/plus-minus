import toast from '../../utils/toast/toast';
import modal from '../../utils/modal/modal';
import './import-file.css';
import img from '../../../assets/images/upload-format.jpg';
import Faq from '../../modals/faq/faq';
import Index from '../../application-index';
import importFileHtml from './import-file.html';


const ImportFile = new function () {
    this.init = function () {
        let uploadedButton = document.getElementById('upload');
        let uploadFile = document.getElementById('file-input');
        let uploadFileWrapper = document.getElementById('file-input-wrapper');
        let optimalSheet = document.getElementById('optimal-sheet');
        let faqBtn = document.getElementById('faq-btn');
        let contactBtn = document.getElementById('contact-btn');

        $('#file-input').on('change', function () {
            if (uploadFile.files[0]) {
                toast('success', 'File imported successfully');
                $('#file-input-wrapper').attr('content', uploadFile.files[0].name)
            } else {
                toast('warning', 'File has been removed');
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
            let htmlContent = `<h1>Optimal Sheet</h1>
                <img id="optimal-spread-sheet" src=${img} width="200" height="40" alt="optimal spread sheet">`;
            modal(htmlContent);
        });

        uploadedButton.addEventListener('click', () => {
            let bankNameInput = $('#bank-name-input');
            let accountNumberInput = $('#account-num-input');
            if (uploadFile.files[0] && accountNumberInput.val().toString().length > 0 && bankNameInput.val().toString().length > 0) {
                localStorage.setItem('filePath', uploadFile.files[0].path);
                localStorage.setItem('accountNumber', accountNumberInput.val().toString());
                localStorage.setItem('bankName', bankNameInput.val().toString());
                Index.navigateTo('bank-statement-preview');
            } else {
                toast('error', 'please fill the input');
            }
        });

        faqBtn.addEventListener('click', function () {
            modal(Faq.getHtmlContent());
            Faq.bindListener();
        });

        contactBtn.addEventListener('click', function () {
            let contactHtmlContent = '<div class="contact-container">' +
                '<i class="fa fa-user contact-icon" aria-hidden="true"></i>' +
                '<span class="contact-text">For enquiries, write to us at   <span class="contact-mail">plusminusorg03@gmail.com</span></span>' +
                '</div>';
            modal(contactHtmlContent);
        });

    }

    this.getHtmlContent = function () {
        return importFileHtml;
    }
}

export default ImportFile;
