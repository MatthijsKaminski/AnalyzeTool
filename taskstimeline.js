"use strict";
class TaskTimeLine{

  constructor(element, server, jobid){
    this.element = element;
    this.server = server;
    this.jobid = jobid;

  }

  setJobID(jobid){
    this.jobid = jobid;
  }

  createTimeLine(){
    $(this.element).empty();
    this.dataset = [];
    var that = this;
    this.server.getAllTasks(this.jobid, function(tasks){
      that.createTimeLineFromTasks(tasks);
    })
  }

  createTimeLineFromTasks(jsontasks){
    var tasks = JSON.parse(jsontasks, function(k,v){return v;});
    this.tasks = tasks.tasks.task;
    var index;
    for(index=0; index < this.tasks.length ; index++ ){
      this.createElementInDataSetFormTask(index,this.tasks[index]);
    }
    var visdataset = new vis.DataSet(this.dataset);
    var options = {};
    var timeline = new vis.Timeline(this.element, visdataset, options);
    var that = this;
    timeline.on('select', function (properties) {
      console.log(properties);
      that.taskClicked(properties.items[0]);
    });
  }

  taskClicked(taskIndex){
    var that = this;
    var task = this.tasks[taskIndex];
    if(this.tasks[taskIndex]){
      document.getElementById("taskInfoJson").innerHTML = JSON.stringify(task,undefined,2);
      this.server.getTaskCounters(this.jobid, task["id"], function(counters){
        that.showTaskCounters(counters);
      });

      this.server.getTaskAttempts(this.jobid, task["id"], function(counters){
        that.showTaskAttempts(counters,task["id"]);
      });
    }else{
      document.getElementById("taskInfoJson").innerHTML = "No task selected";
      document.getElementById("taskAttemptsJson").innerHTML = "No task selected";
      document.getElementById("taskCountersJson").innerHTML = "No task selected";
    }
  }

  showTaskAttempts(counters, taskid){
    var that = this;
    var json = JSON.parse(counters, function(k,v){return v;});
    var index;
    document.getElementById("taskAttemptsJson").innerHTML = JSON.stringify(json,undefined,2);
    for(index = 0; index < json.taskAttempts.taskAttempt.length; index++ ){
      this.server.getTaskAttemptCounters(this.jobid, taskid,json.taskAttempts.taskAttempt[index]['id'], function(counters){
        that.showTaskAttemptCounters(taskid, counters);
      });
    }
  }

  showTaskAttemptCounters(taskid, counters){
    var json = JSON.parse(counters, function(k,v){return v;});
    document.getElementById("taskAttemptCounters").innerHTML = JSON.stringify(json,undefined,2);
  }

  showTaskCounters(counters){
    var json = JSON.parse(counters, function(k,v){return v;});
    document.getElementById("taskCountersJson").innerHTML = JSON.stringify(json,undefined,2);
  }

  createElementInDataSetFormTask(index, task){
    var classNameValue = "map";
    if(task["type"] == "REDUCE"){
      classNameValue = "reduce";
    }
    var titleValue = "elapsed time: " + task["elapsedTime"] + "ms";
    var elem = {id: index, start: task["startTime"], end: task["finishTime"], className: classNameValue, title: titleValue};
    this.dataset.push(elem);
  }


}
/*
var element = document.getElementById("jobcontainer")
var server = new Server("localhost:8082","matthijskaminski.me/27017");
server.saveServerToDatabase();
var timeline = new TaskTimeLine(element, server, "job_1456240498516_0008");
timeline.createTimeLine();
*/
