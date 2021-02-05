const popup = new function(){

    let isElementInserted=false;
    let successCallback,failureCallback;

    const bindPopupListener = function(){
        $("#popup-accept-btn").on('click',function(event){
            if( successCallback ){
                successCallback();
            }
            $("#popup-container").hide();
        });
        $("#popup-reject-btn").on('click',function(event){
            if( failureCallback ){
                failureCallback();
            }
            $("#popup-container").hide();
        })
    }

    this.display = function(message,callback){
        if( !isElementInserted ){
            $("body").append(
                '<div class="popup-container" id="popup-container">'+
                    '<div class="popup-freezer"></div>'+
                    '<div class="popup-content">'+
                        '<div class="popup-message" id="popup-message">Are you sure you want to continue?</div>'+
                        '<div class="popup-btn-cotainer">'+
                            '<button class="popup-btn" id="popup-accept-btn">Yes</button>'+
                            '<button class="popup-btn" id="popup-reject-btn">No</button>'+
                        '</div>'+
                    '</div>'+
                '</div>'
            );
        }
        successCallback = callback.success;
        failureCallback = callback.reject;
        $("#popup-message").text(message);
        bindPopupListener();
        $("#popup-container").show();
    }
}