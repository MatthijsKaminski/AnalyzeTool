"use strict";
class JobDiagnostics{

    constructor( diagnostics){
        this.diagnostics = diagnostics;
    }

    updateView(jobInfoJson,jobCountersJson, mapreduceconfig) {

       
        this.config = mapreduceconfig;
        this.job = JSON.parse(jobInfoJson, function (k, v) {
            return v;
        });
        this.job = this.job.job;
        this.jobCountersJson = JSON.parse(jobCountersJson, function (k, v) {
            return v;
        }).jobCounters;

        let usesCombiner = this.checkCombiner();
        this.checkForSpilling(usesCombiner);
        this.showReplicationRates();
        // console.log(this.config.getSetting("mapreduce.task.io.sort.mb"));
        // console.log(this.config.getSetting("mapreduce.map.sort.spill.percent"));


    }

    checkCombiner(){
        let combinerInput = this.getJobCounter("org.apache.hadoop.mapreduce.TaskCounter", "COMBINE_INPUT_RECORDS");
        if(combinerInput == undefined){
            this.createReport("Optional usage of combiner", "warning", "The job doesn't use a combiner.");
            return false;
        }
        combinerInput = combinerInput["mapCounterValue"];
        if(combinerInput == 0){
            this.createReport("Optional usage of combiner", "warning", "The job doesn't use a combiner.");
            return false;
        }
        let combinerOutput = this.getJobCounter("org.apache.hadoop.mapreduce.TaskCounter", "COMBINE_OUTPUT_RECORDS")["mapCounterValue"];
       // console.log("combiner input " + combinerInput + " " + combinerOutput);
        let percentage = (1.0 - (combinerOutput * 1.0)/combinerInput).toFixed(4) * 100;
        let test = percentage < 0.3;

        if(test){
            this.createReport("Inefficient usage of combiner", "warning", "The jobs combiner reduces the output with " + percentage+
                "% which may not result in performance improvements.")
            return true;
        }else{
            this.createReport("Inefficient usage of combiner", "success", "The jobs combiner reduces the output with " + percentage+
                "% which may not result in performance improvements.")
            return true;
        }
    }

    checkForSpilling(usesCombiner){
        //console.log('checking for spilling');
        this.checkSpillAndReport("Map spilling", "mapCounterValue", usesCombiner);
        this.checkSpillAndReport("Reduce spilling", "reduceCounterValue", usesCombiner);
       

    }

    createSpillSolutions(report){

        let buffersize = this.config.getSetting("mapreduce.task.io.sort.mb");
        let bufferpercentage = this.config.getSetting("mapreduce.map.sort.spill.percent");
        let bufferthreshold = bufferpercentage * buffersize;
        let amountOfMappers = this.job["successfulMapAttempts"];
        let totalMapoutput = this.getJobCounter("org.apache.hadoop.mapreduce.TaskCounter", "MAP_OUTPUT_BYTES")["mapCounterValue"];

        //change buffer
        let newBufferPercentage = Math.ceil((totalMapoutput / amountOfMappers)/ (buffersize * 1000000)*100);
        let solution1 = this.createRow("<hr><b>Solution change buffer percentage: </b>" + "Current spill precentage is " + (bufferpercentage*100) +"% to avoid spilling it should be more than " + newBufferPercentage + "%. (mapreduce.map.sort.spill.percent)<br>");


       // this.createReport("Map spilling solution change buffer percentage","danger", "current spill precentage is " + (bufferpercentage*100) +"% to avoid spilling it should be more than " + newBufferPercentage + "%.");
        this.getJobCounter("org.apache.hadoop.mapreduce.FileSystemCounter","HDFS_BYTES_READ")["mapCounterValue"];
        let newbuffersize = Math.ceil((totalMapoutput / amountOfMappers)/ (bufferpercentage * 1000000));
        let solution2 = this.createRow("<b>Solution change buffer size: </b>"+ "Current buffersize is " + (buffersize) +"MB to avoid spilling it should be more than " + newbuffersize + "MB with given spilling percentage " + bufferpercentage +". (mapreduce.task.io.sort.mb)<br>");
        //this.createReport("Map spilling solution change buffer size","danger", "current buffersize is " + (buffersize) +"MB to avoid spilling it should be more than " + newbuffersize + "MB with given spilling percentage " + bufferpercentage);
        let newmaps = Math.ceil((totalMapoutput / (bufferpercentage * buffersize* 1000000)));
        let totalMapinput = this.getJobCounter("org.apache.hadoop.mapreduce.FileSystemCounter","HDFS_BYTES_READ")["mapCounterValue"];
        let newsplit = Math.ceil((totalMapinput/newmaps)/ 1000000) ;
        let split = this.config.getSetting("mapred.max.split.size");
        let blocksize = Math.ceil(this.config.getSetting("dfs.blocksize") / 1000000);
        //this.createReport("Map spilling solution change split size","danger",  "To avoid spilling the input could be divided among " + newmaps + " maptasks. This can be achieved by changing the splitsize to " + newsplit + " bytes.");
        let solution3 = this.createRow("<b>Solution change split size: </b>"+"To avoid spilling the input could be divided among " + newmaps + " maptasks. This can be achieved by changing the splitsize to "
            + newsplit + "MB. Current splitsize is "+split + "MB (mapred.max.split.size). The HDFS blocksize is " + blocksize + "MB (dfs.blocksize).");

        report.appendChild(solution1);
        report.appendChild(solution2);
        report.appendChild(solution3);
        return report;
    }

    createRow(info){
        let row = document.createElement("div");
        row.className = "row";
        let col = document.createElement("div");
        col.className = "col-md-12";
        col.innerHTML = info;
        row.appendChild(col);
        return row;
    }



    checkSpillAndReport(title, type, usesCombiner){
        let outputrecords = 0;
        if(type.localeCompare("mapCounterValue") == 0) {
            if(!usesCombiner) {
                outputrecords = this.getJobCounter("org.apache.hadoop.mapreduce.TaskCounter", "MAP_OUTPUT_RECORDS")[type];
            }else{
                outputrecords = this.getJobCounter("org.apache.hadoop.mapreduce.TaskCounter", "COMBINE_OUTPUT_RECORDS")[type];
            }
        }else{
            if(this.getJobCounter("org.apache.hadoop.mapreduce.TaskCounter", "REDUCE_OUTPUT_RECORDS") == undefined){
                return;
            }
            outputrecords = this.getJobCounter("org.apache.hadoop.mapreduce.TaskCounter", "REDUCE_OUTPUT_RECORDS")[type];
        }
        let spilledrecords = this.getJobCounter("org.apache.hadoop.mapreduce.TaskCounter","SPILLED_RECORDS")[type];
        let spilled= spilledrecords -  outputrecords;
        if(spilled > 0){
            let description = "During the job " + spilled + " records are spilled.";
            if(type.localeCompare("mapCounterValue") == 0){
                let bytes = this.getJobCounter("org.apache.hadoop.mapreduce.FileSystemCounter","FILE_BYTES_READ")[type];
                description += "This resulted in " + bytes + " bytes needed to be read from local disk.";
                //description += " Hint: use mapreduce.task.io.sort.mb and mapreduce.map.sort.spill.percent settings to resolve this issue.";
                let div = document.createElement("div");
                div.appendChild(this.createRow(description));
                this.createSpillSolutions(div);
                description = div.outerHTML;

            }else{
                description += " Hint: use mapreduce.task.io.sort.mb and mapreduce.map.sort.spill.percent settings to resolve this issue.";
            }
            this.createReport(title,"danger",description);
        }else{
            this.createReport(title,"success", "no spilling during this job.")
        }
    }


    showReplicationRates(){
        if(this.job["mapsTotal"] != 0){
            let hdfs = "";
            let mapinputrecords = this.getJobCounter("org.apache.hadoop.mapreduce.TaskCounter", "MAP_INPUT_RECORDS")["mapCounterValue"];
            let mapoutputrecords = this.getJobCounter("org.apache.hadoop.mapreduce.TaskCounter", "MAP_OUTPUT_RECORDS")["mapCounterValue"];
            let mapinputbytes =  this.getJobCounter("org.apache.hadoop.mapreduce.FileSystemCounter","HDFS_BYTES_READ")["mapCounterValue"];
            let mapoutputbytes =  this.getJobCounter("org.apache.hadoop.mapreduce.TaskCounter","MAP_OUTPUT_MATERIALIZED_BYTES");
            if(mapoutputbytes != undefined){
                mapoutputbytes = mapoutputbytes["mapCounterValue"];
                hdfs = " Bytes were written to local disk."
            }else{
                mapoutputbytes =  this.getJobCounter("org.apache.hadoop.mapreduce.FileSystemCounter","HDFS_BYTES_WRITTEN")["mapCounterValue"];
                hdfs = " Bytes were written to HDFS."
            }
            let replicationRateRecords = ((mapoutputrecords*1.0) / mapinputrecords).toFixed(2);
            let replicationRateBytes = ((mapoutputbytes*1.0) / mapinputbytes).toFixed(2);

            this.createReport("Replication rate during map phase", "default", "Records replication rate: " + replicationRateRecords + "<br>Bytes replication rate: " + replicationRateBytes + "." +hdfs );

        }

    }

    createReport(title, type, description){
        let element = document.createElement("div");
        element.innerHTML = '<div class="panel '+this.diagnostics.getPanelType(type)+ '"> <div class="panel-heading">'+ title +'</div> <div class="panel-body">'+description+ '</div> </div>';
        this.diagnostics.addJobDiagnostic(element);
    }





    getJobCounter(counterGroupName, counterName){
        var groupIndex = 0;
        var counterGroups = this.jobCountersJson["counterGroup"];
        for(groupIndex = 0; groupIndex < counterGroups.length; groupIndex++){
            var counterGroup = counterGroups[groupIndex];
            var counterIndex = 0;
            if(counterGroup["counterGroupName"].localeCompare(counterGroupName) == 0){
                for(counterIndex = 0; counterIndex < counterGroup.counter.length ; counterIndex++){
                    var counter = counterGroup.counter[counterIndex];
                    if(counter["name"].localeCompare(counterName) == 0){
                        return counter;
                    }
                }
            }

        }
    }
}