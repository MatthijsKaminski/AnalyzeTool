"use strict";
class TimeDivisionTask{

    constructor(element, server){
        this.element = element;
        this.server = server;
    }

    setJobID(jobid){
        var that = this;
        this.jobid = jobid;
        this.taskAttempt = undefined;
        this.server.getJobInfo(this.jobid, function(json){
            that.job = JSON.parse(json, function(k,v){return v;}).job;
            console.log(that.job);
            that.updateView();
        });
    }

    selectTaskAttempt(taskAttempt){
        this.taskAttempt = taskAttempt;
    }

    updateView(){
        console.log(this.jobid );
        console.log(this.job );
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
            console.log("hier " + this.job["avgMapTime"]);
            this.mapArray.push(this.job["avgMapTime"]);
            this.shuffleArray.push(this.job["avgShuffleTime"]);
            this.mergeArray.push(this.job["avgMergeTime"]);
            this.reduceArray.push(this.job["avgReduceTime"]);
        }
        if(this.taskAttempt !== undefined){
            if( this.taskAttempt["elapsedMapTime"] !== undefined) this.mapArray.push(this.taskAttempt["elapsedMapTime"]);
            if( this.taskAttempt["elapsedShuffleTime"] !== undefined) this.shuffleArray.push(this.taskAttempt["elapsedShuffleTime"]);
            if( this.taskAttempt["elapsedMergeTime"] !== undefined) this.mergeArray.push(this.taskAttempt["elapsedMergeTime"]);
            if( this.taskAttempt["elapsedReduceTime"] !== undefined) this.reduceArray.push(this.taskAttempt["elapsedReduceTime"]);
        }
        console.log(this.mapArray );
        console.log(this.shuffleArray );
        console.log(this.mergeArray );
        console.log(this.reduceArray );
        console.trace();

    }

    drawChart(){

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
