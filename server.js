"use strict";

class Server{

  constructor(hist,db, collection){
    //create historyAPI interface instance
    this.hist = hist;
    this.historyserver = new HistoryServer(hist);
    //save collecton name;
    this.collection = collection;
    //create mongodb interace instance
    this.database = new Database(db);
  }

  getSeverInfo(func){
    if(this.historyserver){
      this.historyserver.fetchServerInfo(func);
    }else{
      ;
    }
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

  getTaskCounters(jobID, taskID, func){
    if(this.historyserver){
      this.historyserver.fetchTaskCounters(jobID, taskID, func);
    }else{
      ;
    }
  }

  getTaskAttempts(jobID, taskID,func){
      if(this.historyserver){
          this.historyserver.fetchTaskAttempts(jobID, taskID, func);
      }else{
          ;
      }
  }

  getTaskAttemptCounters(jobID, taskID, attemptID, func){
    if(this.historyserver){
        this.historyserver.fetchTaskAttemptInfo(jobID, taskID,attemptID, func);
    }else{
        ;
    }
  }

  getJobCounters(jobID, func){
      if(this.historyserver){
          this.historyserver.fetchJobCounters(jobID, func);
      }else{
          ;
      }
  }

  getJobInfo(jobID, func){
      if(this.historyserver){
          this.historyserver.fetchJobInfo(jobID, func);
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
    console.log("test");
    var that = this;
    this.getDatabaseConnection(function(db){
      var collection = db.collection(that.hist);
      collection.remove({});
      that.saveServerInfo(db, null);
      that.saveJobs(db, null);
    });
  }

  saveServerInfo(db, info){
    var that = this;
    if(info){
      var tosave = JSON.parse(info, function(k,v){return v;});
      this.insertOneToCollection(db,tosave);
    }else{
      this.getSeverInfo(function(respons){
        that.saveServerInfo(db, respons);
      })
    }
  }

  saveJobs(db, jobs){
    var that = this;
    if(jobs){
      var tosave = JSON.parse(jobs, function(k,v){return v;});
      this.insertOneToCollection(db,tosave);
      var jobs = tosave.jobs.job;
      var index;
      for (index = 0 ; index < jobs.length; index++){
        var jobID = jobs[index]["id"];
        this.saveJobInfo(db, null, jobID);
        this.saveJobCounters(db, null, jobID);
        this.saveTasks(db, null, jobID);
      }
    }else{
      this.getAllJobs(function(respons){
        that.saveJobs(db, respons);
      })
    }
  }

  saveJobInfo(db, jobInfo, jobID){
    var that = this;
    if(jobInfo){
      var tosave = JSON.parse(jobInfo, function(k,v){return v;});
      this.insertOneToCollection(db,tosave);
    }else{
      this.getJobInfo(jobID,function(respons){
        that.saveJobInfo(db, respons, jobID);
      })
    }
  }


  saveJobCounters(db, jobCounters, jobID ){
    var that = this;
    if(jobCounters){
      var tosave = JSON.parse(jobCounters, function(k,v){return v;});
      this.insertOneToCollection(db,tosave);
    }else{
      this.getJobCounters(jobID, function(respons){
        that.saveJobCounters(db, respons, jobID);
      })
    }
  }

  saveTasks(db,tasks, jobID){
    var that = this;
    if(tasks){
      var tosave = JSON.parse(tasks, function(k,v){return v;});
      tosave.jobid = jobID;
      this.insertOneToCollection(db,tosave);
      var tasks = tosave.tasks.task;
      var index;
      for(index=0; index < tasks.length ; index++ ){
        var taskid = tasks[index]["id"];
        this.saveTaskCounters(db,null, taskid ,jobID);
        this.saveTaskAttempts(db,null,taskid, jobID);
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
      this.insertOneToCollection(db,tosave);
    }else{
      this.getTaskCounters(jobID, taskID, function(respons){
        that.saveTaskCounters(db, respons, taskID, jobID);
      })
    }
  }

  saveTaskAttempts(db, taskAttempts , taskID, jobID ){
    var that = this;
    if(taskAttempts){
      var tosave = JSON.parse(taskAttempts, function(k,v){return v;});
      tosave.jobid = jobID;
      tosave.taskid = taskID;
      this.insertOneToCollection(db,tosave);
    }else{
      this.getTaskAttempts(jobID, taskID, function(respons){
        that.saveTaskAttempts(db, respons, taskID, jobID);
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

  getSeverInfoFromDatabase(db,func){
    var that = this;
    if(db){
      console.log("getServerInfoFromDatabase");
      var cursor = db.collection(this.hist).find({historyInfo:{$exists: true}});
      cursor.each(function(err, doc) {
        that.cursorFunction(err,doc,func);
        });
    }else{
      this.getDatabaseConnection(function(dbconn){
        that.getSeverInfoFromDatabase(dbconn,func);
      })
    }
  }
  getJobsFromDatabase(db,func){
    var that = this;
    if(db){
      console.log("getJobsFromDatabase");
      var cursor = db.collection(this.hist).find({jobs:{$exists: true}});
      cursor.each(function(err, doc) {
        that.cursorFunction(err,doc,func);
        });
    }else{
      this.getDatabaseConnection(function(dbconn){
        that.getJobsFromDatabase(dbconn,func);
      })
    }
  }

  getJobInfoFromDatabase(db, func, jobID){
    var that = this;
    if(db){
      console.log("getJobInfoFromDatabase");
      var cursor = db.collection(this.hist).find({job:{$exists: true}, 'job.id' : jobID });
      cursor.each(function(err, doc) {
        that.cursorFunction(err,doc,func);
        });
    }else{
      this.getDatabaseConnection(function(dbconn){
        that.getJobInfoFromDatabase(dbconn, func, jobID);
      })
    }
  }


  getJobCountersFromDatabase(db, func, jobID){
    var that = this;
    if(db){
      console.log("getJobCountersFromDatabase");
      var cursor = db.collection(this.hist).find({jobCounters:{$exists: true}, 'jobCounters.id' : jobID });
      cursor.each(function(err, doc) {
        that.cursorFunction(err,doc,func);
        });
    }else{
      this.getDatabaseConnection(function(dbconn){
        that.getJobCountersFromDatabase(dbconn,func, jobID);
      })
    }
  }

  getJobTasksFromDatabase(db, func, jobID){
    var that = this;
    if(db){
      console.log("getJobsTaskFromDatabase");
      var cursor = db.collection(this.hist).find({tasks:{$exists: true}, 'jobid': jobID});
      cursor.each(function(err, doc) {
        that.cursorFunction(err,doc,func);
        });
    }else{
      this.getDatabaseConnection(function(dbconn){
        that.getJobTasksFromDatabase(dbconn,func, jobID);
      })
    }
  }

  getTaskCountersFromDatabase(db,func, taskID, jobID){
    var that = this;
    if(db){
      console.log("getTaskCountersFromDatabase");
      var cursor = db.collection(this.hist).find({jobTaskCounters:{$exists: true}, 'jobTaskCounters.id': taskID, 'jobid': jobID});
      cursor.each(function(err, doc) {
        that.cursorFunction(err,doc,func);
        });
    }else{
      this.getDatabaseConnection(function(dbconn){
        that.getTaskCountersFromDatabase(dbconn,func, taskID, jobID);
      })
    }
  }


  getTaskAttemptsFromDatabase(db, func, taskID, jobID){
    var that = this;
    if(db){
      console.log("getTaskAttemptsFromDatabase");
      var cursor = db.collection(this.hist).find({taskAttempts:{$exists: true}, 'taskid': taskID, 'jobid': jobID});
      cursor.each(function(err, doc) {
        that.cursorFunction(err,doc,func);
      });
    }else{
      this.getDatabaseConnection(function(dbconn){
        that.getTaskAttemptsFromDatabase(dbconn, func, taskID, jobID);
      })
    }
  }

cursorFunction(err,doc,func){
  if(err){console.log("error in call from database for function " + func + " error: " + err);}
  else{
    if (doc != null) {
       console.dir(doc);
       if(func){
         func(doc);
       }
    } else {
       console.log("end of cursor database call for " + func);
    }
  }
}





}
