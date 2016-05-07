"use strict";

class NodeController{

    constructor(element, server){
        this.element = element;
        this.server = server;
        this.initElements();
    }
    
    initElements(){
        this.nodeOverview = new NodeOverview(document.getElementById("nodestable"),this.server, this);
        
    }

    setJobID(jobid){
        this.jobid = jobid;
        this.nodeOverview.setJobID(jobid);
    }
}
