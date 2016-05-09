"use strict";

class Joboverview{

  constructor(element,server , controller ){
    this.element = element;
    this.server = server;
    this.heads = ["name", "state", "submitTime", "startTime", "finishTime", "mapsCompleted", "reducesCompleted"];
    this.controller = controller;
    this.activeRow = null;
    
  }

  createtable(){
    this.table = document.createElement("table");
    this.table.className = "table";
    this.element.appendChild(this.table);
    this.jobInfo = document.createElement("pre");
    this.jobCounters = document.createElement("pre");
    this.jobInfo.innerHTML = "No job selected";
    this.jobCounters.innerHTML = "No job selected";
    this.element.appendChild(this.jobInfo);
    this.element.appendChild(this.jobCounters);
    this.createtablehead();

  }

  createtablehead(){
    this.thead = document.createElement("thead");
    this.table.appendChild(this.thead);
    var tr = document.createElement("tr");
    this.thead.appendChild(tr);
    var index;
    for(index = 0 ; index < this.heads.length ; index++){
        this.createth(tr, this.heads[index]);
    }
    this.tbody = document.createElement("tbody");
    this.table.appendChild(this.tbody);

  }

  createth(tr,name){
    var el = document.createElement("th");
    el.appendChild(document.createTextNode(name));
    tr.appendChild(el);
  }

  refreshjoboverview(){
    console.log("refresh");
    this.clearTableData();
    var that = this;
    this.server.getAllJobs(function(jobs){
        that.filltable(jobs);
    })
  }

  filltable(jsonjobs){
    this.jobs = JSON.parse(jsonjobs, function(k,v){return v;});
    this.jobs = this.jobs.jobs.job;
    var index;
    for (index = 0 ; index < this.jobs.length; index++){
      this.addJobRow(this.jobs[index]);
    }
  }

  addJobRow(json){
    var tr = document.createElement("tr");
    var jobid = json["id"];
    var that = this;
    tr.addEventListener("click",function(event){
      that.jobSelected(event,jobid);
    });
    var index;
    for(index = 0; index < this.heads.length ; index++){
      var value = json[this.heads[index]];
      if(this.heads[index].indexOf("Time") > -1 ){
        var date = new Date(value);
        value = date.toUTCString();
      }
      this.addJobProp(tr, value);
    }
    this.tbody.appendChild(tr);
  }

  addJobProp(tr, value){
    var td = document.createElement("td");
    td.appendChild(document.createTextNode(value));
    tr.appendChild(td);
  }

  clearTableData(){
    while (this.tbody.firstChild) {
      this.tbody.removeChild(this.tbody.firstChild);
    }
  }

  /**
   * Sets an job active by passing it to the  the controller.
   * @param event event of the click
   * @param jobid the job that was clicked
     */
  jobSelected(event,jobid){
    var that = this;
    var row = event.target;
    if(this.activeRow){
      $(this.activeRow).parent().removeClass("active");
    }
    this.activeRow = row;
    $(this.activeRow).parent().addClass("active");
    this.controller.setActiveJob(jobid);

    this.server.getJobInfo(jobid, function(json){
      that.showJobInfo(json);
    });
    this.server.getJobCounters(jobid, function(json){
      that.showJobCounters(json);
    });


  }

  showJobInfo(json){
    json = JSON.parse(json, function(k,v){return v;});
    this.jobInfo.innerHTML = JSON.stringify(json,undefined,2);
  }

  showJobCounters(json){
    json = JSON.parse(json, function(k,v){return v;});
    this.jobCounters.innerHTML = JSON.stringify(json,undefined,2);
  }



}

/*
var joboverview = new Joboverview(document.getElementById("jobcontainer"), new Server("localhost:8082",null));
joboverview.createtable();
joboverview.refreshjoboverview();
*/
