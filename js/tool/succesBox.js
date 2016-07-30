"use strict";
class SuccessBox{

    static showSuccess(success){
        $('#succesbox').append(
            "<div class='alert alert-success .fade .in' id='" + succesBoxCounter +"' role='alert'> " +
            "<button type='button' class='close' data-dismiss='alert' aria-label='Close'> " +
            "<span aria-hidden='true'>&times;</span> " +
            "</button>" +
            success+ "</div>");
        var count = succesBoxCounter;
        setTimeout(function () {
            $('#'+ count).alert('close');
        },10000)
        succesBoxCounter++;
    }


}

var succesBoxCounter = 0;