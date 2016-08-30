"use strict";
class  NodeTask{
  constructor(element, server){
    this.element = element;
    this.server = server;
  }

  setJobID(jobid){
    this.jobid = jobid;
  }

  update(){
    if(this.jobid === null){
      return;
    }
    var that = this;
    this.server.getAllTasks(this.jobid, function(tasks){
      that.getAllTaskAttempts(tasks);
    });
  }

  getAllTaskAttempts(tasks){
    this.nodes = {};
    var that = this;
    tasks = JSON.parse(tasks, function(k,v){return v;}).tasks.task;
    this.amountOftasks = tasks.length;
    var index = 0;
    for(index = 0; index < tasks.length; index++){
      this.server.getTaskAttempts(this.jobid, tasks[index].id, function(attempts){
        that.handleAttempts(attempts);
      });
    }
  }

  handleAttempts(attempts){
    attempts = JSON.parse(attempts, function(k,v){return v;}).taskAttempts.taskAttempt;
    var index = 0;
    for(index = 0; index < attempts.length ; index++){
      this.handleAttempt(attempts[index]);
    }
    this.amountOftasks--;
    if(this.amountOftasks == 0){
      this.updateView();
    }
  }

  handleAttempt(attempt){
    var node = this.nodes[attempt.nodeHttpAddress];
    if( node === undefined ){
      node = {
        name: attempt.nodeHttpAddress,
        maps: 0,
        reducers: 0,
        succes: 0,
        failed:0,
        startTime: 0,
        endTime: 0,
        elapsedTime:0
      };
      this.nodes[attempt.nodeHttpAddress] = node;

    }
    this.updateNodeWithAttempt(attempt, node);
  }

  updateNodeWithAttempt(attempt, node){
    //check succes
    if(attempt.state.localeCompare("SUCCEEDED") === 0){
      node.succes++;
    }else{
      node.failed++;
    }
    //check type
    if(attempt.type.localeCompare("MAP") === 0){
      node.maps++;
    }else{
      node.reducers++;
    }
    //add elapsedTime
    node.elapsedTime += attempt.elapsedTime;
    //add startTime
    if(node.startTime == 0){
      node.startTime = attempt.startTime;
    }else{
      node.startTime = Math.min(node.startTime, attempt.startTime);
    }
    //add endTime
    if(node.endTime == 0){
      node.endTime = attempt.finishTime;
    }else{
      node.endTime = Math.max(node.endTime, attempt.finishTime);
    }

  }

  createArrays(){
    var index = 0;
    this.cats = [];
    this.maps = ['maps'];
    this.reducers = ['reducers'];
    for(var node in this.nodes){
      var nodeObj = this.nodes[node];
      this.cats.push(nodeObj.name);
      this.maps.push(nodeObj.maps);
      this.reducers.push(nodeObj.reducers);
    }

  }

    createMapArray(){
        this.mapArray = [];

        for(var node in this.nodes){

            var nodeObj = this.nodes[node];
            var nodeArray = [];
            nodeArray.push(nodeObj.name);
            nodeArray.push(nodeObj.maps);
            this.mapArray.push(nodeArray);
        }
    }

    createReduceArray(){
        this.mreduceArray = [];

        for(var node in this.nodes){

            var nodeObj = this.nodes[node];
            var nodeArray = [];
            nodeArray.push(nodeObj.name);
            nodeArray.push(nodeObj.reducers);
            this.mapArray.push(nodeArray);
        }
    }



    updateView(){
       this.updateMapPieChart();
       this.updateReducePieChart();
    }

    updateMapPieChart(){
        var that = this;
        this.createMapArray();
        var chart = c3.generate({
            bindto: '#nodeTaskMaps',
            data: {
                // iris data from R
                columns: this.mapArray,
                type : 'pie',

            },
            tooltip: {
                contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                    var $$ = this, config = $$.config,
                        titleFormat = config.tooltip_format_title || defaultTitleFormat,
                        nameFormat = config.tooltip_format_name || function (name) {
                                return name;
                            },
                        valueFormat = config.tooltip_format_value || defaultValueFormat,
                        text, i, title, value, name, bgcolor;
                    for (i = 0; i < d.length; i++) {
                        if (!(d[i] && (d[i].value || d[i].value === 0))) {
                            continue;
                        }

                        if (!text) {
                            title = titleFormat ? titleFormat(d[i].x) : d[i].x;
                            text = "<table class='" + $$.CLASS.tooltip + "'>" + (title || title === 0 ? "<tr><th colspan='2'>" + title + "</th></tr>" : "");
                        }

                        name = nameFormat(d[i].name);
                        value = valueFormat(d[i].value, d[i].ratio, d[i].id, d[i].index);
                        bgcolor = $$.levelColor ? $$.levelColor(d[i].value) : color(d[i].id);

                        text += "<tr class='" + $$.CLASS.tooltipName + "-" + d[i].id + "'>";
                        text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + name + "</td>";
                        text += "<td class='value'>" + value + "</td>";
                        text += "</tr>";
                    }
                    //console.log(that.nodes[name]);

                    //add elapsedTime
                    text += "<tr class='" + $$.CLASS.tooltipName + "-" + d[0].id + "'>";
                    text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + "Total time" + "</td>";
                    text += "<td class='value'>" + that.nodes[name].elapsedTime + "</td>";
                    text += "</tr>";
                    //add total time
                    var totalTime = (that.nodes[name].endTime - that.nodes[name].startTime);
                    text += "<tr class='" + $$.CLASS.tooltipName + "-" + d[0].id + "'>";
                    text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + "Netto time" + "</td>";
                    text += "<td class='value'>" + totalTime + "</td>";
                    text += "</tr>";
                    //add load
                    text += "<tr class='" + $$.CLASS.tooltipName + "-" + d[0].id + "'>";
                    text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + "Load" + "</td>";
                    text += "<td class='value'>" + (that.nodes[name].elapsedTime / totalTime) + "</td>";
                    text += "</tr>";
                    //add amount of maps
                    var maps = that.nodes[name].maps;
                    text += "<tr class='" + $$.CLASS.tooltipName + "-" + d[0].id + "'>";
                    text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + "Map tasks" + "</td>";
                    text += "<td class='value'>" + maps + "</td>";
                    text += "</tr>";

                    return text + "</table>";
                    return text;
                }
            },
            legend: {
                show: false
            },
            title: {
                text: 'My Title'
            }
        });

    }

    updateReducePieChart(){
        var that = this;
        this.createReduceArray();
        var chart = c3.generate({
            bindto: '#nodeTaskReducers',
            data: {
                // iris data from R
                columns: this.mapArray,
                type : 'pie',

            },
            tooltip: {
                contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                    var $$ = this, config = $$.config,
                        titleFormat = config.tooltip_format_title || defaultTitleFormat,
                        nameFormat = config.tooltip_format_name || function (name) {
                                return name;
                            },
                        valueFormat = config.tooltip_format_value || defaultValueFormat,
                        text, i, title, value, name, bgcolor;
                    for (i = 0; i < d.length; i++) {
                        if (!(d[i] && (d[i].value || d[i].value === 0))) {
                            continue;
                        }

                        if (!text) {
                            title = titleFormat ? titleFormat(d[i].x) : d[i].x;
                            text = "<table class='" + $$.CLASS.tooltip + "'>" + (title || title === 0 ? "<tr><th colspan='2'>" + title + "</th></tr>" : "");
                        }

                        name = nameFormat(d[i].name);
                        value = valueFormat(d[i].value, d[i].ratio, d[i].id, d[i].index);
                        bgcolor = $$.levelColor ? $$.levelColor(d[i].value) : color(d[i].id);

                        text += "<tr class='" + $$.CLASS.tooltipName + "-" + d[i].id + "'>";
                        text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + name + "</td>";
                        text += "<td class='value'>" + value + "</td>";
                        text += "</tr>";
                    }
                    //console.log(that.nodes[name]);

                    //add elapsedTime
                    text += "<tr class='" + $$.CLASS.tooltipName + "-" + d[0].id + "'>";
                    text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + "elapsedTime" + "</td>";
                    text += "<td class='value'>" + that.nodes[name].elapsedTime + "</td>";
                    text += "</tr>";
                    //add total time
                    var totalTime = (that.nodes[name].endTime - that.nodes[name].startTime);
                    text += "<tr class='" + $$.CLASS.tooltipName + "-" + d[0].id + "'>";
                    text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + "Total time" + "</td>";
                    text += "<td class='value'>" + totalTime + "</td>";
                    text += "</tr>";
                    //add load
                    text += "<tr class='" + $$.CLASS.tooltipName + "-" + d[0].id + "'>";
                    text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + "Load" + "</td>";
                    text += "<td class='value'>" + (that.nodes[name].elapsedTime / totalTime) + "</td>";
                    text += "</tr>";
                    //add amount of maps
                    var reducers = that.nodes[name].reducers;
                    text += "<tr class='" + $$.CLASS.tooltipName + "-" + d[0].id + "'>";
                    text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + "Reduce tasks" + "</td>";
                    text += "<td class='value'>" + reducers + "</td>";
                    text += "</tr>";

                    return text + "</table>";
                    return text;
                }
            },
            legend: {
                show: false
            },
            title: {
                text: 'My Title'
            }
        });

    }

    /*
  updateView(){
    var that = this;
    this.createArrays();

    var chart = c3.generate({
        bindto: '#' + this.element.id,
        data: {
            columns: [
                this.maps,
                this.reducers
            ],
            type: 'bar',
            groups: [

            ],
            order: 'desc' // stack order by sum of values descendantly. this is default.
    //      order: 'asc'  // stack order by sum of values ascendantly.
    //      order: null   // stack order by data definition.
        },

        axis: {
          y:{
            label: {
              text: '#tasks',
              position: 'outer-middle'
            }
          },

          x: {
            type: 'category',
            categories: this.cats,
            label: {
              text: 'Nodes',
              position: 'outer-middle'
            }
          }
        },
        tooltip: {
        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                     var $$ = this, config = $$.config,
                         titleFormat = config.tooltip_format_title || defaultTitleFormat,
                         nameFormat = config.tooltip_format_name || function (name) { return name; },
                         valueFormat = config.tooltip_format_value || defaultValueFormat,
                         text, i, title, value, name, bgcolor;
                     for (i = 0; i < d.length; i++) {
                         if (! (d[i] && (d[i].value || d[i].value === 0))) { continue; }

                         if (! text) {
                             title = titleFormat ? titleFormat(d[i].x) : d[i].x;
                             text = "<table class='" + $$.CLASS.tooltip + "'>" + (title || title === 0 ? "<tr><th colspan='2'>" + title + "</th></tr>" : "");
                         }

                         name = nameFormat(d[i].name);
                         value = valueFormat(d[i].value, d[i].ratio, d[i].id, d[i].index);
                         bgcolor = $$.levelColor ? $$.levelColor(d[i].value) : color(d[i].id);

                         text += "<tr class='" + $$.CLASS.tooltipName + "-" + d[i].id + "'>";
                         text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + name + "</td>";
                         text += "<td class='value'>" + value + "</td>";
                         text += "</tr>";
                     }
                     //add elapsedTime
                     text += "<tr class='" + $$.CLASS.tooltipName + "-" + d[0].id + "'>";
                     text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + "elapsedTime" + "</td>";
                     text += "<td class='value'>" + that.nodes[title].elapsedTime+ "</td>";
                     text += "</tr>";
                     //add total time
                     var totalTime = (that.nodes[title].endTime -  that.nodes[title].startTime);
                     text += "<tr class='" + $$.CLASS.tooltipName + "-" + d[0].id + "'>";
                     text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + "Total time" + "</td>";
                     text += "<td class='value'>" + totalTime + "</td>";
                     text += "</tr>";
                     return text + "</table>";
                 }
    }});

  }
    */




}
