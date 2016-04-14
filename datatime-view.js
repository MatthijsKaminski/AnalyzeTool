"use strict";
class DataTime{

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
    this.server.getJobInfo(this.jobid, function(jobInfoJson){
      that.getJobCounters(jobInfoJson);
    });
  }

  getJobCounters(jobInfoJson){
    var that = this;
    this.server.getJobCounters(this.jobid, function(jobCountersJson){
      that.updateView(jobInfoJson,jobCountersJson);
    });
  }

  getJobCounter(counterGroupName, counterName){
    var groupIndex = 0;
    var counterGroups = this.jobCountersJson["counterGroup"];
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

  createTimeArray(){
    return ['Time', this.job["avgMapTime"], this.job["avgShuffleTime"], this.job["avgReduceTime"]];
  }

  createDataArray(){
    return ['Data',
            this.getJobCounter("org.apache.hadoop.mapreduce.FileSystemCounter","HDFS_BYTES_READ")["mapCounterValue"],
            this.getJobCounter("org.apache.hadoop.mapreduce.TaskCounter","MAP_OUTPUT_MATERIALIZED_BYTES")["mapCounterValue"],
            this.getJobCounter("org.apache.hadoop.mapreduce.TaskCounter","REDUCE_SHUFFLE_BYTES")["reduceCounterValue"],
            this.getJobCounter("org.apache.hadoop.mapreduce.TaskCounter","REDUCE_SHUFFLE_BYTES")["reduceCounterValue"],
            this.getJobCounter("org.apache.hadoop.mapreduce.TaskCounter","REDUCE_SHUFFLE_BYTES")["reduceCounterValue"],
            this.getJobCounter("org.apache.hadoop.mapreduce.FileSystemCounter","HDFS_BYTES_WRITTEN")["reduceCounterValue"]
          ];

  }


  updateView(jobInfoJson,jobCountersJson){
    this.job = JSON.parse(jobInfoJson, function(k,v){return v;});
    this.job = this.job.job;
    this.jobCountersJson = JSON.parse(jobCountersJson, function(k,v){return v;}).jobCounters;
    var mapping = {};
    mapping[1] = "Map start";
    mapping[1.5] = "Map";
    mapping[2] = "Map end / Shuffle start ";
    mapping[2.5] = "Shuffle";
    mapping[3] = "Shuffle end / Reduce start";
    mapping[3.5] = "Reduce";
    mapping[4] = "Reduce end"
    var chart = c3.generate({
    bindto: '#' + this.element.id,
    data: {
      xs: {
            'Time': 'x2',
            'Data': 'x1',
      },
      columns: [
        ['x1', 1, 2, 2, 3, 3, 4],
        ['x2', 1.5, 2.5, 3.5],
        this.createDataArray(),
        this.createTimeArray()
      ],

      axes: {
        Data: 'y2'
      },
      types: {
        Time: 'bar'
      }
    },
    axis: {
      x:{

        show:false
      },
      y: {
        label: {
          text: 'Time ms',
          position: 'outer-middle'
        },

      },
      y2: {
        show: true,
        label: {
          text: 'Data bytes',
          position: 'outer-middle'
        }
      }},
      tooltip: {
        format: {
            title: function (d) { return mapping[d];},
            value: function (value, ratio, id) {
              return value;
            }

        }
    }
    }
)

      setTimeout(function () {
          chart.groups([['Map', 'Shuffle', 'Merge', 'Reduce']])
      }, 1000);




  }
}