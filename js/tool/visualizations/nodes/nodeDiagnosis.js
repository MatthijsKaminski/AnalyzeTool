"use strict";

class NodeDiagnosis{
    constructor(element, nodeController){
        this.element = element;
        this.nodeController = nodeController;
        this.init();
        this.node =undefined;
        this.nodes = undefined;
    }
    
    init() {
        this.element.innerHTML = "<p>No node selected </p>";
        this.labels = this.nodeController.getVisLabels();
        this.colors = ["#F44336", "#FF9800", "#FFEB3B" , "#B2FF59", "#76FF03", "#00C853"];
        this.colorsReverse = ["#F44336", "#FF9800", "#FFEB3B" , "#B2FF59", "#76FF03", "#00C853"].reverse();

    }

    setNodes(nodes){
        this.nodes = nodes;
    }

    selectNode(node){
        this.node = node;
    }

    setJobID(jobID){
        //DO NOTHING
    }

    updateView(){
        if(this.nodes !== undefined) {
            this.element.innerHTML = "";
            this.table = document.createElement("table");
            this.table.className = "table-bordered heatmap";
            this.element.appendChild(this.table);
            this.createTableHead(this.table);
            // this.tableHead = document.createElement("thead");
            // this.table.appendChild(this.tableHead);
            // this.tableHead.innerHTML = "<tr><th>Spec</th><th>status</th></tr>";
            let tableBody = document.createElement("tbody");
            this.table.appendChild(tableBody);
            this.fillTableBody(tableBody);
        }
    }

    createTableHead(table){
        let tableHead = document.createElement("thead");
        table.appendChild(tableHead);
        let row = "<tr><th>Node</th>";
        for(let index = 0; index < this.labels.length; index++){
            let label = this.labels[index];

            row += "<th>" + label.title + "</th>";
        }
        row+="</tr>";

        tableHead.innerHTML = row;

    }

    fillTableBody(tableBody){
        console.log(this.nodes);
        for(let nodeName in this.nodes){

            let tr = document.createElement("tr");
            let row = "<td>" + nodeName + "</td>";
            let node = this.nodes[nodeName];
            console.log(node);
            for(let index2 = 0; index2 < this.labels.length; index2++){
                let label = this.labels[index2];
                row +="<td class='col-md-2' style='background-color:" + this.getColorForLabel(label,node)+" ;'>"+"</td>";
            }
            tr.innerHTML = row;
            tableBody.appendChild(tr);

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

    fillTableBodyWithNodes(){

    }


    getColorForLabel(label, node){
        let index = node[(label.dataName + "Label")];
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