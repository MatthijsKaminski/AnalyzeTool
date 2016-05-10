"use strict";

class NodeBoxPlot{

    constructor(element, title, dataName){
        this.element = element;
        this.node = undefined;
        this.title = title;
        this.dataName = dataName;
        this.createDivForBoxPlot();
    }


    createDivForBoxPlot(){
        this.container = document.createElement("div");
        this.container.id = (this.dataName + "-container");
        this.element.appendChild(this.container);
    }

    setNodes(nodes){
        this.nodes = nodes;

    }

    setData(data){
        this.data = data;
    }

    getDataName(){
        return this.dataName;
    }

    selectNode(node){
        this.node = node;
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
            name: 'Nodes',
            boxmean: true
        };

        dataArray.push(trace1);


        if(this.node !== undefined){
            var trace2 = {
                x: [that.node[that.dataName]],
                type: 'box',
                name: 'Selected node'
            };
            dataArray.push(trace2);
        }

        var layout = {
            title: that.title,
            xaxis: {
                zeroline: false
            }

        };

        Plotly.newPlot(this.container.id, dataArray, layout);
        var element = this.container.getElementsByClassName("svg-container");
        if(element){

            element[0].style.margin = "auto";
        }


    }
}