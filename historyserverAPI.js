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

  fetchServerInfoReady(info, that){
    document.getElementById('output').innerHTML = "<h5>ServerInfo</h5>" + info;
  }

  /**
  * FETCH JOBS
  **/
  fetchJobsOnServer(func){
    console.log("fetch jobs on server");
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs", func);
  }

  fetchJobsOnServerReady(info, that){
    document.getElementById('output2').innerHTML = "<h5>JobsOnServer</h5>" + info;

  }


  /**
  * FETCH INFO OF A SPECIFIC JOB
  **/
  fetchJobInfo(jobID, func){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/" + jobID, func);
  }

  fetchJobInfoReady(info,that){
    document.getElementById('output3').innerHTML = "<h5>JobInfo</h5>" + info;
  }

  /**
  * FETCH ATTEMPTS OF A SPECIFIC JOB
  **/

  fetchJobAttempts(jobID){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/"+ jobID +"/jobattempts" , this.fetchJobAttemptsReady);
  }

  fetchJobAttemptsReady(info,that){
    document.getElementById('output4').innerHTML = "<h5>Attempts</h5>" + info;
  }

  /**
  * FETCH COUNTERS OF A SPECIFIC JOB
  **/

  fetchJobCounters(jobID, func){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/"+ jobID +"/counters" , func);
  }

  fetchJobCountersReady(info,that){
    document.getElementById('output5').innerHTML = "<h5>Counters</h5>" + info;
  }

  /**
  * FETCH TASKS OF A SPECIFIC JOB
  **/

  fetchJobTasks(jobID, func){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/"+ jobID +"/tasks" , func);
  }

  fetchJobTasksReady(info,that){
    document.getElementById('output6').innerHTML = "<h5>tasks</h5>" + info;
  }

  /**
  * FETCH TASKINFO OF A SPECIFIC JOB AND TASK
  **/

  fetchTaskInfo(jobID, taskID, func){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/"+ jobID +"/tasks/" + taskID , func);
  }

  fetchTaskInfoReady(info,that){
    document.getElementById('output7').innerHTML = "<h5>task info</h5>" + info;
  }

  /**
  * FETCH TASK COUNTERS OF A SPECIFIC JOB AND TASK
  **/

  fetchTaskCounters(jobID, taskID,func){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/"+ jobID +"/tasks/" + taskID + "/counters" , func);
  }

  fetchTaskCountersReady(info,that){
    document.getElementById('output8').innerHTML = "<h5>task counters</h5>" + info;
  }

  /**
  * FETCH TASK ATTEMPTS OF A SPECIFIC JOB AND TASK
  **/

  fetchTaskAttempts(jobID, taskID, func){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/"+ jobID +"/tasks/" + taskID + "/attempts" , func);
  }

  fetchTaskAttemptsReady(info,that){
    document.getElementById('output9').innerHTML = "<h5>task attempts</h5>" + info;
  }

  /**
  * FETCH TASK ATTEMPT INFO OF A SPECIFIC JOB AND TASK
  **/

  fetchTaskAttemptInfo(jobID, taskID, attemptID){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/"+ jobID +"/tasks/" + taskID + "/attempts/" + attemptID , this.fetchTaskAttemptInfoReady);
  }

  fetchTaskAttemptInfoReady(info,that){
    document.getElementById('output10').innerHTML = "<h5>task attempt info</h5>" + info;
  }

  /**
  * FETCH TASK ATTEMPT COUNTERS OF A SPECIFIC JOB AND TASK
  **/

  fetchTaskAttemptCounters(jobID, taskID, attemptID){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/"+ jobID +"/tasks/" + taskID + "/attempts/" + attemptID +"/counters" , this.fetchTaskAttemptCountersReady);
  }

  fetchTaskAttemptCountersReady(info,that){
    document.getElementById('output11').innerHTML = "<h5>task attempt counters</h5>" + info;
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
      }
    };
    xhttp.open("GET", this.url + path, true);
    xhttp.setRequestHeader("Accept", "application/json");
    xhttp.send();
  }
}
