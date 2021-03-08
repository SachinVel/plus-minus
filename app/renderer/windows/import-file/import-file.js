import toast from '../../utils/toast/toast';
import modal from '../../utils/modal/modal';
import './import-file.css';
import img from '../../../assets/images/upload-format.jpg';
import Faq from '../../modals/faq/faq';
import Index from '../../../index';
import importFileHtml from './import-file.html';
import {machineIdSync} from 'node-machine-id';
import moment from 'moment';
let crypto = require("crypto-js");
let true_id = machineIdSync({original: true})
const fs = require('fs');

fs.readFile('config.txt','utf8', function read(err, data) {
    if(data){
        if(data=="NOHACKS"){
            console.log("first time");
            // YOU HAVE TO CONNECT TO THE INTERNET TO GENERATE THE LICENSE KEY
            //POST CALL TO OUR SERVER BY SENDING TRUE_ID IN BODY FOR US TO STORE
            //WE RECEIVE A LIC_KEY, REG_TIMESTAMP, EXPIRY_TIMESTAMP FOR IT

            //HARDCODING VALUES FOR NOW
            let lic_key = '12ds3';
            let registered_timestamp = 1515114829505;
            let expiry_timestamp = 3015114829505;
            
            fs.writeFileSync('lic.txt',lic_key + "\r\n" + registered_timestamp + "\r\n" + expiry_timestamp, 'utf-8');
           
            let encrypted = crypto.AES.encrypt(JSON.stringify({true_id}),lic_key);
           // let decrypted = crypto.AES.decrypt(encrypted.toString(), lic_key).toString(crypto.enc.Utf8);
           
            fs.writeFileSync('config.txt',encrypted, 'utf-8');
            // fs.appendFileSync('config.txt', time,
        }

        else{
            let lic_content = [];
            fs.readFileSync('lic.txt', 'utf-8').split(/\r?\n/).forEach(function(line){
                lic_content.push(line);
        })

        if(crypto.AES.decrypt(data,lic_content[0]).toString(crypto.enc.Utf8)==true_id){
            let current_time_stamp = moment.now();
            if(current_time_stamp > parseInt(lic_content[1])){
                if(current_time_stamp > lic_content[2]){
                    console.log("trial ended");
                }
                else{
                console.log("still not tampered");
                fs.writeFileSync('lic.txt',lic_content[0] + "\r\n" + current_time_stamp + "\r\n" + lic_content[2], 'utf-8');
                //LET HIM IN
            }
        }
    }
            else{
                console.log("tampered");
            }
        }
    }
    else{
        console.log("tam");
    }
});

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
