"use strict";
class Stat{

  constructor(){
    this.dataPoints = [];
  }

  addDataPoint(dataPoint){
    this.dataPoints.push(dataPoint);
  }

  getQuantiles(){
    this.dataPoints = this.dataPoints.sort(function(a, b){return a-b});
    var numberOfDataPoints = this.dataPoints.length;
    var indexQ1 = Math.ceil(0.25 * numberOfDataPoints) - 1;
    var indexQ2 = Math.ceil(0.5  * numberOfDataPoints) - 1;
    var indexQ3 = Math.ceil(0.75 * numberOfDataPoints) - 1;
    return [this.dataPoints[indexQ1], this.dataPoints[indexQ2], this.dataPoints[indexQ3]];
  }

  getOutliersInterval(){
    return this.outliersInterval;
  }

  calculateOutliersInterval(){
    var quantiles = this.getQuantiles();
    var interQuantileRange = quantiles[2] - quantiles[0];

    var leftBoundary  =  quantiles[0] - (1.5 * interQuantileRange);
    var rightBoundary =  quantiles[2] + (1.5 * interQuantileRange);
    this.outliersInterval = [leftBoundary, rightBoundary];
  }

  isOutlier(dataPoint){
    return true;
    var outliersInterval = this.getOutliersInterval();
    if(dataPoint < outliersInterval[0] || dataPoint > outliersInterval[1]){
      return true;
    }else{
      return false;
    }
  }

  getMean(){
    var sum = 0;
    for(var index = 0; index < this.dataPoints.length ; index++){
      sum += this.dataPoints[index];
    }
    return sum/this.dataPoints.length;
  }

  getStandardDeviation(){
    var mean = this.getMean();
    var sum = 0;
    for(var index = 0; index < this.dataPoints.length ; index++){
      sum += Math.pow((this.dataPoints[index] - mean),2);
    }
    sum /= (this.dataPoints.length - 1);
    return Math.sqrt(sum);
  }

  getDataPoints(){
    return this.dataPoints;
  }

  clearDataPoints(){
    this.dataPoints = [];
  }

}
