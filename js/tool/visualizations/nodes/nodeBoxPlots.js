"use strict";

class NodeBoxPlot{

    constructor(element, title, dataName, tasks){
        this.element = element;
        this.node = undefined;
        this.title = title;
        this.dataName = dataName;
        if(tasks){
            this.name = "Tasks";
            this.selected = "Selected Task"
        }else{
            this.name = "Nodes";
            this.selected = "Selected Node"
        }
        this.createDivForBoxPlot();
    }


    createDivForBoxPlot(){
        this.container = document.createElement("div");
        this.container.id = (this.dataName + "-container");
        this.element.appendChild(this.container);
    }

    setNodes(nodes){
        this.nodes = nodes;
        this.selectedDataPoint = undefined;
    }

    setData(data){
        this.data = data;
    }

    getDataName(){
        return this.dataName;
    }

    selectNode(node){
        this.node = node;
        if(node !== undefined && node[this.dataName] !== undefined ){
            this.selectedDataPoint = node[this.dataName] ;
        }else{
            this.selectedDataPoint = undefined;
        }
    }

    selectTaskAttempt(attempt){
        if(attempt !== undefined && attempt[this.dataName] !== undefined ){
            this.selectedDataPoint = attempt[this.dataName];
        }else{
            this.selectedDataPoint = undefined;
        }
    }


    updateView(){
        this.updateBoxplot();
    }


    updateBoxplot(){
        var that = this;
        var dataArray = [];
        var trace1 = {
            x: that.data,
            type: 'box',
            name: that.name,
            boxmean: true
        };

        dataArray.push(trace1);


        if(this.selectedDataPoint !== undefined){
            var trace2 = {
                x: [that.selectedDataPoint],
                type: 'box',
                name: that.selected
            };
            dataArray.push(trace2);
        }

        var layout = {
            title: that.title,
            xaxis: {
                zeroline: false
            },
            autosize: false,
            width: 500,
            height: 500,

        };

        Plotly.newPlot(this.container.id, dataArray, layout);
        var element = this.container.getElementsByClassName("svg-container");
        if(element){

            element[0].style.margin = "auto";
        }


    }
}