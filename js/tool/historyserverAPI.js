"use strict";

class HistoryServer {
  constructor(url) {
    this.url = this.correctURL(url);
  }

  correctURL(url){
    if(!url.startsWith("http://")){
      url = "http://" + url;
    }
    return url;
  }

  /**
  * FETCH SERVER INFO
  **/
  fetchServerInfo(func){
    this.doAjaxRequest("/ws/v1/history/info", func);
  }

  /**
  * FETCH JOBS
  **/
  fetchJobsOnServer(func){
    console.log("fetch jobs on server");
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs", func);
  }

  /**
  * FETCH INFO OF A SPECIFIC JOB
  **/
  fetchJobInfo(jobID, func){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/" + jobID, func);
  }

  /**
  * FETCH ATTEMPTS OF A SPECIFIC JOB
  **/

  fetchJobAttempts(jobID){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/"+ jobID +"/jobattempts" , this.fetchJobAttemptsReady);
  }

  /**
  * FETCH COUNTERS OF A SPECIFIC JOB
  **/

  fetchJobCounters(jobID, func){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/"+ jobID +"/counters" , func);
  }

  /**
  * FETCH TASKS OF A SPECIFIC JOB
  **/

  fetchJobTasks(jobID, func){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/"+ jobID +"/tasks" , func);
  }

  /**
  * FETCH TASKINFO OF A SPECIFIC JOB AND TASK
  **/

  fetchTaskInfo(jobID, taskID, func){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/"+ jobID +"/tasks/" + taskID , func);
  }

  /**
  * FETCH TASK COUNTERS OF A SPECIFIC JOB AND TASK
  **/

  fetchTaskCounters(jobID, taskID,func){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/"+ jobID +"/tasks/" + taskID + "/counters" , func);
  }

  /**
  * FETCH TASK ATTEMPTS OF A SPECIFIC JOB AND TASK
  **/

  fetchTaskAttempts(jobID, taskID, func){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/"+ jobID +"/tasks/" + taskID + "/attempts" , func);
  }

  /**
  * FETCH TASK ATTEMPT INFO OF A SPECIFIC JOB AND TASK
  **/

  fetchTaskAttemptInfo(jobID, taskID, attemptID, func){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/"+ jobID +"/tasks/" + taskID + "/attempts/" + attemptID , func);
  }

  /**
  * FETCH TASK ATTEMPT COUNTERS OF A SPECIFIC JOB AND TASK
  **/

  fetchTaskAttemptCounters(jobID, taskID, attemptID,func){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/"+ jobID +"/tasks/" + taskID + "/attempts/" + attemptID +"/counters" , func);
  }

  /**
  * DO AN AJAX REQUEST AND CALL FUNC WHEN REQUEST COMPLETE
  **/
  doAjaxRequest(path, func){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        //console.log("ajax responseText " + xhttp.responseText);
        func(xhttp.responseText);
      }else{
        if (xhttp.readyState == 4 ) {
          ErrorBox.showError("could not connect to server");

        }else{
          //Do nothing
        }
      }
    };

    xhttp.onerror = function (e) {
      ErrorBox.showError("could not connect to server");
    }

    xhttp.ontimeout = function (e) {
      ErrorBox.showError("could not connect to server");
    }
    try {
      xhttp.open("GET", this.url + path, true);
      xhttp.setRequestHeader("Accept", "application/json");
      xhttp.send();
    }catch (e){
      //alert("could not connect to server");
      console.log("catched error")
    }
  }
}
