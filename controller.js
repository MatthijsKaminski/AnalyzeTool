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
      var useMongodb = true;
      if ($('#use-server-db-switch-modal').is(":checked"))
      {
        useMongodb = false;
      }
      var name = document.getElementById("nameInput").value;
      var historyserverURL = document.getElementById("historyInput").value;
      var mongodbURL = document.getElementById("mongodbInput").value;
      var mongodbCollection = document.getElementById("mongodbCollectionInput").value;
      that.addServer(name,historyserverURL, mongodbURL, mongodbCollection);
      $('#addServerModal').modal('hide');
    });
    var options = {
      onText: "History",
      offColor: 'primary',
      offText: "Mongodb"
    };
    $("[name='use-server-db-switch-modal']").bootstrapSwitch(options);

  }

  addServer(name, hist, mongo, collection){
    var index = this.servers.addServer(hist, mongo, collection);
    console.log("added server index: "+ index);
    var elem = this.createServerLabel(name, index);
    if(this.activeElem === null){
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
      if(event !== null){
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
    this.joboverview = new Joboverview(document.getElementById("joboverview"), server,this);
    this.joboverview.createtable();
    this.joboverview.refreshjoboverview();
    this.tasktimeline = new TaskTimeLine(document.getElementById("TaskTimelineContainer"), server);
    this.timeDivision = new TimeDivision(document.getElementById("timeDivision"), server);
    this.dataTime = new DataTime(document.getElementById("timeData"), server);
    this.nodeTask = new NodeTask(document.getElementById("nodeTask"), server);
    this.replicationView = new ReplicationView(document.getElementById("ReplicationView"), server);
    this.spillingView = new SpillingView(document.getElementById("SpillingView"), server);
    this.setupSettings();
  }

  setupSettings(){
    var options = {
      onText: "History",
      offColor: 'primary',
      offText: "Mongodb"
    };
    $("[name='use-server-db-switch']").bootstrapSwitch(options);
  }

  setActiveJob(jobid){
    this.tasktimeline.setJobID(jobid);
    this.tasktimeline.createTimeLine();
    this.timeDivision.setJobID(jobid);
    this.timeDivision.update();
    this.dataTime.setJobID(jobid);
    this.dataTime.update();
    this.nodeTask.setJobID(jobid);
    this.nodeTask.update();
    this.replicationView.setJobID(jobid);
    this.replicationView.update();
    this.spillingView.setJobID(jobid);
    this.spillingView.update();
  }


}
var controller = new Controller();
