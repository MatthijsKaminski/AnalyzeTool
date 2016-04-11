"use strict";
class TimeDivision{

  constructor(element){
    this.element = element;
  }

  setJob(jsonjob){
    this.jsonjob = jsonjob;
  }

  updateView(){

      var chart = c3.generate({
          bindto: '#timeDivision',
          data: {
              columns: [
                  ['Map',  200],
                  ['Shuffle', 130],
                  ['Merge', 230]
              ],
              type: 'bar',
              groups: [
                  ['Map', 'Shuffle']
              ],
              order: null
          },
          grid: {
              y: {
                  lines: [{value:0}]
              }
          },
          axis: {
            rotated: true
          },

      });

      setTimeout(function () {
          chart.groups([['Map', 'Shuffle', 'Merge']])
      }, 1000);

      setTimeout(function () {
          chart.load({
              columns: [['Reduce', 100]]
          });
      }, 1500);

      setTimeout(function () {
          chart.groups([['Map', 'Shuffle', 'Merge', 'Reduce']])
      }, 2000);


  }
}
