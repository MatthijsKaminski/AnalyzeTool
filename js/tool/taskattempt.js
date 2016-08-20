"use strict";

class TaskAttempt{

    static getReplicationRateFromTaskAttempt(counters){
        let mapInputRecords = TaskAttempt.getTaskCounter(counters,"taskAttemptCounterGroup", "org.apache.hadoop.mapreduce.TaskCounter", "MAP_INPUT_RECORDS" ).value;
        let mapOutputRecords = TaskAttempt.getTaskCounter(counters,"taskAttemptCounterGroup", "org.apache.hadoop.mapreduce.TaskCounter", "MAP_OUTPUT_RECORDS" ).value;
        let replicationRate = mapOutputRecords/mapInputRecords;
        return replicationRate;
    }


    static getSpillingRecordsFromTaskAttempt(counters){
        let mapOutputRecords = TaskAttempt.getTaskCounter(counters,"taskAttemptCounterGroup", "org.apache.hadoop.mapreduce.TaskCounter", "MAP_OUTPUT_RECORDS" ).value;
        let spilledRecords = TaskAttempt.getTaskCounter(counters,"taskAttemptCounterGroup", "org.apache.hadoop.mapreduce.TaskCounter", "SPILLED_RECORDS" ).value;
        let spilling = spilledRecords - mapOutputRecords;
        return spilling;
    }

    static getMapInputsFromTaskAttempt(counters){
        let mapInputRecords = TaskAttempt.getTaskCounter(counters,"taskAttemptCounterGroup", "org.apache.hadoop.mapreduce.TaskCounter", "MAP_INPUT_RECORDS").value;
        return mapInputRecords;
    }

    static getMapOutputRecordsFromTaskAttempt(counters){
        let mapOutputRecords = TaskAttempt.getTaskCounter(counters,"taskAttemptCounterGroup", "org.apache.hadoop.mapreduce.TaskCounter", "MAP_OUTPUT_RECORDS" ).value;
        return mapOutputRecords;
    }

    static getReduceInputsFromTaskAttempt(counters){
        let reduceInputRecords = TaskAttempt.getTaskCounter(counters,"taskAttemptCounterGroup", "org.apache.hadoop.mapreduce.TaskCounter", "REDUCE_INPUT_RECORDS" ).value;
        return reduceInputRecords;
    }

    static getReduceOutputsFromTaskAttempt(counters){
        let reduceOutputRecords = TaskAttempt.getTaskCounter(counters,"taskAttemptCounterGroup", "org.apache.hadoop.mapreduce.TaskCounter", "REDUCE_OUTPUT_RECORDS" ).value;
        return reduceOutputRecords;
    }

    static getReduceKeysFromTaskAttempt(counters){
        let keys = TaskAttempt.getTaskCounter(counters,"taskAttemptCounterGroup", "org.apache.hadoop.mapreduce.TaskCounter", "REDUCE_INPUT_GROUPS" ).value;
        return keys;
    }

    static getTaskCounter(taskCounter, counterGroupsName, counterGroupName, counterName) {
       
        let counterGroups = taskCounter[counterGroupsName];
        for (let groupIndex = 0; groupIndex < counterGroups.length; groupIndex++) {
            let counterGroup = counterGroups[groupIndex];
            let counterIndex = 0;
            if (counterGroup["counterGroupName"].localeCompare(counterGroupName) == 0) {
                for (counterIndex = 0; counterIndex < counterGroup.counter.length; counterIndex++) {
                    let counter = counterGroup.counter[counterIndex];
                    if (counter["name"].localeCompare(counterName) == 0) {

                        return counter;
                    }
                }
            }

        }
        //console.log("not found: " + "taskcounterid " + taskCounter.id + " "+ counterGroupsName + " " + counterGroupName +" " + counterName);
        return undefined;
    }

    
}