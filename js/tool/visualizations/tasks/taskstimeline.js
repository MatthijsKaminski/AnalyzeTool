"use strict";
class TaskTimeLine{

  constructor(element, taskController){
    this.element = element;
    this.taskController = taskController;

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
    var options = {};
    this.timeline = new vis.Timeline(this.element, visdataset, options);
    this.timeline.setGroups(this.groups);
    var that = this;
    this.timeline.on('select', function (properties) {
      that.taskClicked(properties.items[0]);
    });

  }

  handleAttempt(attempt){
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

