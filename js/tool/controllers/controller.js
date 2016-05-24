"use strict";
class Controller{

  constructor(){
    this.servers = new Servers();
    this.initAddServer();
    this.activeElem = null;
    this.activeIndex = undefined;
    this.serverTabs = document.getElementById("serverTabs");
    this.serverTabs.style.display = "none";
    this.settings = new Settings(this);

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

    var addButtonJumbotron = document.getElementById("addServerJumboTron");
    addButtonJumbotron.addEventListener("click", function(){
      $('#addServerModal').modal('toggle');
    });
  }

  initAddSeverModal(){
    //init addbutton inside modal;
    var addButton = document.getElementById("addServerButtonModal");
    var that = this;
    addButton.addEventListener("click", function(event){
      event.preventDefault();
      var useHistory = false;
      if ($('#use-server-db-switch-modal').is(":checked"))
      {
        useHistory = true;
      }


      
      var name = document.getElementById("nameInput").value;
      var historyserverURL = document.getElementById("historyInput").value;
      var mongodbURL = document.getElementById("mongodbInput").value;
      var mongodbName = document.getElementById("mongodbNameInput").value;
      var mongodbCollection = document.getElementById("mongodbCollectionInput").value;
      that.addServer(name,historyserverURL, mongodbURL, mongodbName, mongodbCollection,useHistory);
      $('#addServerModal').modal('hide');
    });
    var options = {
      onText: "History",
      offColor: 'primary',
      offText: "Mongodb"
    };
    $("[name='use-server-db-switch-modal']").bootstrapSwitch(options);
    $('#use-server-db-switch-modal').on('switchChange.bootstrapSwitch', function(event, state) {
      var mongoSettings = document.getElementById("modaldbFieldSet");
      var histSettings = document.getElementById("modalServerFieldSet");
      if(state == false){
        mongoSettings.disabled = false;
        histSettings.disabled = true;

      }else{
        mongoSettings.disabled = true;
        histSettings.disabled = false;
      }
    });
  }

  addServer(name, hist, mongo, mongodbName, collection, useHistory){
    var index = this.servers.addServer(hist, mongo,mongodbName, collection, useHistory);
    console.log("added server index: "+ index);
    var elem = this.createServerLabel(name, index);
    if(this.activeElem === null){
      document.getElementById("noServerSeleted").style.display ="none";
      this.activeIndex = 0;
      this.activeElem = elem[0];
      this.selectServer(null,name,index);
      this.setupTabs();
      this.settings.setServer(name, hist, mongo, mongodbName, collection, useHistory);
    }

  }

  createServerLabel(name, index){
    var sidebarul = document.getElementById("sidebar1");
    if(this.activeElem === null){
      var elem = $("<li class='active' ><a ><i class='fa fa-fw fa-cloud sidebarlogo'></i>"+name+"</a></li>");
    }else{
      var elem = $("<li ><a ><i class='fa fa-fw fa-cloud sidebarlogo'></i>"+name+"</a></li>");
    }

    elem.insertBefore($("#addServerButton").parent());

    var that = this;
    elem.bind("click",function(event){
      that.selectServer(event,name,index);
    });
    return elem;
  }

  selectServer(event,name,index){

    if(index !== this.activeIndex){
      if(this.activeElem){
        if(this.activeElem.nodeName == "LI"){
          $(this.activeElem).removeClass("active");
        }else if(this.activeElem.nodeName == "I"){
          $(this.activeElem).parent().parent().removeClass("active");
        }else{
          $(this.activeElem).parent().removeClass("active");
        }
      }
      if(event !== null){
        this.activeElem = event.target;
      }
      this.activeIndex = index;
      if(this.activeElem.nodeName == "I"){
        $(this.activeElem).parent().parent().addClass("active");
      }else{
        $(this.activeElem).parent().addClass("active");
      }
    }

  }

  setupTabs(){
    this.setupRefreshButton();
    this.serverTabs.style.display = "block";
    var server = this.servers.getServer(this.activeIndex);
    this.joboverview = new Joboverview(document.getElementById("joboverview"), server,this);
    this.joboverview.createtable();
    this.joboverview.refreshjoboverview();
    this.timeDivision = new TimeDivision(document.getElementById("timeDivision"), server);
    this.dataTime = new DataTime(document.getElementById("timeData"), server);
    this.nodeTask = new NodeTask(document.getElementById("nodeTask"), server);
    this.jobInfo = document.getElementById("jobInfo");
    this.jobInfo.style.display = "none";
    this.nodeController = new NodeController(document.getElementById("nodesContainer"),server);
    this.taskContoller = new TaskController(server);
    this.setupSettings();
  }

  setupRefreshButton(){
    var that = this;
    document.getElementById("refreshButton").addEventListener("click",
        function(e){
          e.preventDefault();
          that.joboverview.refreshjoboverview()
        });
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
    this.timeDivision.setJobID(jobid);
    this.timeDivision.update();
    this.dataTime.setJobID(jobid);
    this.dataTime.update();
    this.nodeTask.setJobID(jobid);
    this.nodeTask.update();
    this.nodeController.setJobID(jobid);
    this.taskContoller.setJobID(jobid);
    this.jobInfo.style.display = "block";
  }
  
  saveActiveServer(mongo, mongodbName, collection){
    if(this.activeIndex !== undefined){
      this.servers.save(this.activeIndex, mongo, mongodbName, collection)
    }
  }

  


}

