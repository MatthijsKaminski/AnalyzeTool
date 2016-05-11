"use strict"

class TaskController{
    constructor(server){
        this.server = server;
        this.visualisations = [];
        this.singleTaskVisualisations = [];
        this.initVisualisationLabels();
        this.initVisualisations();
        this.initTimeLine();
        this.taskAttemptsData = new TaskAttemptsData(this, this.server);
    }

    initVisualisationLabels(){
        this.statNames = ["mapInputRecords", "mapOutputRecords","mapInputBytes","mapOutputBytes", "combinerEfficiency",
                            "reduceInputRecords", "reduceOutputRecords", "reduceInputBytes", "reduceOutputBytes", "shuffledMaps",
                            "mergedMaps", "failedShuffles", "replicationRate", "unneededSpilledRecords" , "elapsedMapTime",
                            "elapsedMergeTime", "elapsedReduceTime", "elapsedShuffleTime","uniqueKeys"
                            ];
        
        
        this.wantedCounters = {
            map: [
                {
                    dataName: "mapInputRecords",
                    countersName: "taskAttemptCounterGroup",
                    countersGroupName: "org.apache.hadoop.mapreduce.TaskCounter",
                    counterName: "MAP_INPUT_RECORDS"
                },
                {
                    dataName: "mapOutputRecords",
                    countersName: "taskAttemptCounterGroup",
                    countersGroupName: "org.apache.hadoop.mapreduce.TaskCounter",
                    counterName: "MAP_OUTPUT_RECORDS"
                },
                {
                    dataName: "mapInputBytes",
                    countersName: "taskAttemptCounterGroup",
                    countersGroupName: "org.apache.hadoop.mapreduce.FileSystemCounter",
                    counterName: "HDFS_BYTES_READ"
                },
                {
                    dataName: "mapOutputBytes",
                    countersName: "taskAttemptCounterGroup",
                    countersGroupName: "org.apache.hadoop.mapreduce.TaskCounter",
                    counterName: "MAP_OUTPUT_MATERIALIZED_BYTES"
                },
                {
                    dataName: "combineInputRecords",
                    countersName: "taskAttemptCounterGroup",
                    countersGroupName: "org.apache.hadoop.mapreduce.TaskCounter",
                    counterName: "COMBINE_INPUT_RECORDS"
                },


            ],
            reduce: [
                {
                    dataName: "reduceInputRecords",
                    countersName: "taskAttemptCounterGroup",
                    countersGroupName: "org.apache.hadoop.mapreduce.TaskCounter",
                    counterName: "REDUCE_INPUT_RECORDS"
                },
                {
                    dataName: "reduceOutputRecords",
                    countersName: "taskAttemptCounterGroup",
                    countersGroupName: "org.apache.hadoop.mapreduce.TaskCounter",
                    counterName: "REDUCE_OUTPUT_RECORDS"
                },
                {
                    dataName: "reduceInputBytes",
                    countersName: "taskAttemptCounterGroup",
                    countersGroupName: "org.apache.hadoop.mapreduce.FileSystemCounter",
                    counterName: "HDFS_BYTES_READ"
                },
                {
                    dataName: "reduceOutputBytes",
                    countersName: "taskAttemptCounterGroup",
                    countersGroupName: "org.apache.hadoop.mapreduce.FileSystemCounter",
                    counterName: "HDFS_BYTES_WRITTEN"
                },
                {
                    dataName: "shuffledMaps",
                    countersName: "taskAttemptCounterGroup",
                    countersGroupName: "org.apache.hadoop.mapreduce.TaskCounter",
                    counterName: "SHUFFLED_MAPS"
                },
                {
                    dataName: "mergedMaps",
                    countersName: "taskAttemptCounterGroup",
                    countersGroupName: "org.apache.hadoop.mapreduce.TaskCounter",
                    counterName: "MERGED_MAP_OUTPUTS"
                },
                {
                    dataName: "failedShuffles",
                    countersName: "taskAttemptCounterGroup",
                    countersGroupName: "org.apache.hadoop.mapreduce.TaskCounter",
                    counterName: "FAILED_SHUFFLE"
                },
                {
                    dataName: "uniqueKeys",
                    countersName: "taskAttemptCounterGroup",
                    countersGroupName: "org.apache.hadoop.mapreduce.TaskCounter",
                    counterName: "REDUCE_INPUT_GROUPS"
                },
            ],
            all: [
                {
                    dataName: "spilledRecords",
                    countersName: "taskAttemptCounterGroup",
                    countersGroupName: "org.apache.hadoop.mapreduce.TaskCounter",
                    counterName: "SPILLED_RECORDS"
                }
            ]
        };

        this.aggCounters ={
            map:[
                {
                    func: function (taskattempt){
                        taskattempt.replicationRate = taskattempt["mapOutputRecords"] / taskattempt["mapInputRecords"];
                    }
                },
                {
                    func: function (taskattempt){
                        taskattempt.unneededSpilledRecords = taskattempt["spilledRecords"] - taskattempt["mapOutputRecords"];
                    }
                },
                {
                    func: function (taskattempt){
                        if(taskattempt["combineInputRecords"] !== 0)
                        taskattempt.combinerEfficiency = taskattempt["mapOutputRecords"] / taskattempt["combineInputRecords"];
                    }
                }

            ],
            reduce:[
                {
                    func: function (taskattempt){
                        taskattempt.unneededSpilledRecords = taskattempt["spilledRecords"] - taskattempt["reduceOutputRecords"];
                    }
                },
            ],
            all:[]
        }
        this.boxLabels = [
            {dataName: "elapsedMapTime", title: "Map Times (ms)", better: "lower"},
            {dataName: "elapsedReduceTime", title: "Reduce Times (ms)",better: "lower"},
            {dataName: "elapsedShuffleTime", title: "Shuffle Times (ms)",better: "lower"},
            {dataName: "elapsedMergeTime", title: "Merge Times (ms)",better: "lower"},
            {dataName: "mapInputRecords", title: "Map Inputs (records)",better: "lower"},
            {dataName: "mapOutputRecords", title: "Map Outputs (records)",better: "lower"},
            {dataName: "mapInputBytes", title: "Map Inputs (bytes)",better: "lower"},
            {dataName: "mapOutputBytes", title: "Map Outputs (bytes)",better: "lower"},
            {dataName: "uniqueKeys", title: "Unique keys of Reducer",better: "lower"},
            {dataName: "reduceInputRecords", title: "Reduce Inputs (records)",better: "lower"},
            {dataName: "reduceOutputRecords", title: "Reduce Outputs (records)",better: "lower"},
            {dataName: "reduceInputBytes", title: "Reduce Inputs (bytes)",better: "lower"},
            {dataName: "reduceOutputBytes", title: "Reduce Inputs (bytes)",better: "lower"},
            {dataName: "combinerEfficiency", title: "Combiner Efficiency (%)",better: "higher"},
            {dataName: "shuffledMaps", title: "Shuffled Maps to reducer",better: "higher"},
            {dataName: "mergedMaps", title: "Merged Maps at reducer",better: "higher"},
            {dataName: "failedShuffles", title: "Failed Shuffles to reducer",better: "higher"},
            {dataName: "replicationRate", title: "Replication Rate",better: "higher"},
            {dataName: "unneededSpilledRecords", title: "Unneeded Spilled Records",better: "higher"}

        ];

        this.histLabels = [
            {dataName: "elapsedMapTime", title: "Map Times (ms)", x: "Time (ms)" , y: "tasks" , bins: 10},
            {dataName: "elapsedReduceTime", title: "Reduce Times (ms)", x: "Time (ms)" , y: "tasks" , bins: 10},
            {dataName: "elapsedShuffleTime", title: "Shuffle Times (ms)", x: "Time (ms)" , y: "tasks" , bins: 10},
            {dataName: "elapsedMergeTime", title: "Merge Times (ms)", x: "Time (ms)" , y: "tasks" , bins: 10},
            {dataName: "mapInputRecords", title: "Map Inputs (records)", x: "Records" , y: "tasks" , bins: 10},
            {dataName: "mapOutputRecords", title: "Map Outputs (records)", x: "Records" , y: "tasks" , bins: 10},
            {dataName: "mapInputBytes", title: "Map Inputs (bytes)", x: "Bytes" , y: "tasks" , bins: 10},
            {dataName: "mapOutputBytes", title: "Map Outputs (bytes)", x: "Bytes" , y: "tasks" , bins: 10},
            {dataName: "uniqueKeys", title: "Unique keys of Reducer", x: "Keys" , y: "tasks" , bins: 10},
            {dataName: "reduceInputRecords", title: "Reduce Inputs (records)", x: "Records" , y: "tasks" , bins: 10},
            {dataName: "reduceOutputRecords", title: "Reduce Outputs (records)", x: "Records" , y: "tasks" , bins: 10},
            {dataName: "reduceInputBytes", title: "Reduce Inputs (bytes)", x: "Bytes" , y: "tasks" , bins: 10},
            {dataName: "reduceOutputBytes", title: "Reduce Inputs (bytes)", x: "Bytes" , y: "tasks" , bins: 10},
            {dataName: "combinerEfficiency", title: "Combiner Efficiency (%)", x: "%" , y: "tasks" , bins: 10},
            {dataName: "shuffledMaps", title: "Shuffled Maps to reducer", x: "Map outputs" , y: "tasks" , bins: 10},
            {dataName: "mergedMaps", title: "Merged Maps at reducer", x: "Map outputs" , y: "tasks" , bins: 10},
            {dataName: "failedShuffles", title: "Failed Shuffles to reducer", x: "Shuffles" , y: "tasks" , bins: 10},
            {dataName: "replicationRate", title: "Replication Rate", x: "Times" , y: "tasks" , bins: 10},
            {dataName: "unneededSpilledRecords", title: "Unneeded Spilled Records", x: "Records" , y: "tasks" , bins: 10},

        ]

    }

    getVisLabels(){
        return this.visLabels;
    }

    setJobID(jobid){
        this.jobid = jobid;
        this.taskAttemptsData.setJobID(jobid);
        for(var index =0 ; index < this.singleTaskVisualisations.length; index++){
            var vis = this.singleTaskVisualisations[index];
            vis.setJobID(jobid);
        }

    }

    getStatNames(){
        return this.statNames;
    }

    getWantedCounters(){
        return this.wantedCounters;
    }

    getAggCounters(){
        return this.aggCounters;
    }

    addVis(vis){
        this.visualisations.push(vis);
    }


    getContainer(id){
        return document.getElementById(id);
    }

    initTimeLine(){
        this.timeline = new TaskTimeLine(this.getContainer("TaskTimelineContainer"), this);
    }
    initVisualisations(){

        for(var index = 0; index < this.boxLabels.length; index++){
            var label = this.boxLabels[index];
            this.addVis(new NodeBoxPlot(this.getContainer("taskBoxPlotsContainer"), label.title, label.dataName))
        }
        for(var index = 0; index < this.histLabels.length; index++){
            var label = this.histLabels[index];
            this.addVis(new BinnedHistogram(this.getContainer("taskHistContainer"), label.bins, label))
        }
        
        this.singleTaskVisualisations.push(new TimeDivisionTask(this.getContainer("TimeDivisionTask"),this.server))

        
    }

    setTaskAttempts(attempts){
        for(var index =0 ; index < this.visualisations.length; index++){
            var vis = this.visualisations[index];
            vis.setData(this.taskAttemptsData.getStatDataPoints(vis.getDataName()));
            vis.updateView();
        }
        this.timeline.setTaskAttempts(attempts);
    }

    setActiveAttempt(attempt){
        console.log(attempt);
        for(var index =0 ; index < this.visualisations.length; index++){
            var vis = this.visualisations[index];
            vis.selectTaskAttempt(attempt);
            vis.updateView();
        }

        for(var index =0 ; index < this.singleTaskVisualisations.length; index++){
            var vis = this.singleTaskVisualisations[index];
            vis.selectTaskAttempt(attempt);
            vis.updateView();
        }
        
    }


}