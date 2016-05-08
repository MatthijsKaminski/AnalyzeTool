"use strict";

class NodeOverview{

    constructor(element,server, nodeController){
        this.element = element;
        this.server = server;
        this.jobid = null;
        this.nodeController = nodeController;
        this.nodesArray = [];
    }

    setJobID(id){
        this.jobid = id;
        this.createNodeTable();
        
    }


    clearAndLoadTable(){
        var that = this;
        console.log(that.nodesArray);
        $(function () {
            $('#nodestable').bootstrapTable({
                data: that.nodesArray
            });
        });


        var $table = $('#nodestable');
        $('#nodestable').height('200')
        $(function () {
            $table.on('click-row.bs.table', function (e, row, $element) {
                $('.success').removeClass('success');
                $($element).addClass('success');
            });

        });
        $('#nodestable').bootstrapTable( 'resetView' , {height: 250} );
        setTimeout(function () {
            $('#nodestable').bootstrapTable( 'resetView' , {height: 250} );
        }, 1000);

    }

    createNodeTable(){
        var that = this;
        this.nodesArray = [];

        this.server.getAllTasks(this.jobid, function(tasks){
            that.getAllTaskAttempts(tasks);
        });
    }

    getAllTaskAttempts(tasks){
        this.nodes = {};
        tasks = JSON.parse(tasks, function(k,v){return v;}).tasks.task;
        this.amountOftasks = tasks.length;
        this.taskAttempts = 0;
        var index = 0;
        for(index = 0; index < tasks.length; index++){
            this.getTaskAttempts(tasks[index].id)
        }
    }

    getTaskAttempts(taskid){
        var that = this;
        this.server.getTaskAttempts(this.jobid, taskid, function(attempts){
            that.handleAttempts(attempts, taskid);
        });
    }


    handleAttempts(attempts, taskid){
        attempts = JSON.parse(attempts, function(k,v){return v;}).taskAttempts.taskAttempt;
        this.taskAttempts += attempts.length;
        for(var index = 0; index < attempts.length ; index++){
            this.handleAttempt(attempts[index], taskid);
        }
        this.amountOftasks--;
        if(this.amountOftasks == 0 && this.taskAttempts == 0 ){
            console.log("update");
            this.createNodeArray();
            this.clearAndLoadTable();
        }
    }



    handleAttempt(attempt, taskid){
        var that = this;
        var node = this.nodes[attempt.nodeHttpAddress];
        if( node === undefined ){
            node = {
                name: attempt.nodeHttpAddress,
                maps: 0,
                reducers: 0,
                succes: 0,
                failed:0,
                startTime: 0,
                endTime: 0,
                elapsedTime:0,
                mapTimes: [],
                reduceTimes: [],
                shuffleTimes:[],
                mergeTimes:[],
                replicationRates:[],
                spillingAmounts:[]
            };
            this.nodes[attempt.nodeHttpAddress] = node;

        }
        this.updateNodeWithAttempt(attempt, node);
        this.server.getTaskAttemptCounters(this.jobid,taskid,attempt.id, function (counters) {
            that.updateNodeWithAttemptCounters(attempt, node, counters);
        })

    }

    updateNodeWithAttemptCounters(attempt, node, counters){
        counters  = JSON.parse(counters, function(k,v){return v;}).jobTaskAttemptCounters;
        console.log(counters);
        if(attempt.state.localeCompare("SUCCEEDED") === 0){
            if(attempt.type.localeCompare("MAP") === 0){
                node.replicationRates.push(TaskAttempt.getReplicationRate(counters))
            }else{
                
            }
        }
        this.taskAttempts--;
        if(this.amountOftasks == 0 && this.taskAttempts == 0 ){
            console.log("update")
            this.createNodeArray();
            this.clearAndLoadTable();
        }

    }

    updateNodeWithAttempt(attempt, node){

        //check succes
        if(attempt.state.localeCompare("SUCCEEDED") === 0){
            node.succes++;
        }else{
            node.failed++;
        }
        //check type
        if(attempt.type.localeCompare("MAP") === 0){
            node.maps++;
            node.mapTimes.push(attempt.elapsedTime);
        }else{
            node.reducers++;
            node.mergeTimes.push(attempt.elapsedMergeTime);
            node.reduceTimes.push(attempt.elapsedReduceTime);
            node.shuffleTimes.push(attempt.elapsedShuffleTime);
        }
        //add elapsedTime
        node.elapsedTime += attempt.elapsedTime;
        //add startTime
        if(node.startTime == 0){
            node.startTime = attempt.startTime;
        }else{
            node.startTime = Math.min(node.startTime, attempt.startTime);
        }
        //add endTime
        if(node.endTime == 0){
            node.endTime = attempt.finishTime;
        }else{
            node.endTime = Math.max(node.endTime, attempt.finishTime);
        }

    }

    createNodeArray(){
        for(var node in this.nodes){

            this.nodesArray.push(this.nodes[node]);
        }
    }

}