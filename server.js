"use strict";

class Server{

  constructor(hist,db){
    //create historyAPI interface instance
    this.hist = hist;
    this.historyserver = new HistoryServer(hist);
    //create mongodb interace instance
    this.database = new Database(db);
  }

  getAllJobs(func){
    if(this.historyserver){
      this.historyserver.fetchJobsOnServer(func);
    }else{
      ;
    }
  }


  getAllTasks(jobID,func){
    if(this.historyserver){
      this.historyserver.fetchJobTasks(jobID,func);
    }else {
      ;
    }
  }

  getTaskCounters(jobID,taskid, func){
    if(this.historyserver){
      this.historyserver.fetchTaskCounters(jobID, taskid, func);
    }else{
      ;
    }
  }

  getDatabaseConnection(func){
    if(this.database){
      this.database.useDatabase(function(db){
          func(db);
      })
    }
  }


  /***
  * Functions to save a server (all jobs, tasks and counters) to a mongodb
  ***/

  saveServerToDatabase(){
    var that = this;
    this.getDatabaseConnection(function(db){
      var collection = db.collection(that.hist);
      collection.remove({});
      that.saveJobs(db,null);
      //that.saveTasks(db);
    });
  }

  saveJobs(db,jobs){
    var that = this;
    if(jobs){
      var tosave = JSON.parse(jobs, function(k,v){return v;});
      this.insertOneToCollection(db,tosave);
      var jobs = tosave.jobs.job;
      var index;
      for (index = 0 ; index < jobs.length; index++){
        this.saveTasks(db,null, jobs[index]["id"]);
      }
      that.getJobsFromDatabase();
      //that.readFromMongoDb();
    }else{
      this.getAllJobs(function(respons){
        that.saveJobs(db, respons);
      })
    }
  }

  saveTasks(db,tasks, jobID){
    var that = this;
    if(tasks){
      var tosave = JSON.parse(tasks, function(k,v){return v;});
      tosave.jobid = jobID;
      this.insertOneToCollection(db,tosave);
      this.getJobTasksFromDatabase(null,null,"job_1456240498516_0008");
      var tasks = tosave.tasks.task;
      var index;
      for(index=0; index < tasks.length ; index++ ){
        this.saveTaskCounters(db,null, tasks[index]["id"],jobID);
        this.getTaskCountersFromDatabase(null,null, tasks[index]["id"], jobID);
      }

    }else{
      this.getAllTasks(jobID,function(respons){
        that.saveTasks(db, respons, jobID);
      })
    }
  }

  saveTaskCounters(db, taskcounters, taskID, jobID){
    var that = this;
    if(taskcounters){
      var tosave = JSON.parse(taskcounters, function(k,v){return v;});
      tosave.jobid = jobID;
      console.log(tosave);
      this.insertOneToCollection(db,tosave);

    }else{
      this.getTaskCounters(jobID, taskID, function(respons){
        that.saveTaskCounters(db, respons, taskID, jobID);
      })
    }
  }

  insertOneToCollection(db,tosave){
    var collection = db.collection(this.hist);
    collection.insertOne(tosave, function(err,result){
      if(err){
        console.log("error inserting " + err);
      }else{
        console.log("should be inserted");
      }
    });
  }


  /***
  * Functions to get info from the mongodb.
  ***/
  getJobsFromDatabase(db,func){
    if(db){
      console.log("getJobsFromDatabase");
      var cursor = db.collection(this.hist).find({jobs:{$exists: true}});
      cursor.each(function(err, doc) {
        if(err){;}
        else{
          if (doc != null) {
             console.dir(doc);
          } else {
             //callback();
             console.log("end of cursor or no Jobs found");
          }
        }
      });
    }else{
      var that = this;
      this.getDatabaseConnection(function(dbconn){
        that.getJobsFromDatabase(dbconn,func);
      })
    }
  }

  getJobTasksFromDatabase(db,func, jobID){
    if(db){
      console.log("getJobsTaskFromDatabase");
      var cursor = db.collection(this.hist).find({tasks:{$exists: true}, 'jobid': jobID});
      cursor.each(function(err, doc) {
        if(err){;}
        else{
          if (doc != null) {
             console.dir(doc);
          } else {
             //callback();
             console.log("end of cursor or no tasks found");
          }
        }
      });
    }else{
      var that = this;
      this.getDatabaseConnection(function(dbconn){
        that.getJobTasksFromDatabase(dbconn,func, jobID);
      })
    }
  }

  getTaskCountersFromDatabase(db,func, taskID,jobID){
    if(db){
      console.log("getTaskCountersFromDatabase");
      var cursor = db.collection(this.hist).find({jobTaskCounters:{$exists: true}, 'jobTaskCounters.id': taskID, 'jobid': jobID});
      cursor.each(function(err, doc) {
        if(err){console.log("error in query task counters" + err);}
        else{
          if (doc != null) {
             console.dir(doc);
          } else {
             //callback();
             console.log("end of cursor or no task counters found");
          }
        }
      });
    }else{
      var that = this;
      this.getDatabaseConnection(function(dbconn){
        that.getTaskCountersFromDatabase(dbconn,func, taskID, jobID);
      })
    }
  }


}
