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
        this.attemptGroupsIndex = 0;
        tasks = JSON.parse(tasks, function(k,v){return v;}).tasks.task;
        this.amountOftasks = tasks.length;
        this.taskAttempts = 0;
        for(let index = 0; index < tasks.length; index++){
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
        this.taskAttempts += attempts.length;
        for(let index = 0; index < attempts.length ; index++){
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
        let min = attempts[0].startTime;
        attempts[0].speculative = false;
        attempts[0].attemptGroupsIndex = this.attemptGroupsIndex;
        for(let i = 1; i < attempts.length ; i++){
            attempts[i].attemptGroupsIndex = this.attemptGroupsIndex
            if(attempts[i].startTime > min){
                attempts[i].speculative = true;
            }else{
                for(let j = 0; j < i; j++){
                    attempts[j].speculative = true;
                }
                min = attempts[i].startTime;
                attempts[i].speculative = false;
            }
        }
        this.attemptGroupsIndex++;
    }



    handleAttempt(attempt, taskid){

        var that = this;
        this.attempts[attempt.id] = attempt;
        if(attempt.type.localeCompare("MAP") === 0){
            attempt.elapsedMapTime = attempt.elapsedTime;
        }else{
            attempt.elapsedReduceTotalTime = attempt.elapsedTime;
        }
       // console.log(this.taskAttempts);

        if(attempt.state.localeCompare("SUCCEEDED") === 0) {
            this.server.getTaskAttemptCounters(this.jobid,taskid,attempt.id, function (counters) {
                that.updateAttemptCounters(attempt, counters);
            });
            this.server.getTaskAttemptStatCounters(this.jobid, taskid, attempt.id, function (statCounters) {
                that.updateAttemptWithComplexCounters(attempt, statCounters);
            })
        }else{
            this.taskAttempts--;
            this.taskAttempts--;
        }

    }

    updateAttemptWithComplexCounters(attempt, counters){
        if(counters.localeCompare("error") !== 0) {
            let countersinner = JSON.parse(counters, function (k, v) {
                return v;
            });
            let keys = countersinner.stats[0];
            let mean = countersinner.stats[1]["MEAN"];

            let variance = countersinner.stats[1]["var"];
            if (variance != 0) {
                console.log(attempt);
            }
            if (attempt.type.localeCompare("MAP") === 0) {
                attempt["MOST_EXPENSIVE_RECORDS"] = keys["MOST_EXPENSIVE_RECORDS"];
                attempt["MAPPING_MEAN"] = mean;
                attempt["MAPPING_VARIANCE"] = variance;

            } else {
                attempt["MOST_EXPENSIVE_KEYS"] = keys["MOST_EXPENSIVE_KEYS"];
                attempt["REDUCE_MEAN"] = mean;
                attempt["REDUCE_VARIANCE"] = variance;
            }
        }

        this.taskAttempts--;
        console.log("remaining taskAttempts " + this.taskAttempts);
        if(this.amountOftasks == 0 && this.taskAttempts == 0 ){
            this.doStatsAndUpdateController();
        }
      

    }

    updateAttemptCounters(attempt, counters){
        let countersinner  = JSON.parse(counters, function(k,v){return v;}).jobTaskAttemptCounters;

        if(attempt.state.localeCompare("SUCCEEDED") === 0){
            if(attempt.type.localeCompare("MAP") === 0){
                for(let index = 0; index < this.wantedCounters.map.length; index++){
                    let counter = this.wantedCounters.map[index];
                    //console.log("update with counter" +  counter.counterName);
                    this.updateAttemptWithCounter(attempt,countersinner,counter);
                }
                for(let index = 0; index < this.wantedCounters.all.length; index++){
                    let counter = this.wantedCounters.all[index];
                    this.updateAttemptWithCounter(attempt,countersinner,counter);
                }
                for(let index = 0; index < this.aggCounters.map.length; index++){
                    let counter = this.aggCounters.map[index];
                    counter.func(attempt);
                }

            }else{
                for(let index = 0; index < this.wantedCounters.reduce.length; index++){
                    let counter = this.wantedCounters.reduce[index];
                    this.updateAttemptWithCounter(attempt,countersinner,counter);
                }
                for(let index = 0; index < this.wantedCounters.all.length; index++){
                    let counter = this.wantedCounters.all[index];
                    this.updateAttemptWithCounter(attempt,countersinner,counter);
                }
                for(let index = 0; index < this.aggCounters.reduce.length; index++){
                    let counter = this.aggCounters.reduce[index];
                    counter.func(attempt);
                }

            }


            for(let index = 0; index < this.aggCounters.all.length; index++){
                let counter = this.aggCounters.all[index];
                counter.func(attempt);
            }

            this.taskAttempts--;
           
            console.log(this.taskAttempts);
            if(this.amountOftasks == 0 && this.taskAttempts == 0 ){
                this.doStatsAndUpdateController();
            }

        }


    }

    updateAttemptWithCounter(attempt, counters, counter){
        let counterr = TaskAttempt.getTaskCounter(counters, counter.countersName, counter.countersGroupName, counter.counterName);
        if (counterr != undefined){
            attempt[counter.dataName] = counterr.value
        }else{
            attempt[counter.dataName] = 0;
        }

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
        for(let index = 0; index < this.statNames.length; index++){
            this.createStat(this.statNames[index]);
        }

    }

    createStat(variable){
        this[variable] = new Stat();
        this.stats.push(this[variable]);
    }

    populateStats(){

        for(let attemptName in this.attempts){
            let attempt = this.attempts[attemptName];
            if(attempt.state.localeCompare("SUCCEEDED") === 0) {
                for (let index = 0; index < this.statNames.length; index++) {
                    let stat = this.statNames[index];
                    let value = attempt[stat];
                    if(value !== undefined){
                        this[stat].addDataPoint(value);
                    }else{
                        //console.log("UNDEFINED")
                    }

                }
            }
        }
    }

    runStats(){
        for(let index = 0; index < this.stats.length; index++){
            this.stats[index].calcStats();
        }

    }

    labelOutliers(){
       // console.log("labeling "  + this.attempts.length);
        for(let attemptName in this.attempts){
            let attempt = this.attempts[attemptName];
            for(let index = 0; index < this.statNames.length ; index++){
                let stat = this.statNames[index];
                if(attempt[stat] !== undefined){
                    attempt[(stat + "Label")] = this[stat].label(attempt[stat]);
                }

            }

        }
    }



    getStatDataPoints(statName){
        //console.log(statName);
        return this[statName].getDataPoints();
    }
}