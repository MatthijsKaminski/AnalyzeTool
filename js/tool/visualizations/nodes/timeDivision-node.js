"use strict";

class TimeDivisionNode{

    constructor(element, server){
        this.element = element;
        this.server = server;
    }

    setJobID(jobid){
        var that = this;
        this.jobid = jobid;
        this.node = undefined;
        this.server.getJobInfo(this.jobid, function(json){
            that.job = JSON.parse(json, function(k,v){return v;}).job;
            that.updateView();
        });
    }

    selectNode(node){
        this.node = node;
    }

    updateView(){
        if(this.jobid === null){
            return;
        }
        this.createArrays();
        this.drawChart();
    }

    createArrays(){
        this.mapArray = ['Map'];
        this.shuffleArray = ['Shuffle'];
        this.mergeArray = ['Merge'];
        this.reduceArray = ['Reduce'];
        if(this.job !== null && this.job !== undefined){
            this.mapArray.push(this.job["avgMapTime"]);
            this.shuffleArray.push(this.job["avgShuffleTime"]);
            this.mergeArray.push(this.job["avgMergeTime"]);
            this.reduceArray.push(this.job["avgReduceTime"]);
        }
        if(this.node !== undefined){
            this.mapArray.push(this.node["avgMapTime"]);
            this.shuffleArray.push(this.node["avgShuffleTime"]);
            this.mergeArray.push(this.node["avgMergeTime"]);
            this.reduceArray.push(this.node["avgReduceTime"]);
        }
    }

    drawChart(){
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
                    categories: ['job average','selected node']
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