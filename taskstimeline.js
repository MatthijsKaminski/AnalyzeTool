"use strict";
class TaskTimeLine{

  constructor(element, server, jobid){
    this.element = element;
    this.server = server;
    this.jobid = jobid;
  }

  createTimeLine(){
    this.dataset = [];
    var that = this;
    this.server.getAllTasks(this.jobid, function(tasks){
      that.createTimeLineFromTasks(tasks);
    })
  }

  createTimeLineFromTasks(jsontasks){
    console.log(jsontasks);
    var tasks = JSON.parse(jsontasks, function(k,v){return v;});
    var tasks = tasks.tasks.task;
    var index;
    for(index=0; index < tasks.length ; index++ ){
      this.createElementInDataSetFormTask(index,tasks[index]);
    }
    console.log(this.dataset);
    var visdataset = new vis.DataSet(this.dataset);
    var options = {};
    var timeline = new vis.Timeline(this.element, visdataset, options);
  }

  createElementInDataSetFormTask(index, task){
    var elem = {id: index, start: task["startTime"], end: task["finishTime"] };
    this.dataset.push(elem);
  }


}
var element = document.getElementById("jobcontainer")
var server = new Server("localhost:8082","matthijskaminski.me/27017");
server.saveServerToDatabase();
var timeline = new TaskTimeLine(element, server, "job_1456240498516_0008");
timeline.createTimeLine();
