window.$ = window.jQuery = require('jquery');

const toast = (type, message) => {
    if (!type || !message) {
        console.error('dev-error: enter type and message. type can be error, warning, and success');
        return;
    }
    $('body').append(`<div class='toast-message ${type}'>${message}</div>`);
    setTimeout(() => {
        if ($('.toast-message')) {
            $('.toast-message').remove();
        }
    }, 3000);
}

module.exports = toast;