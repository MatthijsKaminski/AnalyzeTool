"use strict"

class TaskController{
    constructor(server, diagnostics){
        this.server = server;
        this.diagnosticstab = diagnostics;
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
                            "mergedMaps", "failedShuffles", "replicationRate", "unneededMapSpilledRecords" , "unneededReduceSpilledRecords", "elapsedMapTime",
                            "elapsedMergeTime", "elapsedReduceTime", "elapsedShuffleTime","uniqueKeys","timePerMapInput", "MAPPING_MEAN", "MAPPING_VARIANCE",
                            "REDUCE_MEAN","REDUCE_VARIANCE", "elapsedReduceTotalTime", "replicationRateBytes"
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
                {
                    dataName: "combineOutputRecords",
                    countersName: "taskAttemptCounterGroup",
                    countersGroupName: "org.apache.hadoop.mapreduce.TaskCounter",
                    counterName: "COMBINE_OUTPUT_RECORDS"
                }
                ,{
                    dataName: "mapOutputBytesHDFS",
                    countersName: "taskAttemptCounterGroup",
                    countersGroupName: "org.apache.hadoop.mapreduce.FileSystemCounter",
                    counterName: "HDFS_BYTES_WRITTEN"
                }, {
                    dataName: "mapSpilledRecords",
                    countersName: "taskAttemptCounterGroup",
                    countersGroupName: "org.apache.hadoop.mapreduce.TaskCounter",
                    counterName: "SPILLED_RECORDS"
                }


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
                {
                    dataName: "reduceSpilledRecords",
                    countersName: "taskAttemptCounterGroup",
                    countersGroupName: "org.apache.hadoop.mapreduce.TaskCounter",
                    counterName: "SPILLED_RECORDS"
                }
            ],
            all: [

            ]
        };

        this.aggCounters ={
            map:[
                {
                    func: function (taskattempt){
                        taskattempt.replicationRate = ((taskattempt["mapOutputRecords"] * 1.0)/ taskattempt["mapInputRecords"]).toFixed(2);
                    }
                },
                {
                    func: function (taskattempt){
                        if(taskattempt["mapOutputBytes"] == 0 && taskattempt["mapOutputBytesHDFS"] != 0){
                            taskattempt["mapOutputBytes"] = taskattempt["mapOutputBytesHDFS"];
                        }
                        taskattempt.replicationRateBytes = ((taskattempt["mapOutputBytes"] * 1.0)/ taskattempt["mapInputBytes"]).toFixed(2);
                    }
                },
                {
                    func: function (taskattempt){
                        if(taskattempt["mapSpilledRecords"] != 0){
                            if(taskattempt["combineInputRecords"] !== 0){
                                taskattempt.unneededMapSpilledRecords = taskattempt["mapSpilledRecords"] - taskattempt["combineOutputRecords"];
                            }else{

                                taskattempt.unneededMapSpilledRecords = taskattempt["mapSpilledRecords"] - taskattempt["mapOutputRecords"];
                            }

                        }else{
                            taskattempt.unneededMapSpilledRecords = 0
                        }

                    }
                },
                {
                    func: function (taskattempt){
                        if(taskattempt["combineInputRecords"] !== 0)
                            taskattempt.combinerEfficiency = (1.0 - (taskattempt["combineOutputRecords"] * 1.0 )/ taskattempt["combineInputRecords"]).toFixed(4) *100;
                    }
                },{
                    func: function (taskattempt){
                        if(taskattempt["mapInputRecords"] !== 0)
                            taskattempt.timePerMapInput = taskattempt["elapsedMapTime"] /taskattempt["mapInputRecords"] ;
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
                        taskattempt.unneededReduceSpilledRecords = taskattempt["reduceSpilledRecords"] - taskattempt["reduceOutputRecords"];
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
            {dataName: "replicationRate", title: "Replication Rate (records)", better: "lower", type: "map"},
            {dataName: "replicationRateBytes", title: "Replication Rate (bytes)", better: "lower", type: "map"},
            {dataName: "unneededMapSpilledRecords", title: "Unneeded Spilled Records (MAP)", better: "lower", type: "map"},
            {dataName: "unneededReduceSpilledRecords", title: "Unneeded Spilled Records (REDUCE)", better: "lower", type: "reduce"},
            {dataName: "MAPPING_MEAN", title: "Mapping time per record mean", better: "lower", type: "map"},
            {dataName: "MAPPING_VARIANCE", title: "Mapping time per record variance", better: "lower", type: "map"},
            {dataName: "REDUCE_MEAN", title: "Reduce time per record mean", better: "lower", type: "reduce"},
            {dataName: "REDUCE_VARIANCE", title: "Reduce time per record variance", better: "lower", type: "reduce"},




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

            {dataName: "unneededMapSpilledRecords", title: "Unneeded Spilled Records (MAP)", x: "Records" , y: "tasks" , bins: 10},
            {dataName: "unneededReduceSpilledRecords", title: "Unneeded Spilled Records (REDUCE)", x: "Records" , y: "tasks" , bins: 10}

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
        let y = 0;
        let row = document.createElement("div");
        row.className = "row";
        for(var index = 0; index < this.boxLabels.length; index++){
            let box = document.createElement("div");
            box.className = "col-md-6";
            var label = this.boxLabels[index];
            this.addVis(new NodeBoxPlot(box, label.title, label.dataName, true));
            row.appendChild(box);
            y++;
            if(y == 2){
                this.getContainer("taskBoxPlotsContainer").appendChild(row);
                row = document.createElement("div");
                row.className = "row";
                y= 0;
            }
        }
        if(y != 0){
            this.getContainer("taskBoxPlotsContainer").appendChild(row);
        }

        for(var index = 0; index < this.histLabels.length; index++){

            var label = this.histLabels[index];
            this.addVis(new BinnedHistogram(this.getContainer("taskHistContainer"), label.bins, label));

        }

        this.heatmap = new TasksHeatmap(this.getContainer("TaskDiagnosesContainer"),this);
        this.singleTaskVisualisations.push(new TimeDivisionTask(this.getContainer("TimeDivisionTask"),this.server))
        this.diagnostics = new TaskDiagnostics(this.diagnosticstab);
        
    }

    setTaskAttempts(attempts){
        for(var index =0 ; index < this.visualisations.length; index++){
            var vis = this.visualisations[index];
            vis.setData(this.taskAttemptsData.getStatDataPoints(vis.getDataName()));
            vis.updateView();
        }
        this.heatmap.setTaskAttempts(attempts);
        this.heatmap.updateView();
        this.diagnostics.setTaskAttempts(attempts)
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