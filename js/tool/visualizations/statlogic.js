"use strict";
class Stat{

  constructor(){
    this.dataPoints = [];
  }

  addDataPoint(dataPoint){
    this.dataPoints.push(dataPoint);
  }

  calcStats(){
    this.calculateQuantiles();
    this.calculateOutliersInterval();
  }

  calculateQuantiles(){
    this.dataPoints = this.dataPoints.sort(function(a, b){return a-b});
    var numberOfDataPoints = this.dataPoints.length;
    var indexQ1 = Math.ceil(0.25 * numberOfDataPoints) - 1;
    var indexQ2 = Math.ceil(0.5  * numberOfDataPoints) - 1;
    var indexQ3 = Math.ceil(0.75 * numberOfDataPoints) - 1;
    this.quantiles = [this.dataPoints[indexQ1], this.dataPoints[indexQ2], this.dataPoints[indexQ3]];
    return this.quantiles;
  }

  getQuantiles(){
    return this.quantiles;
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
    return this.outliersInterval;
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

  label(datapoint){
    if(datapoint < this.outliersInterval[0]){
      return 0;
    }else if(datapoint < this.quantiles[0]){
      return 1;
    }else if(datapoint < this.quantiles[1]){
      return 2;
    }else if(datapoint < this.quantiles[2]){
      return 3;
    }else if(datapoint < this.outliersInterval[1]){
      return 4;
    }else {
      return 5;
    }
  }

  calculateMean(){
    var sum = 0;
    for(var index = 0; index < this.dataPoints.length ; index++){
      sum += this.dataPoints[index];
    }
    this.mean = sum/this.dataPoints.length;
  }

  getMean(){
    return this.mean;
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
