"use strict";
class TaskDiagnostics{

    constructor(diagnostics){
        this.diagnostics = diagnostics;

    }

    setTaskAttempts(attempts){
        this.killed = 0;
        this.speculative = 0;
        this.totalOverall= 0;
        this.nettoOverall = 0;
        this.minOverall = Infinity;
        this.maxOverall  = -Infinity;
        this.nettoMap = 0;
        this.nettoReduce = 0;
        this.totalReduce = 0;
        this.totalMap = 0;
        this.minMap = Infinity;
        this.maxMap  = -Infinity;
        this.minReduce = Infinity;
        this.maxReduce = -Infinity;
        this.diagnostics.clearTasks();
        for(let attemptName in attempts){
            this.diagnoseAttempt(attempts[attemptName]);
            this.updateLoad(attempts[attemptName]);
        }
        this.createLoadRapport();
        console.log(this.speculative);
        console.log(this.killed);
    }

    createLoadRapport(){
        console.log("Creating load report");
        let types = ["Overall","Map","Reduce"];
        let out = " "
        for(let index in types){
            let type = types[index];
            this.calculateLoad(type);
            out += this.innerLoadRapport(type);
        }
        console.log(out);
        this.createReport("Load (ms/ms)", "default", out, undefined, true);

    }
    innerLoadRapport(type){
        return "The "+type +" load is " + this["load"+type].toFixed(2) +" (ms/ms)<br>";
    }

    calculateLoad(type){
        this["netto"+type] = this["max"+type] - this["min"+type];

        this["load"+type] = this["total"+type] *1.0/ this["netto"+type]
    }

    updateLoad(attempt){
        if(attempt.state.localeCompare("SUCCEEDED") == 0){
            if(attempt.type.localeCompare("MAP") === 0){
                this.updateLoadAttempt(attempt,"Map");
            }else{
                this.updateLoadAttempt(attempt,"Reduce");
            }
        }
    }

    updateLoadAttempt(attempt, type){

        this.minOverall = Math.min(attempt.startTime, this.minOverall);
        this.maxOverall = Math.max(attempt.startTime + attempt.elapsedTime, this.maxOverall);

        this.totalOverall += attempt.elapsedTime;
        this["min"+type] = Math.min(attempt.startTime, this["min"+type]);
        this["max"+type] = Math.max(attempt.startTime + attempt.elapsedTime, this["max"+type]);
        this["total"+type] += attempt.elapsedTime;
    }


    diagnoseAttempt(attempt){
        if(attempt.state.localeCompare("SUCCEEDED") == 0){
            if(attempt.type.localeCompare("MAP") === 0){
                this.diagnoseMapAttempt(attempt);
            }else{
                this.diagnoseReduceAttempt(attempt);
            }

        }else{
            if(attempt.speculative != undefined && attempt.speculative == true){
                this.speculative++;
            }else{
                this.killed++;
            }
        }
    }

    diagnoseMapAttempt(attempt){
        if(attempt["elapsedMapTimeLabel"] == 5){

            this.calculateZScoreMap(attempt);
        }
    }

    diagnoseReduceAttempt(attempt){

        if(attempt["elapsedReduceTotalTimeLabel"] == 5){

            let description ="";
            let title ="";
            if(attempt["reduceInputRecordsLabel"] == 5){
                if(attempt["uniqueKeysLabel"] == 5){
                    title = "Partitioner skew " + attempt.id;
                    description = "Attempt " + attempt.id + " is processing an larger amount of keys (" + attempt.uniqueKeys +"), this could be the result of a bad partitioner.";
                    this.createReport(title,"danger",description, this.calculateZScoreReduce(attempt));
                }else{
                    title = "Partitioner skew " + attempt.id;
                    description = "Attempt " + attempt.id + " is processing an larger amount of input records (" + attempt.reduceInputRecords +").";
                    if(attempt.uniqueKeys > 1){
                        description += "Hint: since this reducer is processing more than one key, try to distribute these keys among more reducers. Start with the most expensive keys (see table)."
                    }
                    description += " Hint: try to use a combiner.";
                    this.createReport(title,"danger",description, this.calculateZScoreReduce(attempt));
                }
            }else{
                title = "Expensive Input " + attempt.id;
                description = "The input of this reducer is expensive. (see table)"
                if(attempt.uniqueKeys > 1){
                    description += " Hint: try to distribute the input keys among more reducers."
                }
                this.createReport(title, "danger", description, this.calculateZScoreReduce(attempt))
            }

        }
    }

    createReport(title, type, description, table, task){
        let element = document.createElement("div");
        if(table != undefined){
           description = '<div class="row"> <div class="col-md-6">'+description+ '</div><div class="col-md-6">'+table+'</div> </div>';
        }
        element.innerHTML = '<div class="panel '+this.diagnostics.getPanelType(type)+ '"> <div class="panel-heading">'+ title +'</div> <div class="panel-body">'+description+ '</div> </div>';
        if(task == undefined) {
            this.diagnostics.addTaskDiagnostic(element);
        }
        else{
            this.diagnostics.addJobDiagnostic(element);
        }
    }

    calculateZScoreMap(attempt){
        let keys = attempt["MOST_EXPENSIVE_RECORDS"] ;

        let mean = attempt["MAPPING_MEAN"];
        let variance = attempt["MAPPING_VARIANCE"];
        this.calculateZScoreOfElements(keys, mean, Math.sqrt(variance));
        let table = this.createTableForKeys(keys);
        let x = '<div class="row"> <div class="col-md-6">col1</div><div class="col-md-6">'+table+'</div> </div>';
            this.createReport("Map outlier " + attempt.id, "danger", x );

    }

    calculateZScoreReduce(attempt){
        let keys = attempt["MOST_EXPENSIVE_KEYS"] ;

        let mean = attempt["REDUCE_MEAN"];
        let variance = attempt["REDUCE_VARIANCE"];
        this.calculateZScoreOfElements(keys, mean, Math.sqrt(variance));
        let table = this.createTableForKeys(keys);
        return table;
        let x = '<div class="row"> <div class="col-md-6">col1</div><div class="col-md-6">'+table+'</div> </div>';
        this.createReport("Map outlier " + attempt.id, "danger", x );

    }

    createTableForKeys(keys){
        let table = document.createElement("table");
        table.className = "table table-bordered table-sm";
        let tableHead = document.createElement("thead");
        table.appendChild(tableHead);
        let row = "<tr><th>Key</th><th>Time</th><th>Top-10 outlier</th><th>Global outlier</th></tr>";
        tableHead.innerHTML = row;
        let tableBody = document.createElement("tbody");

        for(let k in keys){
            let row = document.createElement("tr");
            let o = keys[k];
            let x = "<td>"+o.key+"</td><td>"+o.time+"</td><td align='center'>"+this.getKross(o.top10outlier)+"</td><td align='center'>"+this.getKross(o.globaloutlier)+"</td>";
            
            row.innerHTML = x;
            tableBody.appendChild(row);
        }
        table.appendChild(tableBody);
        return table.outerHTML;
    }

    getKross(bool){
        if(bool){
            return "X";
        }
        return " ";
    }

    calculateZScoreOfElements(elements,mean,deviation){

        //cal stats for top-10 keys
        let stat = new Stat();
        for(let k in elements){
            let object = elements[k];
           stat.addDataPoint(object.time);

        }
        stat.calcStats();
        let top10mean = stat.getMean();
        let top10deviation = stat.getStandardDeviation();
        // console.log("___________")
        // console.log(top10mean);
        // console.log(top10deviation);
        for(let k in elements){
            let object = elements[k];
            let z = this.calculateZscore(object.time, top10mean, top10deviation);
            //console.log(object.time + " score: " + z);
            object["top10outlier"] = z >= 3.0;

        }

        //calc global outliers
        for(let k in elements){
            let object = elements[k];
            let z =  this.calculateZscore(object.time,mean, deviation);
            object["globaloutlier"] = z >= 3.0;
        }


    }

    calculateZscore(value, mean, standardDiviation){
        return ((value - mean) * 1.0)/standardDiviation;
    }


}