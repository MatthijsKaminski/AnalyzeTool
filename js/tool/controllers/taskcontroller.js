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
                            "elapsedMergeTime", "elapsedReduceTime", "elapsedShuffleTime","uniqueKeys","timePerMapInput", "MAPPING_MEAN", "MAPPING_VARIANCE",
                            "REDUCE_MEAN","REDUCE_VARIANCE", "elapsedReduceTotalTime"
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
                },{
                    func: function (taskattempt){
                        if(taskattempt["mapInputRecords"] !== 0)
                            taskattempt.timePerMapInput = taskattempt["elapsedMapTime"] /taskattempt["mapInputRecords"] ;
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

            {dataName: "elapsedMapTime", title: "Map Times (ms)", better: "lower", type: "map"},
            {dataName: "elapsedReduceTotalTime", title: "Total reduce Times (ms)", better: "lower", type: "reduce"},
            {dataName: "elapsedReduceTime", title: "Reduce Times (ms)", better: "lower", type: "reduce"},
            {dataName: "elapsedShuffleTime", title: "Shuffle Times (ms)", better: "lower", type: "reduce"},
            {dataName: "elapsedMergeTime", title: "Merge Times (ms)", better: "lower", type: "reduce"},
            {dataName: "mapInputRecords", title: "Map Inputs (records)", better: "lower", type: "map"},
            {dataName: "mapOutputRecords", title: "Map Outputs (records)", better: "lower", type: "map"},
            {dataName: "mapInputBytes", title: "Map Inputs (bytes)", better: "lower", type: "map"},
            {dataName: "mapOutputBytes", title: "Map Outputs (bytes)", better: "lower", type: "map"},
            {dataName: "uniqueKeys", title: "Unique keys of Reducer", better: "lower", type: "reduce"},
            {dataName: "reduceInputRecords", title: "Reduce Inputs (records)", better: "lower", type: "reduce"},
            {dataName: "reduceOutputRecords", title: "Reduce Outputs (records)", better: "lower", type: "reduce"},
            {dataName: "reduceInputBytes", title: "Reduce Inputs (bytes)", better: "lower", type: "reduce"},
            {dataName: "reduceOutputBytes", title: "Reduce Inputs (bytes)", better: "lower", type: "reduce"},
            {dataName: "combinerEfficiency", title: "Combiner Efficiency (%)", better: "higher", type: "map"},
            {dataName: "shuffledMaps", title: "Shuffled Maps to reducer", better: "higher", type: "reduce"},
            {dataName: "mergedMaps", title: "Merged Maps at reducer", better: "higher", type: "reduce"},
            {dataName: "failedShuffles", title: "Failed Shuffles to reducer", better: "higher", type: "reduce"},
            {dataName: "replicationRate", title: "Replication Rate", better: "higher", type: "map"},
            {dataName: "unneededSpilledRecords", title: "Unneeded Spilled Records", better: "lower", type: "both"},
            {dataName: "MAPPING_MEAN", title: "Mapping time per record mean", better: "lower", type: "map"},
            {dataName: "MAPPING_VARIANCE", title: "Mapping time per record variance", better: "lower", type: "map"},
            {dataName: "REDUCE_MEAN", title: "Reduce time per record mean", better: "lower", type: "reduce"},
            {dataName: "REDUCE_VARIANCE", title: "Reduce time per record variance", better: "lower", type: "reduce"}



        ];

        this.histLabels = [
            {dataName: "elapsedMapTime", title: "Map Times (ms)", x: "Time (ms)" , y: "tasks" , bins: 10},
            {dataName: "elapsedReduceTime", title: "Reduce Times (ms)", x: "Time (ms)" , y: "tasks" , bins: 10},
            {dataName: "elapsedShuffleTime", title: "Shuffle Times (ms)", x: "Time (ms)" , y: "tasks" , bins: 10},
            {dataName: "elapsedMergeTime", title: "Merge Times (ms)", x: "Time (ms)" , y: "tasks" , bins: 10},
            {dataName: "mapInputRecords", title: "Map Inputs (records)", x: "Records" , y: "tasks" , bins: 10},
            {dataName: "mapOutputRecords", title: "Map Outputs (records)", x: "Records" , y: "tasks" , bins: 10},
            {dataName: "timePerMapInput", title: "Time per input record (ms)", x: "Time (ms)" , y: "tasks" , bins: 10},
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
        return this.boxLabels;
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
            this.addVis(new NodeBoxPlot(this.getContainer("taskBoxPlotsContainer"), label.title, label.dataName, true))
        }
        for(var index = 0; index < this.histLabels.length; index++){
            var label = this.histLabels[index];
            this.addVis(new BinnedHistogram(this.getContainer("taskHistContainer"), label.bins, label))
        }

        this.diagnoses = new TasksDiagnosis(this.getContainer("TaskDiagnosesContainer"),this);
        this.singleTaskVisualisations.push(new TimeDivisionTask(this.getContainer("TimeDivisionTask"),this.server))

        
    }

    setTaskAttempts(attempts){
        for(var index =0 ; index < this.visualisations.length; index++){
            var vis = this.visualisations[index];
            vis.setData(this.taskAttemptsData.getStatDataPoints(vis.getDataName()));
            vis.updateView();
        }
        this.diagnoses.setTaskAttempts(attempts);
        this.diagnoses.updateView();
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