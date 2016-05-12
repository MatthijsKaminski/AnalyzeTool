"use strict";
class TaskTimeLine{

  constructor(element, taskController){
    this.element = element;
    this.taskController = taskController;
    this.attemptID = undefined;
    this.min = undefined;
    this.max = undefined;

  }

  setTaskAttempts(taskAttempts){
    this.taskAttempts = taskAttempts;
    this.createTimeLine();
  }

  createTimeLine(){
    $(this.element).empty();
    this.dataset = [];
    this.nodes = {};
    for(var attemptID in this.taskAttempts){
      this.handleAttempt(this.taskAttempts[attemptID]);
    }
    this.createTimeLineFromTasks();
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
    var options = {
      min: (this.min - 1000),
      max: (this.max + 1000)
    };
    this.timeline = new vis.Timeline(this.element, visdataset, options);
    this.timeline.setGroups(this.groups);
    var that = this;
    this.timeline.on('select', function (properties) {
      that.taskClicked(properties.items[0]);
    });

  }

  handleAttempt(attempt){
    if(this.max === undefined){
      this.min = attempt.startTime;
      this.max = attempt.finishTime;

    }else{

      this.min = Math.min(attempt.startTime, this.min);
      this.max = Math.max(attempt.finishTime,this.max);

    }
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
    var attempt = this.attempts[taskIndex];
    if(this.attemptID === attempt.id) return;
    this.attemptID = attempt.id
    if(attempt){
        this.taskController.setActiveAttempt(attempt);
    }else{
        this.taskController.setActiveAttempt(undefined);

    }
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

