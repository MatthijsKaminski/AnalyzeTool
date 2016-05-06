"use strict";

class BoxPlot{

    constructor(element){
        this.element = element;
        this.dataPoints = [];
    }

    setArrayDataPoints(arr){
        this.dataPoints = [];
    }

    addDataPoint(dataPoint){
        this.dataPoints.push(dataPoint);
    }

    clearDataPoints(){
        this.dataPoints = [];
    }

    createBoxPlot(){
        
    }

}