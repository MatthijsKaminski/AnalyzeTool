"use strict";
require('./server.js');
require('./historyserverAPI.js');
class Joboverview{

  constructor(element,server){
    this.element = element;
    this.server = server;
    this.heads = ["name", "state", "submitTime", "startTime", "finishTime", "mapsCompleted", "reducesCompleted"];
  }

  createtable(){
    this.table = document.createElement("table");
    this.table.className = "table";
    this.element.appendChild(this.table);
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
    this.clearTableData();
    var that = this;
    this.server.getAllJobs(function(jobs){
        that.filltable(jobs);
    })
  }

  filltable(jsonjobs){
    var jobs = JSON.parse(jsonjobs, function(k,v){return v;});
    var jobs = jobs.jobs.job;
    console.log(jobs);
    var index;
    for (index = 0 ; index < jobs.length; index++){
      this.addJobRow(jobs[index]);
    }
  }

  addJobRow(json){
    var tr = document.createElement("tr");
    var index;
    for(index = 0; index < this.heads.length ; index++){
      var value = json[this.heads[index]];
      if(this.heads[index].indexOf("Time") > -1 ){
        console.log("jajaj");
        var date = new Date(value);
        value = date.toUTCString();
      }
      this.addJobProp(tr, value);
    }
    this.tbody.appendChild(tr);
  }

  addJobProp(tr, value){
    var td = document.createElement("td");
    console.log(String(value) + " " + String(value).indexOf("Time"));


    td.appendChild(document.createTextNode(value));
    tr.appendChild(td);
  }

  clearTableData(){
    while (this.tbody.firstChild) {
      this.tbody.removeChild(this.tbody.firstChild);
    }
  }


}

var joboverview = new Joboverview(document.getElementById("jobcontainer"), new Server("localhost:8082",null));
joboverview.createtable();
joboverview.refreshjoboverview();
