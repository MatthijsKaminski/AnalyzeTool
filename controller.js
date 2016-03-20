"use strict";
class Controller{

  constructor(){
    this.servers = new Servers();
    this.initAddServer();
    this.activeElem = null;
    this.activeIndex = null;
  }

  initAddServer(){
    this.initAddServerButton();
    this.initAddSeverModal();
  }

  initAddServerButton(){
    //init sidebar button;
    var addButton = document.getElementById("addServerButton");
    addButton.addEventListener("click", function(){
      $('#addServerModal').modal('toggle');
    });
  }

  initAddSeverModal(){
    //init addbutton inside modal;
    var addButton = document.getElementById("addServerButtonModal");
    var that = this;
    addButton.addEventListener("click", function(event){
      event.preventDefault();
      var name = document.getElementById("nameInput").value;
      var historyserverURL = document.getElementById("historyInput").value;
      var mongodbURL = document.getElementById("mongodbInput").value;
      var mongodbCollection = document.getElementById("mongodbCollectionInput").value;
      that.addServer(name,historyserverURL, mongodbURL, mongodbCollection);
      $('#addServerModal').modal('hide');
    });
  }

  addServer(name, hist, mongo, collection){
    var index = this.servers.addServer(hist, mongo, collection);
    console.log("added server index: "+ index);
    var elem = this.createServerLabel(name, index);
    if(this.activeElem == null){
      this.activeElem = elem;
      this.selectServer(null,name,index);
      this.setupTabs();
    }

  }

  createServerLabel(name, index){
    var sidebarul = document.getElementById("sidebar1");
    var elem = $("<li><a ><i class='fa fa-fw fa-cloud sidebarlogo'></i>"+name+"</a></li>");
    elem.insertBefore($("#addServerButton").parent());

    var that = this;
    elem.bind("click",function(event){
      that.selectServer(event,name,index);
    });
    return elem;
  }

  selectServer(event,name,index){
    if(index != this.activeIndex){
      if(this.activeElem){
        if(this.activeElem.nodeName == "I"){
          $(this.activeElem).parent().parent().removeClass("active");
        }else{
          $(this.activeElem).parent().removeClass("active");
        }
      }
      if(event != null){
        this.activeElem = event.target;
      }
      this.activeIndex = index;
      console.log("clicked " + name + " index: " + index + "src " +   this.activeElem.nodeName);
      if(this.activeElem.nodeName == "I"){
        $(this.activeElem).parent().parent().addClass("active");
      }else{
        $(this.activeElem).parent().addClass("active");
      }
    }

  }

  setupTabs(){
    var server = this.servers.getServer(this.activeIndex);
    this.joboverview = new Joboverview(document.getElementById("jobOverviewTab"), server,this);
    this.joboverview.createtable();
    this.joboverview.refreshjoboverview();
    this.tasktimeline = new TaskTimeLine(document.getElementById("TaskTimelineTab"), server);
  }

  setActiveJob(jobid){
    this.tasktimeline.setJobID(jobid);
    this.tasktimeline.createTimeLine();
  }


}
var controller = new Controller();