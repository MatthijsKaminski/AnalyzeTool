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
  fetchServerInfo(){
    this.doAjaxRequest("/ws/v1/history/info", this.fetchServerInfoReady);
  }

  fetchServerInfoReady(info, that){
    document.getElementById('output').innerHTML = "<h5>ServerInfo</h5>" + info;
  }

  /**
  * FETCH JOBS
  **/
  fetchJobsOnServer(){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs", this.fetchJobsOnServerReady);
  }

  fetchJobsOnServerReady(info, that){
    document.getElementById('output2').innerHTML = "<h5>JobsOnServer</h5>" + info;
  }


  /**
  * FETCH INFO OF A SPECIFIC JOB
  **/
  fetchJobInfo(jobID){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/" + jobID, this.fetchJobInfoReady);
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

  fetchJobCounters(jobID){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/"+ jobID +"/counters" , this.fetchJobCountersReady);
  }

  fetchJobCountersReady(info,that){
    document.getElementById('output5').innerHTML = "<h5>Counters</h5>" + info;
  }

  /**
  * FETCH TASKS OF A SPECIFIC JOB
  **/

  fetchJobTasks(jobID){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/"+ jobID +"/tasks" , this.fetchJobTasksReady);
  }

  fetchJobTasksReady(info,that){
    document.getElementById('output6').innerHTML = "<h5>tasks</h5>" + info;
  }

  /**
  * FETCH TASKINFO OF A SPECIFIC JOB AND TASK
  **/

  fetchTaskInfo(jobID, taskID){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/"+ jobID +"/tasks/" + taskID , this.fetchTaskInfoReady);
  }

  fetchTaskInfoReady(info,that){
    document.getElementById('output7').innerHTML = "<h5>task info</h5>" + info;
  }

  /**
  * FETCH TASK COUNTERS OF A SPECIFIC JOB AND TASK
  **/

  fetchTaskCounters(jobID, taskID){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/"+ jobID +"/tasks/" + taskID + "/counters" , this.fetchTaskCountersReady);
  }

  fetchTaskCountersReady(info,that){
    document.getElementById('output8').innerHTML = "<h5>task counters</h5>" + info;
  }

  /**
  * FETCH TASK ATTEMPTS OF A SPECIFIC JOB AND TASK
  **/

  fetchTaskAttempts(jobID, taskID){
    this.doAjaxRequest("/ws/v1/history/mapreduce/jobs/"+ jobID +"/tasks/" + taskID + "/attempts" , this.fetchTaskAttemptsReady);
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
    var that = this;
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        func(xhttp.responseText, that);
      }
    };
    xhttp.open("GET", this.url + path, true);
    xhttp.setRequestHeader("Accept", "application/json");
    xhttp.send();
  }
}
var historyserver = new HistoryServer("localhost:8082");
historyserver.fetchServerInfo();
historyserver.fetchJobsOnServer();
historyserver.fetchJobInfo("job_1456240498516_0005");
historyserver.fetchJobCounters("job_1456240498516_0005");
historyserver.fetchJobAttempts("job_1456240498516_0005");
historyserver.fetchJobTasks("job_1456240498516_0005");
historyserver.fetchTaskInfo("job_1456240498516_0005","task_1456240498516_0005_m_000000");
historyserver.fetchTaskCounters("job_1456240498516_0005","task_1456240498516_0005_m_000000");
historyserver.fetchTaskAttempts("job_1456240498516_0005","task_1456240498516_0005_m_000000");
historyserver.fetchTaskAttemptInfo("job_1456240498516_0005","task_1456240498516_0005_m_000000","attempt_1456240498516_0005_m_000000_0");
historyserver.fetchTaskAttemptCounters("job_1456240498516_0005","task_1456240498516_0005_m_000000","attempt_1456240498516_0005_m_000000_0");
