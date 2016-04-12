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
    console.log(this.nodes);
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
    var timeline = new vis.Timeline(this.element, visdataset, options);
    timeline.setGroups(this.groups);
    var that = this;
    timeline.on('select', function (properties) {
      console.log(properties);
      that.taskClicked(properties.items[0]);
    });

  }

  getAllTaskAttempts(tasks){
    this.nodes = {};
    var that = this;
    tasks = JSON.parse(tasks, function(k,v){return v;}).tasks.task;
    this.amountOftasks = tasks.length;
    var index = 0;
    for(index = 0; index < tasks.length; index++){
      var taskid = tasks[index].id
      this.server.getTaskAttempts(this.jobid, tasks[index].id, function(attempts){
        that.handleAttempts(attempts, taskid);
      });
    }
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
    var node = this.nodes[attempt.nodeHttpAddress];
    if( node === undefined ){
      node = {
        attempts: []
      };
      this.nodes[attempt.nodeHttpAddress] = node;
    }
    node.attempts.push(attempt);
  }

  taskClicked(taskIndex){
    var that = this;
    var attempt = this.attempts[taskIndex];
    if(attempt){
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
  }


}


/*
var timeline = new TaskTimeLine(element, server, "job_1456240498516_0008");
timeline.createTimeLine();
*/
