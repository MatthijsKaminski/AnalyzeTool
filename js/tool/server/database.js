
"use strict";
class Database{
  constructor(url, databaseName){
    this.url = "mongodb://" + url + "/"+ databaseName;
    var mongodb = require('mongodb');
    this.MongoClient = mongodb.MongoClient;
  }

  update(url, databaseName){
    this.url = "mongodb://" + url + "/"+ databaseName;
  }

  useDatabase(func){
    var url = this.url
    this.MongoClient.connect(url, function (err, db) {

      if (err) {
        ErrorBox.showError("could not connect to database");
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        //HURRAY!! We are connected. :)
        //console.log('Connection established to', url);

        func(db);


      }
    });
  }
}
