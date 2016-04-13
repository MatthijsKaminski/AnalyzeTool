"use strict";
class ReplicationView{
  constructor(element, server){
    this.element = element;
    this.server = server;
    this.jobid = null;
  }

  setJobID(jobid){
    this.jobid = jobid;
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
    this.replicationRates = {};
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
      var mapInputRecords = this.getTaskCounter(counters, "org.apache.hadoop.mapreduce.TaskCounter", "MAP_INPUT_RECORDS" ).value;
      var mapOutputRecords = this.getTaskCounter(counters, "org.apache.hadoop.mapreduce.TaskCounter", "MAP_OUTPUT_RECORDS" ).value;
      var replicationRate = mapOutputRecords/mapInputRecords;
      var rep = this.replicationRates[replicationRate];
      task.replicationRate = rep;
      if( rep === undefined ){
        rep = {
          replication: replicationRate,
          amount: 0
        };
        this.replicationRates[replicationRate] = rep;

      }
      rep.amount++;
    }
      this.amountOftasks--;
      if(this.amountOftasks === 0){
        rep = {
          replication: 2,
          amount: 1
        };
        this.replicationRates[2] = rep;
        rep = {
          replication: 3,
          amount: 4
        };
        this.replicationRates[3] = rep;
        this.updateView();
      }
  }

  createArrays(){
    this.replicationArray= ['tasks'];
    this.cats = [];
    for(var i in this.replicationRates){
      this.cats.push(i);
      this.replicationArray.push(this.replicationRates[i].amount);
    }

  }

  colorFunction(color, d){
    if(color !== undefined){
      if(color.index === 1 ){
        return '#ffff00';
      }else{
        return '#FF7F0E';
      }
    }
    return '#FF7F0E';
  }

  updateView(){

    this.createArrays();

    var chart = c3.generate({
          bindto: '#' + this.element.id,
          data: {
              columns: [
                  this.replicationArray
              ],
              type: 'bar',
              groups: [

              ],
              order: null,
              colors: {
                tasks: this.colorFunction
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
                text: 'replicationRate',
                position: 'outer-middle'
              }
            }
          }


        ,
        padding: {
           top: 40,
           right: 50,
           bottom: 40,
           left: 50,
       },

      });



}
}
