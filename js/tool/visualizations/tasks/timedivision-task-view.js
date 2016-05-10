"use strict";
class TimeDivisionTask{

  constructor(element, server){
    this.element = element;
    this.server = server;
    this.jobid = null;
    this.taskid = null;

  }

  setJobID(jobid){
    this.jobid = jobid;
    this.taskid = null;
  }

  setTask(taskid){
    this.taskid = taskid;
    this.getTaskInfo();
    this.updateView();
  }

  getTaskInfo(){
    if(this.jobid !== null && this.taskid !== null){
      var that = this;
      this.server.getTaskInfo(this.jobid, this.taskid, function(json){
        that.task = JSON.parse(json, function(k,v){return v;}).task;
        that.server.getAttemptInfo(that.jobid, that.taskid, that.task.successfulAttempt, function(json){
          that.attempt = JSON.parse(json, function(k,v){return v;}).taskAttempt;
          that.updateView();
        })
      });
    }else{
      this.task = undefined;
      this.updateView();
    }
  }


  update(){
    if(this.jobid === null){
      return;
    }
    var that = this;
    this.server.getJobInfo(this.jobid, function(json){
      that.job = JSON.parse(json, function(k,v){return v;}).job;
      that.updateView();
    });

  }

  createArrays(){
    this.mapArray = ['Map'];
    this.shuffleArray = ['Shuffle'];
    this.mergeArray = ['Merge'];
    this.reduceArray = ['Reduce'];
    if(this.job !== null){
      this.mapArray.push(this.job["avgMapTime"]);
      this.shuffleArray.push(this.job["avgShuffleTime"]);
      this.mergeArray.push(this.job["avgMergeTime"]);
      this.reduceArray.push(this.job["avgReduceTime"]);
    }
    if(this.task !== undefined && this.attempt !== undefined){
      if(this.attempt.type.localeCompare("MAP") == 0){
        this.mapArray.push(this.attempt["elapsedTime"]);
        this.shuffleArray.push(0);
        this.mergeArray.push(0);
        this.reduceArray.push(0);
      }else{
        this.mapArray.push(0);
        this.shuffleArray.push(this.attempt["elapsedShuffleTime"]);
        this.mergeArray.push(this.attempt["elapsedMergeTime"]);
        this.reduceArray.push(this.attempt["elapsedReduceTime"]);
      }
    }
  }

  updateView(json){
    this.createArrays();
    var chart = c3.generate({
          bindto: '#' + this.element.id,
          data: {
              columns: [
                  this.mapArray,
                  this.shuffleArray,
                  this.mergeArray,
                  this.reduceArray
              ],
              type: 'bar',
              groups: [

              ],
              order: null
          },
          grid: {
              y: {
                  lines: [{value:0}]
              }
          },
          axis: {
            rotated: true,
            y:{
              label:{
                text: 'ms',
                position: 'outer-middle'
              }
            },
            x:{
              type: 'category',
              categories: ['job average','selected task']
            }
          },
          tooltip: {
            format: {
                title: function (d) { return "Details";},
                value: function (value, ratio, id) {
                  return value;
                }

            }
        },

      });

      setTimeout(function () {
          chart.groups([['Map', 'Shuffle', 'Merge', 'Reduce']])
      }, 1000);


}

  }
