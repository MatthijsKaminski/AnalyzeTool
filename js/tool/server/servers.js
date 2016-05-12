"use strict";
class Servers{

  constructor(){
    this.servers = [];
  }
  addServer(historyserver, database,mongodbName, collectionname, useHistory){
    var server = new Server(historyserver, database,mongodbName, collectionname,useHistory);
    this.servers.push(server);
    return this.servers.length-1;
  }

  getServer(index){
    return this.servers[index];
  }
  
  save(index, mongo, mongodbName, collection){
    this.servers[index].save(mongo, mongodbName, collection);
  }


}
