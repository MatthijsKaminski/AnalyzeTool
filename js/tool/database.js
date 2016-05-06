
"use strict";
class Database{
  constructor(url){
    this.url = "mongodb://" + url;
    var mongodb = require('mongodb');
    this.MongoClient = mongodb.MongoClient;
  }

  useDatabase(func){
    var url = this.url
    this.MongoClient.connect(url, function (err, db) {

      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        //HURRAY!! We are connected. :)
        console.log('Connection established to', url);

        func(db);


      }
    });
  }
}
