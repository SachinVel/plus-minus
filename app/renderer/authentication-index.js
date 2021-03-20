import UserRegister from './windows/user-register/user-register';
import errorMessage from './windows/error-mesage/error-message';
const electron = require('electron');
const ipc = electron.ipcRenderer;
import './common.css';
import toast from './utils/toast/toast';

const Index = new function () {

    window.onload = function () {
        bindIpc();
    }

    const bindIpc = function () {
        ipc.on('page-load', (event, pageType) => {
            Index.navigateTo(pageType);
        });
    }

    let title = {
        'invalidUser': 'Invalid User',
        'userFirstTime': 'User SignUp',
        'internetConnectionNeeded' : 'No Internet',
        'licenceRenew' : 'Renew Licence',
        'appError' : 'internalError'
    }

    this.informMain = function (message) {
        ipc.send('asynchronous-message', message);
    }

    this.navigateTo = function (location) {
        let message;
        switch (location) {
            case 'invalidUser':
                $('body').html(
                    errorMessage.getHtmlContent()
                );
                message = 'Application has been compromised. Contact support to resolve the issue.';
                errorMessage.init(message);
                break;
            case 'userFirstTime':
                $('body').html(
                    UserRegister.getHtmlContent()
                );
                UserRegister.init();
                break;
            case 'licenceRenew':
                $('body').html(
                    UserRegister.getHtmlContent()
                );
                UserRegister.init();
                break;
            case 'appError':
                $('body').html(
                    errorMessage.getHtmlContent()
                );
                message = 'Some error occured in the app. Contact support to resolve the issue.';
                errorMessage.init(message);
                break;
            case 'internetConnectionNeeded':
                $('body').html(
                    errorMessage.getHtmlContent()
                );
                message = 'Please connect to internet and Try again.';
                errorMessage.init(message);
                break;
        }
        $('#page-title').text(title[location]);
    }
}

export default Index;