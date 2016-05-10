"use strict";

class SpillingView{
  constructor(element, server){
    this.element = element;
    this.server = server;
    this.jobid = null;
  }

  setJobID(jobid){
    this.jobid = jobid;
  }

  setTask(taskid){
    this.taskid = taskid;
    this.task = this.tasksMap[taskid];
    if(this.task !== undefined && this.task.spillingRate !== undefined){
      this.selectedTaskIndex = this.getIndexOfCat(this.task.spillingRate.spilling);
    }else{
      this.selectedTaskIndex = undefined;
    }
    this.updateView();
  }

  update(){
    if(this.jobid === null){
      return;
    }
    var that = this;
    this.server.getAllTasks(this.jobid,function(tasks){
      that.getAllTaskCounters(tasks);
    });
  }

  getAllTaskCounters(tasks){
    var that = this;
    this.tasks = JSON.parse(tasks, function(k,v){return v;}).tasks.task;

    this.amountOftasks = this.tasks.length;
    this.tasksMap = {};
    this.spillingRates = {};
    var index = 0;
    for(index = 0; index <  this.tasks.length; index++){
      var task = this.tasks[index];
      this.tasksMap[task.id] = task;
      this.server.getTaskCounters(this.jobid, task.id, function(counters){
        that.handleTaskCounters(counters);
      })
    }
  }

  getTaskCounter(taskCounter, counterGroupName, counterName){
    var groupIndex = 0;
    var counterGroups = taskCounter["taskCounterGroup"];
    for(groupIndex = 0; groupIndex < counterGroups.length; groupIndex++){
      var counterGroup = counterGroups[groupIndex];
      var counterIndex = 0;
      if(counterGroup["counterGroupName"].localeCompare(counterGroupName) == 0){
        for(counterIndex = 0; counterIndex < counterGroup.counter.length ; counterIndex++){
          var counter = counterGroup.counter[counterIndex];
          if(counter["name"].localeCompare(counterName) == 0){

            return counter;
          }
        }
      }

    }

  }
  handleTaskCounters(counters, task){
    counters = JSON.parse(counters, function(k,v){return v;}).jobTaskCounters;
    var task = this.tasksMap[counters.id];
    if(task.type.localeCompare("MAP") === 0){
      var spilledRecords = this.getTaskCounter(counters, "org.apache.hadoop.mapreduce.TaskCounter", "SPILLED_RECORDS" ).value;
      var mapOutputRecords = this.getTaskCounter(counters, "org.apache.hadoop.mapreduce.TaskCounter", "MAP_OUTPUT_RECORDS" ).value;
      var spillingRate = spilledRecords - mapOutputRecords;
      var rep = this.spillingRates[spillingRate];

      if( rep === undefined ){
        rep = {
          spilling: spillingRate,
          amount: 0
        };
        this.spillingRates[spillingRate] = rep;

      }
      task.spillingRate = rep;
      rep.amount++;
    }
      this.amountOftasks--;
      if(this.amountOftasks === 0){
        this.createArrays();
        this.updateView();
      }
  }

  getIndexOfCat(spillingAmount){
    var index = 0;
    for(index = 0; index < this.cats.length; index++){
      if(this.cats[index] == spillingAmount){
        return index;
      }
    }
    return -1;
  }

  createArrays(){
    this.spillingArray= ['tasks'];
    this.cats = [];
    for(var i in this.spillingRates){
      this.cats.push(i);
      this.spillingArray.push(this.spillingRates[i].amount);
    }

  }

  colorFunction(color, d){
    if(color !== undefined && this.selectedTaskIndex !== undefined){
      if(color.index == this.selectedTaskIndex  ){
        return '#ffff00';
      }else{
        return '#FF7F0E';
      }
    }
    return '#FF7F0E';
  }

  updateView(){
    var that = this;
    var chart = c3.generate({
          bindto: '#' + this.element.id,
          data: {
              columns: [
                  this.spillingArray
              ],
              type: 'bar',
              groups: [

              ],
              colors: {
                tasks: function(color,d){ return that.colorFunction(color,d,that)}
              }
          },
          grid: {
              y: {
                  lines: [{value:0}]
              }
          },
          axis: {

            y:{
              label:{
                text: 'tasks',
                position: 'outer-middle'
              }
            },
            x:{
              type: 'category',
              categories: this.cats,
              label:{
                text: 'spilling',
                position: 'outer-middle'
              }
            }
          },

        colors:{
          tasks: '#FF7F0E'
        },
        padding: {
           top: 40,
           right: 50,
           bottom: 40,
           left: 50,
       },

      });



}
}
