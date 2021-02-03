window.$ = window.jQuery = require('jquery');

const toast = (type, message) => {
    if (!type || !message) {
        console.error('dev-error: enter type and message. type can be error, warning, and success');
        return;
    }
    let toastMessage = $(`<div class='toast-message ${type}'>${message}</div>`).appendTo('body');
    setTimeout(() => {
        if (toastMessage) {
            toastMessage.remove();
        }
    }, 3000);
}

module.exports = toast;