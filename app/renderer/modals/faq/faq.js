import './faq.css';
import faqhtml from './faq.html';

const Faq = new function(){
    this.bindListener = function(){
        $('#import-page-faq').show();
        $('.js-faq-option').on('click',function(){
            let faqPageContentId = $(this).attr('data-page-id');
            $('.js-faq-page-content').hide();
            $('#'+faqPageContentId).show();
            $(this).siblings().removeClass('faq-page-option--selected');
            $(this).addClass('faq-page-option--selected');
        });
    }
    this.getHtmlContent = function(){
        return faqhtml;
    }
}

export default Faq;