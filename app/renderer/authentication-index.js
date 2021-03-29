const electron = require('electron');
const ipc = electron.ipcRenderer;
import UserRegister from './windows/user-register/user-register';
import errorMessage from './windows/error-mesage/error-message';
import './common.css';

const AuthenticationIndex = new function () {

    window.onload = function () {
        bindIpc();
    }

    const bindIpc = function () {
        ipc.on('page-load', (event, pageType) => {
            AuthenticationIndex.navigateTo(pageType);
        });
    }

    let title = {
        'invalidUser': 'Invalid User',
        'userFirstTime': 'User SignUp',
        'internetConnectionNeeded': 'No Internet',
        'licenceRenew': 'Renew Licence',
        'appError': 'internalError'
    }

    this.informMain = function (message) {
        ipc.send('asynchronous-message', message);
    }

    this.getPropertyFromMain = function (propertyName) {
        return ipc.sendSync('synchronous-message', propertyName);
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

export default AuthenticationIndex;