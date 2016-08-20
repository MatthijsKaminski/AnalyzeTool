"use strict";

class NodeController{

    constructor(element, server){
        //this.element = element;
        this.server = server;
        this.visualisations = [];
        this.singleNodeVisualisations = [];
        this.initVisualisationLabels();
        this.initVisualisations();
        this.initOverview();
        this.nodesData = new NodesData(this, this.server);


    }

    initVisualisationLabels(){
        this.statNames = ["avgMapTime","avgReduceTime","avgShuffleTime","avgMergeTime","totalMapInputs","totalMapOutputs","totalReduceInputs",
            "totalReduceOutputs","totalSpilling","totalReplication","load", "elapsedTime","totalUniqueReduceKeys"];
        this.visLabels = [
            {dataName: "avgMapTime", title: "Map Times (ms)", better: "lower"},
            {dataName: "avgReduceTime", title: "Reduce Times (ms)",better: "lower"},
            {dataName: "avgShuffleTime", title: "Shuffle Times (ms)",better: "lower"},
            {dataName: "avgMergeTime", title: "Merge Times (ms)",better: "lower"},
            {dataName: "totalMapInputs", title: "Map Inputs (records)",better: "lower"},
            {dataName: "totalMapOutputs", title: "Map Outputs (records)",better: "lower"},
            {dataName: "totalReduceInputs", title: "Reduce Inputs (records)",better: "lower"},
            {dataName: "totalUniqueReduceKeys", title: "Reduce keys",better: "lower"},
            {dataName: "totalReduceOutputs", title: "Reduce Outputs (records)",better: "lower"},
            {dataName: "totalSpilling", title: "Spilling (records)",better: "lower"},
            {dataName: "totalReplication", title: "Replication",better: "lower"},
            {dataName: "elapsedTime", title: "Sum of task times (ms)",better: "lower"},
            {dataName: "load", title: "Load (ms / ms)", better: "higher"}
            
        ];

        this.histLabels = [
            {dataName: "avgMapTime", title: "Map Times (ms)", x: "Time (ms)" , y: "nodes" , bins: 10},
            {dataName: "avgReduceTime", title: "Reduce Times (ms)", x: "Time (ms)" , y: "nodes" , bins: 10},
            {dataName: "avgShuffleTime", title: "Shuffle Times (ms)", x: "Time (ms)" , y: "nodes" , bins: 10},
            {dataName: "avgMergeTime", title: "Merge Times (ms)", x: "Time (ms)" , y: "nodes" , bins: 10},
            {dataName: "totalMapInputs", title: "Map Inputs (records)", x: "records" , y: "nodes" , bins: 10},
            {dataName: "totalMapOutputs", title: "Map Outputs (records)", x: "records" , y: "nodes" , bins: 10},
            {dataName: "totalReduceInputs", title: "Reduce Inputs (records)", x: "records" , y: "nodes" , bins: 10},
            {dataName: "totalUniqueReduceKeys", title: "Reduce keys", x: "keys" , y: "nodes" , bins: 10},
            {dataName: "totalReduceOutputs", title: "Reduce Outputs (records)", x: "records" , y: "nodes" , bins: 10},
            {dataName: "totalSpilling", title: "Spilling (records)", x: "records" , y: "nodes" , bins: 10},
            {dataName: "totalReplication", title: "Replication", x: "rate" , y: "nodes" , bins: 10},
            {dataName: "elapsedTime", title: "Sum of task times (ms)", x: "Time (ms)" , y: "nodes" , bins: 10},
            {dataName: "load", title: "Load (ms / ms)", x: "Load (ms / ms)" , y: "nodes" , bins: 10}
        ]
        
    }

    getVisLabels(){
        return this.visLabels;
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
        let x  = '<div class="row"> <div class="col-md-6">'+ '</div><div class="col-md-6">'+'</div> </div>';
        let y = 0;
        let row = document.createElement("div");
        row.className = "row";
        for(var index = 0; index < this.visLabels.length; index++){
            let box = document.createElement("div");
            box.className = "col-md-6";
            var label = this.visLabels[index];
            this.addVis(new NodeBoxPlot(box, label.title, label.dataName, false, "node"));
            row.appendChild(box);
            y++;
            if(y == 2){
                this.getContainer("nodeBoxPlotsContainer").appendChild(row);
                row = document.createElement("div");
                row.className = "row";
                y= 0;
            }
        }
        if(y == 1){
            this.getContainer("nodeBoxPlotsContainer").appendChild(row);
        }

        for(var index = 0; index < this.histLabels.length; index++){
            var label = this.histLabels[index];
            this.addVis(new BinnedHistogram(this.getContainer("nodeHistContainer"), label.bins, label, "nodes"))
        }

        this.addSingleVis(new TimeDivisionNode(this.getContainer("nodeTimeContainer"),this.server));
        this.nodeDiagnoses = new NodeDiagnosis(this.getContainer("nodeDiagnosisContainer"),this);
    }


    
    addVis(vis){
        this.visualisations.push(vis);
    }

    addSingleVis(vis){
        this.singleNodeVisualisations.push(vis);
    }
    
    

    setJobID(jobid){
        this.jobid = jobid;
        this.nodesData.setJobID(jobid);
        for(var index =0 ; index < this.singleNodeVisualisations.length; index++){
            var vis = this.singleNodeVisualisations[index];
            vis.setJobID(jobid);
            vis.selectNode(undefined);
            vis.updateView();
        }
    }

    selectNode(node){
        for(var index =0 ; index < this.visualisations.length; index++){
            var vis = this.visualisations[index];
            vis.selectNode(node);
            vis.updateView();
        }

        for(var index =0 ; index < this.singleNodeVisualisations.length; index++){
            var vis = this.singleNodeVisualisations[index];
            vis.selectNode(node);
            vis.updateView();
        }
    }
    
    setNodes(nodes){
        this.nodes = nodes;
        this.nodeOverview.setNodes(nodes);
        this.nodeOverview.updateView();
        this.nodeDiagnoses.setNodes(nodes);
        this.nodeDiagnoses.updateView();
       // console.log("nodes vis length " + this.visualisations.length);
        for(let index =0 ; index < this.visualisations.length; index++){
           
            let vis = this.visualisations[index];
            vis.setData(this.nodesData.getStatDataPoints(vis.getDataName()));
            vis.selectNode(undefined);
            vis.updateView();
        }
    }
}
