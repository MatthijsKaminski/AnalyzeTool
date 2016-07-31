"use strict";

class TasksDiagnosis{
    constructor(element, taskController){
        this.element = element;
        this.taskController = taskController;
        this.init();
        this.tasks = undefined
    }

    init() {
        this.element.innerHTML = "<p>No task selected </p>";
        this.labels = this.taskController.getVisLabels();
        this.colors = ["#F44336", "#FF9800", "#FFEB3B" , "#B2FF59", "#76FF03", "#00C853"];
        this.colorsReverse = ["#F44336", "#FF9800", "#FFEB3B" , "#B2FF59", "#76FF03", "#00C853"].reverse();

    }

    setTaskAttempts(tasks){
        this.tasks = tasks;
    }
    //
    // selectNode(node){
    //     this.node = node;
    // }

    setJobID(jobID){
        //DO NOTHING
    }

    updateView(){
        if(this.tasks !== undefined) {
            this.element.innerHTML = "";
            let spacer = document.createElement("div");
            spacer.innerHTML = "<h3>Mappers</h3>";
            this.element.appendChild(spacer);
            let bodyMap = this.createTable("map");
            spacer = document.createElement("div");
            spacer.innerHTML = "<h3>Reducers</h3>";
            this.element.appendChild(spacer);
            let bodyReduce = this.createTable("reduce");
            this.fillTableBody(bodyMap, bodyReduce);
        }
    }

    createTable(type){
        this.table = document.createElement("table");
        this.table.className = "table-bordered heatmap";
        this.element.appendChild(this.table);
        this.createTableHead(this.table, type);
        let tableBody = document.createElement("tbody");
        this.table.appendChild(tableBody);
        return tableBody;
    }

    createTableHead(table, type){
        let tableHead = document.createElement("thead");
        table.appendChild(tableHead);
        let row = "<tr><th>Task</th>";
        for(let index = 0; index < this.labels.length; index++){
            let label = this.labels[index];
            if(label.type.localeCompare(type) == 0 || label.type.localeCompare("both") == 0){
                row += "<th>" + label.title + "</th>";
            }

        }
        row+="</tr>";

        tableHead.innerHTML = row;

    }

    fillTableBody(mapTable, reduceTable){
        console.log(this.tasks);

        for(let attemptname in this.tasks){
            let task = this.tasks[attemptname];
            let type = "reduce";
            let table = reduceTable;
            if(task.type.localeCompare("MAP") == 0){
                type="map";
                table = mapTable;
            }
            let tr = document.createElement("tr");
            let row = "<td>" + attemptname+ "</td>";
            for(let index2 = 0; index2 < this.labels.length; index2++){
                let label = this.labels[index2];
                if(label.type.localeCompare(type) == 0 || label.type.localeCompare("both") == 0){
                    row +="<td class='col-md-2' style='background-color:" + this.getColorForLabel(label,task)+" ;'>"+"</td>";
                }

            }
            tr.innerHTML = row;
            table.appendChild(tr);

        }
        // for(var index = 0; index < this.labels.length; index++){
        //     var label = this.labels[index];
        //     var tr = document.createElement("tr");
        //
        //     tr.innerHTML = "<td>"+ label.dataName +"</td>" + "<td style='background-color:" + this.getColorForLabel(label)
        //         +" ;'>"+"</td>";
        //     this.tableBody.appendChild(tr);
        // }
    }



    getColorForLabel(label, task){
        let index = task[(label.dataName + "Label")];
        if(label.better.localeCompare("lower") === 0){
            if(index == -1){
                index = 0;
            }
            return this.colorsReverse[index];
        }
        if(index == -1){
            index = 5;
        }
        return this.colors[index];
    }


}