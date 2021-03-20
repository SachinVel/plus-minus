import Index from '../../authentication-index';
import './error-message.css';
import errorMessageHtml from './error-message.html';

const errorMessage = new function(){
    this.init = function(message){
        $('#err-msg').text(message);
        $('#cancel-btn').on('click',function(event){
            Index.informMain({
                type : 'cancel'
            });
        });
        $('#try-agn-btn').on('click',function(event){
            Index.informMain({
                type : 'tryAgain'
            });
        });
    }
    this.getHtmlContent = function(){
        return errorMessageHtml;
    }
}
export default errorMessage;