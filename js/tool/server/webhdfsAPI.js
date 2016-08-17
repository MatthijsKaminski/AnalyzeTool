"use strict";
class Webhdfs{
    constructor(server, userDirectory, namenode){
        this.url = this.correctURL(server);
        this.userDirectory = userDirectory;
        this.namenode = namenode;
    }

    update(server, userDirectory, namenode){
        this.url = this.correctURL(server);
        this.userDirectory = userDirectory;
        this.namenode = namenode;
    }

    correctURL(url){
        if(!url.startsWith("http://")){
            url = "http://" + url;
        }
        return url;
    }

    fetchTaskAttemptStatCounters(taskattemptid, func){
        this.doAjaxRequest("/webhdfs/v1/" + this.userDirectory + "/stats/"+ taskattemptid + "?op=OPEN&namenoderpcaddress=" + this.namenode, func);
    }

    /**
     * DO AN AJAX REQUEST AND CALL FUNC WHEN REQUEST COMPLETE
     **/
    doAjaxRequest(path, func){
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                // console.log("ajax responseText " + xhttp.responseText);
                func(xhttp.responseText);
            }else{
                if (xhttp.readyState == 4 ) {
                    ErrorBox.showError("could not connect to hdfs server");
                    //func(undefined);
                }else{
                    //Do nothing
                }
            }
        };

        xhttp.onerror = function (e) {
            ErrorBox.showError("could not connect to hdfs server");
            func("error");
        }

        xhttp.ontimeout = function (e) {
            ErrorBox.showError("could not connect to hds server");
            func("error");
        }
        try {
            xhttp.open("GET", this.url + path, true);
            xhttp.setRequestHeader("Accept", "application/json");
            xhttp.send();
        }catch (e){
            //alert("could not connect to server");
            console.log("catched error")
            func("error");
        }
    }
}