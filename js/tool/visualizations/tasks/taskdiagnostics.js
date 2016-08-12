"use strict";
class TaskDiagnostics{

    constructor(diagnostics){
        this.diagnostics = diagnostics;

    }

    setTaskAttempts(attempts){
        this.killed = 0;
        this.speculative = 0;
        this.diagnostics.clearTasks();
        for(let attemptName in attempts){
            this.diagnoseAttempt(attempts[attemptName]);
        }
        console.log(this.speculative);
        console.log(this.killed);
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
            console.log(attempt);
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
                title = "Expensive Input";
                description = "The input of this reducer is expensive. (see table)"
                if(attempt.uniqueKeys > 1){
                    description += " Hint: try to distribute the input keys among more reducers."
                }
                this.createReport(title, "danger", description, this.calculateZScoreReduce(attempt))
            }

        }
    }

    createReport(title, type, description, table){
        let element = document.createElement("div");
        if(table != undefined){
           description = '<div class="row"> <div class="col-md-6">'+description+ '</div><div class="col-md-6">'+table+'</div> </div>';
        }
        element.innerHTML = '<div class="panel '+this.diagnostics.getPanelType(type)+ '"> <div class="panel-heading">'+ title +'</div> <div class="panel-body">'+description+ '</div> </div>';
        this.diagnostics.addTaskDiagnostic(element);
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
            console.log(object.time + " score: " + z);
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