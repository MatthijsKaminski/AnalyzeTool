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
    console.log(jsontasks);
    var tasks = JSON.parse(jsontasks, function(k,v){return v;});
    this.tasks = tasks.tasks.task;
    var index;
    for(index=0; index < this.tasks.length ; index++ ){
      this.createElementInDataSetFormTask(index,this.tasks[index]);
    }
    console.log(this.dataset);
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
    console.log(this.tasks[taskIndex]);
    if(this.tasks[taskIndex]){
      document.getElementById("taskInfoJson").innerHTML = JSON.stringify(task,undefined,2);
      this.server.getTaskCounters(this.jobid, task["id"], function(counters){
        that.showTaskCounters(counters);
      });
    }
  }

  showTaskCounters(counters){
    console.log(counters);
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
