"use strict";
class Servers{

  constructor(){
    this.servers = [];
  }
  addServer(historyserver, webhdfs, userdir, namenode, database,mongodbName, collectionname, useHistory){
    var server = new Server(historyserver,webhdfs, userdir, namenode, database,mongodbName, collectionname,useHistory);
    this.servers.push(server);
    return this.servers.length-1;
  }

  getServer(index){
    return this.servers[index];
  }
  
  save(index, mongo, mongodbName, collection){
    this.servers[index].save(mongo, mongodbName, collection);
  }

  updateServer(index, historyserver, webhdfs, userdir, namenode, database,mongodbName, collectionname, useHistory){
    this.servers[index].update(historyserver, webhdfs, userdir, namenode, database,mongodbName, collectionname, useHistory);

  }


}
