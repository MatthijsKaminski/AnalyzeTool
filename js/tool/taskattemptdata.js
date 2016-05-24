"use strict";

class TaskAttemptsData{
    
    constructor(controller, server){
        this.taskController = controller;
        this.server = server;
        this.attempts = {};
        this.wantedCounters = this.taskController.getWantedCounters();
        this.aggCounters = this.taskController.getAggCounters();
    }


    setJobID(id){
        this.jobid = id;
        var that = this;
        this.server.getAllTasks(this.jobid, function(tasks){
            that.getAllTaskAttempts(tasks);
        });
    }

    getAllTaskAttempts(tasks){
        this.attempts = {};
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
        if(attempts.length > 1){
            this.markSpeculativeAttempts(attempts);
        }
        this.amountOftasks--;
        if(this.amountOftasks == 0 && this.taskAttempts == 0 ){
            this.doStatsAndUpdateController();
        }
    }

    markSpeculativeAttempts(attempts){
        
    }



    handleAttempt(attempt, taskid){
        var that = this;
        this.attempts[attempt.id] = attempt;
        if(attempt.type.localeCompare("MAP") === 0){
            attempt.elapsedMapTime = attempt.elapsedTime;
        }

        this.server.getTaskAttemptCounters(this.jobid,taskid,attempt.id, function (counters) {
            that.updateAttemptCounters(attempt, counters);
        });
        if(attempt.state.localeCompare("SUCCEEDED") === 0) {
            this.server.getTaskAttemptStatCounters(this.jobid, taskid, attempt.id, function (statCounters) {
                console.log(statCounters);
            })
        }

    }

    updateAttemptCounters(attempt, counters){
        counters  = JSON.parse(counters, function(k,v){return v;}).jobTaskAttemptCounters;

        if(attempt.state.localeCompare("SUCCEEDED") === 0){
            if(attempt.type.localeCompare("MAP") === 0){
                for(var index = 0; index < this.wantedCounters.map.length; index++){
                    var counter = this.wantedCounters.map[index];
                    this.updateAttemptWithCounter(attempt,counters,counter);
                }
                for(var index = 0; index < this.wantedCounters.all.length; index++){
                    var counter = this.wantedCounters.all[index];
                    this.updateAttemptWithCounter(attempt,counters,counter);
                }
                for(var index = 0; index < this.aggCounters.map.length; index++){
                    var counter = this.aggCounters.map[index];
                    counter.func(attempt);
                }

            }else{
                for(var index = 0; index < this.wantedCounters.reduce.length; index++){
                    var counter = this.wantedCounters.reduce[index];
                    this.updateAttemptWithCounter(attempt,counters,counter);
                }
                for(var index = 0; index < this.wantedCounters.all.length; index++){
                    var counter = this.wantedCounters.all[index];
                    this.updateAttemptWithCounter(attempt,counters,counter);
                }
                for(var index = 0; index < this.aggCounters.reduce.length; index++){
                    var counter = this.aggCounters.reduce[index];
                    counter.func(attempt);
                }

            }


            for(var index = 0; index < this.aggCounters.all.length; index++){
                var counter = this.aggCounters.all[index];
                counter.func(attempt);
            }


        }
        this.taskAttempts--;
        if(this.amountOftasks == 0 && this.taskAttempts == 0 ){
            this.doStatsAndUpdateController();
        }

    }

    updateAttemptWithCounter(attempt, counters, counter){
        attempt[counter.dataName] = TaskAttempt.getTaskCounter(counters, counter.countersName, counter.countersGroupName, counter.counterName).value
    }



    doStatsAndUpdateController(){
        this.initStats();
        this.populateStats();
        this.runStats();
        this.labelOutliers();
        this.taskController.setTaskAttempts(this.attempts);
    }

    initStats(){
        this.statNames = this.taskController.getStatNames();
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
        for(var attemptName in this.attempts){
            var attempt = this.attempts[attemptName];
            if(attempt.state.localeCompare("SUCCEEDED") === 0) {
                for (var index = 0; index < this.statNames.length; index++) {
                    var stat = this.statNames[index];
                    var value = attempt[stat];
                    if(value !== undefined){
                        this[stat].addDataPoint(value);
                    }

                }
            }
        }
    }

    runStats(){
        for(var index = 0; index < this.stats.length; index++){
            this.stats[index].calcStats();
        }

    }

    labelOutliers(){
        for(var attemptName in this.attempts){
            var attempt = this.attempts[attemptName];
            for(var index = 0; index < this.statNames.length ; index++){
                var stat = this.statNames[index];
                if(attempt[stat] !== undefined){
                    attempt[(stat + "Label")] = this[stat].label(attempt[stat]);
                }

            }

        }
    }



    getStatDataPoints(statName){
        return this[statName].getDataPoints();
    }
}