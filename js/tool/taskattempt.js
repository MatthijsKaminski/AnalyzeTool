"use strict";

class TaskAttempt{

    static getReplicationRate(counters){
        var mapInputRecords = TaskAttempt.getTaskCounter(counters,"taskAttemptCounterGroup", "org.apache.hadoop.mapreduce.TaskCounter", "MAP_INPUT_RECORDS" ).value;
        var mapOutputRecords = TaskAttempt.getTaskCounter(counters,"taskAttemptCounterGroup", "org.apache.hadoop.mapreduce.TaskCounter", "MAP_OUTPUT_RECORDS" ).value;
        var replicationRate = mapOutputRecords/mapInputRecords;
        return replicationRate;
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
    }

    
}