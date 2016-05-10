"use strict";
class Servers{

  constructor(){
    this.servers = [];
  }
  addServer(historyserver, database, collectionname){
    var server = new Server(historyserver, database, collectionname);
    this.servers.push(server);
    return this.servers.length-1;
  }

  getServer(index){
    return this.servers[index];
  }


}
