import './modal.css';

/*
    modal is just a boiler plate which can be used by any js file
    The content of the modal is build completely in the parent js file
    use $(#modal-content).html() to add the values
*/
const closeModal = () => {
    $('#modal-dialog').css('display', 'none');
    $('#modal-content').empty();
}

const modal = (content) => {
    if (!$('#modal-dialog').length) {
        $('body').append(
            `<div id="modal-dialog">
                <div class="modal-container">
                    <span id="close-modal-dialog">&times;</span>
                    <div id="modal-content"></div>
                </div>
            </div>`
        )
        $('#modal-content').html(content);
        $('#close-modal-dialog').on('click', function () {
            closeModal();
        });

        $('#modal-dialog').on('click', function (event) {
            if ($(event.target).is($('#modal-dialog'))) {
                closeModal();
            }
        })
    } else {
        $('#modal-dialog').css('display', 'block');
        $('#modal-content').html(content);
    }
}

export default modal;
export { closeModal };