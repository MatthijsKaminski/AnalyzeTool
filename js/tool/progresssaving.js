"use strict";

class SavingProgress{


    static showProgress(){
        SavingProgress.setProgress(0);
        $('#saveModal').modal('show');
    }

    static hideProgress(){
        SavingProgress.setProgress(99);
        setTimeout(function () {
            $('#saveModal').modal('hide');
        },1000)

    }
    
    static increaseProgress(value){
        var element = document.getElementById("progressSave");
        var progress = parseInt(element.style.width.substring(0,element.style.width.length -1));
        progress += value;
        SavingProgress.setProgress(progress);
    }

    static setProgress(value){
        var element = document.getElementById("progressSave");
        element.style.width = "" +value +"%"
        console.log(element.style.width);
    }
}