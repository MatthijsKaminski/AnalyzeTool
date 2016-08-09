"use strict";
class JobController{

    constructor(server, controller, diagnostics){
        this.server = server;
        this.controller = controller;
        this.diagnostics = diagnostics;
        this.createJobOverview();
        this.showJobInfoContainer();
        this.nodeTask = new NodeTask(document.getElementById("nodeTask"), server);
        this.createJobInfoVisualisations();
        this.createJobInfoAndCountersVisualisations();


    }

    createJobOverview(){
        this.joboverview = new Joboverview(document.getElementById("joboverview"), this.server,this.controller);
        this.joboverview.createtable();
        this.joboverview.refreshjoboverview();
    }

    showJobInfoContainer(){
        this.jobInfo = document.getElementById("jobInfo");
        this.jobInfo.style.display = "none";
    }

    createJobInfoVisualisations(){
        this.jobinfovis = [];
        this.jobinfovis.push(new TimeDivision(document.getElementById("timeDivision")))
    }

    createJobInfoAndCountersVisualisations(){
        this.countersvis = [];
        this.countersvis.push(new DataTime(document.getElementById("timeData")));
        this.countersvis.push(new JobDiagnostics(this.diagnostics));
    }

    setJobID(jobid){
        this.jobid = jobid;
        this.getJobInfoAndCounters();

        // this.nodeTask.setJobID(jobid);
        // this.nodeTask.update();

        this.jobInfo.style.display = "block";
    }

    getJobInfoAndCounters(){
        var that = this;
        this.server.getJobInfo(this.jobid, function(json){
            that.updateWithJobInfoAndGetCounters(json);
        });
    }

    updateWithJobInfoAndGetCounters(jobsJSON){
        var that = this;
        for(let index = 0; index < this.jobinfovis.length ; index++){
            this.jobinfovis[index].updateView(jobsJSON);
        }
        this.server.getJobCounters(this.jobid, function(jobCountersJson){
            that.updateWithJobInfoAndCounters(jobsJSON,jobCountersJson);
        });
    }
    updateWithJobInfoAndCounters(jobsJSON,jobCountersJson){
        for(let index = 0; index < this.countersvis.length ; index++){
            this.countersvis[index].updateView(jobsJSON, jobCountersJson);
        }

    }

    refreshjoboverview(){
        this.joboverview.refreshjoboverview();
    }
}