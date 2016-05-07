"use strict";

class ErrorBox{

    static showError(error){
        $('#alertbox').html(
            "<div class='alert alert-danger .fade .in' role='alert'> " +
            "<button type='button' class='close' data-dismiss='alert' aria-label='Close'> " +
            "<span aria-hidden='true'>&times;</span> " +
            "</button>" +
            error+ "</div>");
    }
}