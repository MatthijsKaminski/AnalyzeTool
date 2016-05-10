"use strict";

class NodeDiagnosis{
    constructor(element, nodeController){
        this.element = element;
        this.nodeController = nodeController;
        this.init();
        this.node =undefined;
    }
    
    init() {
        this.element.innerHTML = "<p>No node selected </p>";
        this.labels = this.nodeController.getVisLabels();
        this.colors = ["#F44336", "#FF9800", "#FFEB3B" , "#B2FF59", "#76FF03", "#00C853"];
        this.colorsReverse = ["#F44336", "#FF9800", "#FFEB3B" , "#B2FF59", "#76FF03", "#00C853"].reverse();

    }


    selectNode(node){
        this.node = node;
    }

    setJobID(jobID){
        //DO NOTHING
    }

    updateView(){
        if(this.node !== undefined) {
            this.element.innerHTML = "";
            this.table = document.createElement("table");
            this.table.className = "table-bordered";
            this.element.appendChild(this.table);
            this.tableHead = document.createElement("thead");
            this.table.appendChild(this.tableHead);
            this.tableHead.innerHTML = "<tr><th>Spec</th><th>status</th></tr>";
            this.tableBody = document.createElement("tbody");
            this.table.appendChild(this.tableBody);
            this.fillTableBody();
        }
    }

    fillTableBody(){
        for(var index = 0; index < this.labels.length; index++){
            var label = this.labels[index];
            var tr = document.createElement("tr");

            tr.innerHTML = "<td>"+ label.dataName +"</td>" + "<td style='background-color:" + this.getColorForLabel(label)
                +" ;'>"+"</td>";
            this.tableBody.appendChild(tr);
        }
    }

    getColorForLabel(label){
        var index = this.node[(label.dataName + "Label")];
        if(label.better.localeCompare("lower") === 0){
           return this.colorsReverse[index];
        }
        return this.colors[index];
    }
    
    
}