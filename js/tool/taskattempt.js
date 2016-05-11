"use strict";

class TaskAttempt{

    static getReplicationRateFromTaskAttempt(counters){
        var mapInputRecords = TaskAttempt.getTaskCounter(counters,"taskAttemptCounterGroup", "org.apache.hadoop.mapreduce.TaskCounter", "MAP_INPUT_RECORDS" ).value;
        var mapOutputRecords = TaskAttempt.getTaskCounter(counters,"taskAttemptCounterGroup", "org.apache.hadoop.mapreduce.TaskCounter", "MAP_OUTPUT_RECORDS" ).value;
        var replicationRate = mapOutputRecords/mapInputRecords;
        return replicationRate;
    }


    static getSpillingRecordsFromTaskAttempt(counters){
        var mapOutputRecords = TaskAttempt.getTaskCounter(counters,"taskAttemptCounterGroup", "org.apache.hadoop.mapreduce.TaskCounter", "MAP_OUTPUT_RECORDS" ).value;
        var spilledRecords = TaskAttempt.getTaskCounter(counters,"taskAttemptCounterGroup", "org.apache.hadoop.mapreduce.TaskCounter", "SPILLED_RECORDS" ).value;
        var spilling = spilledRecords - mapOutputRecords;
        return spilling;
    }

    static getMapInputsFromTaskAttempt(counters){
        var mapInputRecords = TaskAttempt.getTaskCounter(counters,"taskAttemptCounterGroup", "org.apache.hadoop.mapreduce.TaskCounter", "MAP_INPUT_RECORDS").value;
        return mapInputRecords;
    }

    static getMapOutputRecordsFromTaskAttempt(counters){
        var mapOutputRecords = TaskAttempt.getTaskCounter(counters,"taskAttemptCounterGroup", "org.apache.hadoop.mapreduce.TaskCounter", "MAP_OUTPUT_RECORDS" ).value;
        return mapOutputRecords;
    }

    static getReduceInputsFromTaskAttempt(counters){
        var reduceInputRecords = TaskAttempt.getTaskCounter(counters,"taskAttemptCounterGroup", "org.apache.hadoop.mapreduce.TaskCounter", "REDUCE_INPUT_RECORDS" ).value;
        return reduceInputRecords;
    }

    static getReduceOutputsFromTaskAttempt(counters){
        var reduceOutputRecords = TaskAttempt.getTaskCounter(counters,"taskAttemptCounterGroup", "org.apache.hadoop.mapreduce.TaskCounter", "REDUCE_OUTPUT_RECORDS" ).value;
        return reduceOutputRecords;
    }

    static getReduceKeysFromTaskAttempt(counters){
        var keys = TaskAttempt.getTaskCounter(counters,"taskAttemptCounterGroup", "org.apache.hadoop.mapreduce.TaskCounter", "REDUCE_INPUT_GROUPS" ).value;
        return keys;
    }

    static getTaskCounter(taskCounter, counterGroupsName, counterGroupName, counterName) {
       
        var counterGroups = taskCounter[counterGroupsName];
        for (var groupIndex = 0; groupIndex < counterGroups.length; groupIndex++) {
            var counterGroup = counterGroups[groupIndex];
            var counterIndex = 0;
            if (counterGroup["counterGroupName"].localeCompare(counterGroupName) == 0) {
                for (counterIndex = 0; counterIndex < counterGroup.counter.length; counterIndex++) {
                    var counter = counterGroup.counter[counterIndex];
                    if (counter["name"].localeCompare(counterName) == 0) {

                        return counter;
                    }
                }
            }

        }
        console.log("not found: " + "taskcounterid " + taskCounter.id + " "+ counterGroupsName + " " + counterGroupName +" " + counterName);
    }

    
}