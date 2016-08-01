"use strict"

class NodesData{

    constructor(controller, server){
        this.nodeController = controller;
        this.server = server;
    }


    setJobID(id){
        this.jobid = id;
        var that = this;
        this.server.getAllTasks(this.jobid, function(tasks){
            that.getAllTaskAttempts(tasks);
        });
    }

    
    getAllTaskAttempts(tasks){
        this.nodes = {};
        tasks = JSON.parse(tasks, function(k,v){return v;}).tasks.task;
        this.amountOftasks = tasks.length;
        this.taskAttempts = 0;
        for(var index = 0; index < tasks.length; index++){
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
            this.doStatsAndUpdateController();
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
                avgMapTime:0,
                reduceTimes: [],
                avgReduceTime:0,
                shuffleTimes:[],
                avgShuffleTime:0,
                mergeTimes:[],
                avgMergeTime:0,
                mapInputs: [],
                totalMapInputs:0,
                mapOutputs:[],
                totalMapOutputs:0,
                reduceInputs:[],
                totalReduceInputs:0,
                totalTime:0,
                load:0,
                reduceOutputs:[],
                totalReduceOutputs:0,
                replicationRates:[],
                totalReplication:0,
                spillingAmounts:[],
                totalSpilling:0,
                uniqueReduceKeys: [],
                totalUniqueReduceKeys:0,

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
        if(attempt.state.localeCompare("SUCCEEDED") === 0){
            if(attempt.type.localeCompare("MAP") === 0){
                var replicationRate = TaskAttempt.getReplicationRateFromTaskAttempt(counters)
                node.replicationRates.push(replicationRate);
                var spillingAmount = TaskAttempt.getSpillingRecordsFromTaskAttempt(counters)
                node.spillingAmounts.push(spillingAmount);
                node.totalSpilling += spillingAmount;
                var mapInput = TaskAttempt.getMapInputsFromTaskAttempt(counters);
                node.mapInputs.push(mapInput);
                node.totalMapInputs += mapInput;
                var mapOutput = TaskAttempt.getMapOutputRecordsFromTaskAttempt(counters);
                node.mapOutputs.push(mapOutput);
                node.totalMapOutputs += mapOutput;

            }else{
                var reduceInput = TaskAttempt.getReduceInputsFromTaskAttempt(counters);
                node.reduceInputs.push(reduceInput);
                node.totalReduceInputs += reduceInput;
                var reduceOutput = TaskAttempt.getReduceOutputsFromTaskAttempt(counters);
                node.reduceOutputs.push(reduceOutput);
                node.totalReduceOutputs += reduceOutput;
                var amountOfKeys = TaskAttempt.getReduceKeysFromTaskAttempt(counters);
                node.uniqueReduceKeys.push(amountOfKeys);
                node.totalUniqueReduceKeys+=amountOfKeys;
            }
        }
        this.taskAttempts--;
        if(this.amountOftasks == 0 && this.taskAttempts == 0 ){
            this.doStatsAndUpdateController();
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
            node.avgMapTime += attempt.elapsedTime;
        }else{
            node.reducers++;
            node.mergeTimes.push(attempt.elapsedMergeTime);
            node.avgMergeTime += attempt.elapsedMergeTime;
            node.reduceTimes.push(attempt.elapsedReduceTime);
            node.avgReduceTime += attempt.elapsedReduceTime;
            node.shuffleTimes.push(attempt.elapsedShuffleTime);
            node.avgShuffleTime += attempt.elapsedShuffleTime;
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

    doStatsAndUpdateController(){
        this.initStats();
        this.populateStats();
        this.runStats();
        this.labelOutliers();
        this.nodeController.setNodes(this.nodes);
    }
    
    initStats(){
        this.statNames = this.nodeController.getStatNames();
        this.stats = [];
        for(var index = 0; index < this.statNames.length; index++){
            this.createStat(this.statNames[index]);
        }

    }

    createStat(variable){
        this[variable] = new Stat();
        this.stats.push(this[variable]);
    }
    
    populateStats(){
        for(let nodeName in this.nodes){
            var node = this.nodes[nodeName];
            this.calcAvgForNode(node);
            for(var index = 0; index < this.statNames.length; index++){
                var name = this.statNames[index];
                this[name].addDataPoint(node[name]);
            }
        }
    }

    runStats(){
        for(var index = 0; index < this.stats.length; index++){
            this.stats[index].calcStats();
        }

    }

    labelOutliers(){
        for(let nodeName in this.nodes){
            let node = this.nodes[nodeName];
            for(var index = 0; index < this.statNames.length ; index++){
                var name = this.statNames[index];
              
                node[(name + "Label")] = this[name].label(node[name]);
            }

        }
    }
    
    calcAvgForNode(node){

        var totalTime = (node.endTime - node.startTime);
        node.totalTime = totalTime;
        var load = node.elapsedTime / totalTime;
        node.load = load;
        if(node.maps != 0){ node.avgMapTime = node.avgMapTime / node.maps;}
           
        if(node.reducers != 0) {
            node.avgReduceTime = node.avgReduceTime / node.reducers;
            node.avgMergeTime = node.avgMergeTime / node.reducers;
            node.avgShuffleTime = node.avgShuffleTime / node.reducers;
        }
        if(node.totalMapInputs != 0)
            node.totalReplication = node.totalMapOutputs/node.totalMapOutputs;
    }

    getStatDataPoints(statName){
        return this[statName].getDataPoints();
    }
}