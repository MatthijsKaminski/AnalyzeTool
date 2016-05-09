"use strict";

class NodeController{



    constructor(element, server){
        this.element = element;
        this.server = server;
        this.visualisations = [];
        this.initVisualisationLabels();
        this.initVisualisations();
        this.initOverview();
        this.nodesData = new NodesData(this, this.server);

    }

    initVisualisationLabels(){
        this.statNames = ["avgMapTime","avgReduceTime","avgShuffleTime","avgMergeTime","totalMapInputs","totalMapOutputs","totalReduceInputs",
            "totalReduceOutputs","totalSpilling","totalReplication"];
        this.visLabels = [
            {dataName: "avgMapTime", title: "Map Times"},
            {dataName: "avgReduceTime", title: "Reduce Times"},
            {dataName: "avgShuffleTime", title: "Shuffle Times"},
            {dataName: "avgMergeTime", title: "Merge Times"},
            {dataName: "totalMapInputs", title: "Map Inputs"},
            {dataName: "totalMapOutputs", title: "Map Outputs"},
            {dataName: "totalReduceInputs", title: "Reduce Inputs"},
            {dataName: "totalReduceOutputs", title: "Reduce Outputs"},
            {dataName: "totalSpilling", title: "Spilling"},
            {dataName: "totalReplication", title: "Replication"}
            
        ];
        console.log(this.visLabels);
    }

    getStatNames(){
        return this.statNames;
    }

    
    getContainer(id){
        return document.getElementById(id);
    }

    initOverview(){
        this.nodeOverview = new NodeOverview(this.getContainer("nodestable"), this);
    }
    
    
    initVisualisations(){
        for(var index = 0; index < this.visLabels.length; index++){
            console.log("create vis");
            var label = this.visLabels[index];
            this.addVis(new NodeBoxPlot(this.getContainer("nodeBoxPlotsContainer"), label.title, label.dataName))
        }
    }
    
    addVis(vis){
        this.visualisations.push(vis);
    }
    
    

    setJobID(jobid){
        this.jobid = jobid;
        this.nodesData.setJobID(jobid);
    }
    
    setNodes(nodes){
        this.nodes = nodes;
        this.nodeOverview.setNodes(nodes);
        this.nodeOverview.updateView();
        for(var index =0 ; index < this.visualisations.length; index++){
            console.log("update vis");
            var vis = this.visualisations[index];
            vis.setData(this.nodesData.getStatDataPoints(vis.getDataName()));
            vis.setNodes(nodes);
            vis.updateView();
        }
    }
}
