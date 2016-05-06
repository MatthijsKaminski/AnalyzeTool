"use strict";

class NodeOverview{

    constructor(element,server){
        this.element = element;
        this.server = server;
        this.jobid = null;
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
        var that = this;
        tasks = JSON.parse(tasks, function(k,v){return v;}).tasks.task;
        this.amountOftasks = tasks.length;
        var index = 0;
        for(index = 0; index < tasks.length; index++){
            this.server.getTaskAttempts(this.jobid, tasks[index].id, function(attempts){
                that.handleAttempts(attempts);
            });
        }
    }

    handleAttempts(attempts){
        attempts = JSON.parse(attempts, function(k,v){return v;}).taskAttempts.taskAttempt;
        var index = 0;
        for(index = 0; index < attempts.length ; index++){
            this.handleAttempt(attempts[index]);
        }
        this.amountOftasks--;
        if(this.amountOftasks == 0){
            this.createNodeArray();
            this.clearAndLoadTable();
        }
    }

    handleAttempt(attempt){
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
                elapsedTime:0
            };
            this.nodes[attempt.nodeHttpAddress] = node;

        }
        this.updateNodeWithAttempt(attempt, node);
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
        }else{
            node.reducers++;
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
            console.log(node);
            this.nodesArray.push(this.nodes[node]);
        }
    }

}