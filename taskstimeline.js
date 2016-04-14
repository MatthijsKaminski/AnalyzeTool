"use strict";
class TaskTimeLine{

  constructor(element, server, controller){
    this.element = element;
    this.server = server;
    this.controller = controller;
    this.stat = new Stat();
  }

  setJobID(jobid){
    this.jobid = jobid;
    this.stat.clearDataPoints();
  }

  createTimeLine(){
    $(this.element).empty();
    this.dataset = [];
    var that = this;
    this.server.getAllTasks(this.jobid, function(tasks){
      that.getAllTaskAttempts(tasks);
    })
  }

  createGroups(){
    this.groups = [];
    var index = 0;
    for(var node in this.nodes){
      this.groups.push({id: index, content: node});
      var nodeObj = this.nodes[node];
      nodeObj.index = index;
      index++;
    }
    this.groups = new vis.DataSet(this.groups);
  }

  createTimeLineFromTasks(){
    this.createGroups();
    this.attempts = [];
    var taskindex = 0;
    for(var node in this.nodes){
      var nodeObj = this.nodes[node];
      var nodeAttemptsIndex = 0;
      for(nodeAttemptsIndex = 0; nodeAttemptsIndex < nodeObj.attempts.length ; nodeAttemptsIndex++){
        var attempt = nodeObj.attempts[nodeAttemptsIndex]
        this.createElementInDataSetFormTask(taskindex,nodeObj.index, attempt);
        this.attempts.push(attempt);
        taskindex++;
      }

    }
    var visdataset = new vis.DataSet(this.dataset);
    var options = {};
    this.timeline = new vis.Timeline(this.element, visdataset, options);
    this.timeline.setGroups(this.groups);
    var that = this;
    this.timeline.on('select', function (properties) {

      that.taskClicked(properties.items[0]);
    });

    console.log("Quantiles " + this.stat.getQuantiles());
    console.log("interval " + this.stat.getOutliersInterval());
    console.log("mean " + this.stat.getMean());
    console.log("std " + this.stat.getStandardDeviation());
  }

  getAllTaskAttempts(tasks){
    this.nodes = {};
    var that = this;
    tasks = JSON.parse(tasks, function(k,v){return v;}).tasks.task;
    this.amountOftasks = tasks.length;
    var index = 0;
    var taskid;
    for(index = 0; index < tasks.length; index++){
       taskid = tasks[index].id;

       this.getTaskAttempts(this.jobid, taskid);
    }
  }

  getTaskAttempts(jobid, taskid){
    var that = this;
    this.server.getTaskAttempts(this.jobid, taskid, function(attempts){
      that.handleAttempts(attempts, taskid);
    });
  }

  handleAttempts(attempts, taskid){
    attempts = JSON.parse(attempts, function(k,v){return v;}).taskAttempts.taskAttempt;
    var index = 0;
    for(index = 0; index < attempts.length ; index++){
      this.handleAttempt(attempts[index], taskid);
    }
    this.amountOftasks--;
    if(this.amountOftasks == 0){
      this.createTimeLineFromTasks();
    }
  }

  handleAttempt(attempt, taskid){
    attempt.taskid = taskid;
    this.doStatsForAttempt(attempt);
    var node = this.nodes[attempt.nodeHttpAddress];
    if( node === undefined ){
      node = {
        attempts: []
      };
      this.nodes[attempt.nodeHttpAddress] = node;
    }
    node.attempts.push(attempt);
  }

  doStatsForAttempt(attempt){
    this.stat.addDataPoint(attempt["elapsedTime"]);
  }

  taskClicked(taskIndex){
    var that = this;
    var attempt = this.attempts[taskIndex];
    if(attempt){
      if(attempt.state.localeCompare("SUCCEEDED") == 0){
        this.controller.setActiveTask(attempt.taskid);
      }
      document.getElementById("taskInfoJson").innerHTML = JSON.stringify(attempt,undefined,2);
      /*
      this.server.getTaskCounters(this.jobid, task["id"], function(counters){
        that.showTaskCounters(counters);
      });

      this.server.getTaskAttempts(this.jobid, task["id"], function(counters){
        that.showTaskAttempts(counters,task["id"]);
      });
      */
    }else{
      this.controller.setActiveTask(null);
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

  createElementInDataSetFormTask(taskIndex, groupindex, taskAttempt){
    var classNameValue = "map";
    if(taskAttempt["type"] == "REDUCE"){
      classNameValue = "reduce";
    }
    var titleValue = "elapsed time: " + taskAttempt["elapsedTime"] + "ms";
    var elem = {id: taskIndex,
                group: groupindex,
                start: taskAttempt["startTime"],
                end: taskAttempt["finishTime"],
                className: classNameValue,
                title: titleValue};
    this.dataset.push(elem);
    if(this.stat.isOutlier(taskAttempt["elapsedTime"])){
      console.log("test");
      this.createButtonOutlier(taskIndex);
    }
  }

  createButtonOutlier(taskindex){
    var button = document.createElement("button");
    button.innerHTML = "outlier " + taskindex;
    var that = this;
    button.addEventListener("click" ,function(){
      console.log("clicked");
      that.timeline.setSelection(taskindex, {
        focus: true
      });
    });
    var elem = document.getElementById("outliers");
    elem.appendChild(button);
  }


}


/*
var timeline = new TaskTimeLine(element, server, "job_1456240498516_0008");
timeline.createTimeLine();
*/
