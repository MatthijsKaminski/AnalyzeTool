"use strict";
class Servers{

  constructor(){
    this.servers = [];
  }

  
  addServer(historyserver, database){
    var server = new Server(historyserver, database);
    this.servers.push(server);
    return this.servers.length-1;
  }

  getServer(index){
    return this.servers[index];
  }


}
