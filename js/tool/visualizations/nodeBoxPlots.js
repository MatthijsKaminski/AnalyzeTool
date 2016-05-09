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
        console.log( this.data);
        var that = this;
        var dataArray = [];
        var trace1 = {
            x: that.data,
            type: 'box',
            name: 'Nodes',
            boxmean: true
        };

        dataArray.push(trace1);

        /*
        if(this.node !== undefined){
            var trace2 = {
                x: [this.node[this.dataName]],
                type: 'box',
                name: 'Selected node'
            };
            dataArray.push(trace2);
        }
        */
        var layout = {
            title: that.title

        };

        Plotly.newPlot(this.container.id, dataArray, layout);

        console.log(this.container.getElementsByClassName("svg-container"));
        var element = this.container.getElementsByClassName("svg-container");
        if(element){

            element[0].style.margin = "auto";
        }


    }
}