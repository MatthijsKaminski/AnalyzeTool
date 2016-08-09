"use strict";
class TimeDivision{

  constructor(element){
    this.element = element;
    this.jobid = null;
  }



  updateView(json){
    this.job = JSON.parse(json, function(k,v){return v;});
    this.job = this.job.job;
    
    var chart = c3.generate({
          bindto: '#' + this.element.id,
          data: {
              columns: [
                  ['Map',  this.job["avgMapTime"]],
                  ['Shuffle', this.job["avgShuffleTime"]],
                  ['Merge', this.job["avgMergeTime"]],
                  ['Reduce', this.job["avgReduceTime"]]
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
              show: false
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
        padding: {
           top: 40,
           right: 20,
           bottom: 40,
           left: 20,
       },

      });

      setTimeout(function () {
          chart.groups([['Map', 'Shuffle', 'Merge', 'Reduce']])
      }, 1000);




  }
}
