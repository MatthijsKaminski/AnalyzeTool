"use strict";

class Server{

  constructor(hist, webhdfs, userdir, namenode, db, dataBaseName, collection, useHistory){
    //create historyAPI interface instance
    this.hist = hist;
    this.historyserver = new HistoryServer(hist);
    this.webhdfs = new Webhdfs(webhdfs, userdir, namenode);
    //save database name
    this.dataBaseName = dataBaseName;
    //save collecton name;
    this.collection = collection;
    this.useHistory = useHistory;
    //create mongodb interace instance
    this.database = new Database(db, dataBaseName );

    //this.saveServerToDatabase();
    // this.getSeverInfoFromDatabase(null, function (info) {
    //   console.log(info);
    // })
  }

  update(hist, webhdfs, userdir, namenode, db, dataBaseName, collection, useHistory){
    this.useHistory = useHistory;
    this.historyserver.update(hist);
    this.webhdfs.update(webhdfs,userdir,namenode);
    this.database.update(db,dataBaseName);
    this.collection = collection;

  }

  getSeverInfo(func){
    if(this.useHistory){
      this.historyserver.fetchServerInfo(func);
    }else{
      this.getSeverInfoFromDatabase(null,func);
    }
  }

  getAllJobs(func){
    if(this.useHistory){
      console.log("fetch all jobs on server");
      this.historyserver.fetchJobsOnServer(func);
    }else{
      console.log("fetch all jobs on db")
      this.getJobsFromDatabase(null,func);
    }
  }


  getAllTasks(jobID,func){
    if(this.useHistory){
      this.historyserver.fetchJobTasks(jobID,func);
    }else {
      this.getJobTasksFromDatabase(null,func,jobID);
    }
  }

  getTaskCounters(jobID, taskID, func){
    if(this.useHistory){
      this.historyserver.fetchTaskCounters(jobID, taskID, func);
    }else{
      this.getTaskCountersFromDatabase(null,func,taskID,jobID);
    }
  }

  getTaskAttempts(jobID, taskID,func){
      if(this.useHistory){
          this.historyserver.fetchTaskAttempts(jobID, taskID, func);
      }else{
          this.getTaskAttemptsFromDatabase(null,func,taskID,jobID);
      }
  }

  getTaskAttemptCounters(jobID, taskID, attemptID, func){
    if(this.useHistory){
        this.historyserver.fetchTaskAttemptCounters(jobID, taskID,attemptID, func);
    }else{
        this.getTaskAttemptCountersFromDatabase(null,func,taskID,jobID,attemptID);
    }
  }

  getTaskAttemptStatCounters(jobID, taskID, attemptID, func){
    if(this.useHistory){
      this.webhdfs.fetchTaskAttemptStatCounters(attemptID, func);
    }else{
      this.getTaskAttemptStatCountersFromDatabase(null,func,taskID,jobID,attemptID);
    }
  }

  getJobCounters(jobID, func){
      if(this.useHistory){
          this.historyserver.fetchJobCounters(jobID, func);
      }else{
          this.getJobCountersFromDatabase(null,func,jobID);
      }
  }

  getJobInfo(jobID, func){
      if(this.useHistory){
          this.historyserver.fetchJobInfo(jobID, func);
      }else{
          this.getJobInfoFromDatabase(null,func,jobID);
      }
  }

  getJobConfig(jobID, func){
    if(this.useHistory){
      this.historyserver.fetchJobConfig(jobID, func);
    }else{
      this.getJobConfigFromDatabase(null,func,jobID);
    }
  }

  getTaskInfo(jobID, taskID, func){
    if(this.useHistory){
        this.historyserver.fetchTaskInfo(jobID, taskID, func);
    }else{
        
    }
  }

  getAttemptInfo(jobID, taskID, attemptID, func){
    if(this.useHistory){
        this.historyserver.fetchTaskAttemptInfo(jobID, taskID, attemptID, func);
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

  getSaveDatabaseConnection(func){
    if(this.saveDatabase){
      this.saveDatabase.useDatabase(function(db){
        func(db);
      })
    }
  }


  /***
  * Functions to save a server (all jobs, tasks and counters) to a mongodb
  ***/

  save(mongo, mongodbName, collection){
    this.saveDatabase = new Database(mongo , mongodbName);
    this.saveCollection = collection;
    this.saveServerToDatabase();
    this.jobs = 0;
    this.taskAttempts = 0;
  }

  saveServerToDatabase(){
    var that = this;
    this.getSaveDatabaseConnection(function(db){
      var collection = db.collection(that.saveCollection);
      collection.remove({});
      that.saveServerInfo(db, null);
      SavingProgress.increaseProgress(10);
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

  finishSaving(){
    if(this.jobs === 0){
      SavingProgress.hideProgress();
    }
  }

  saveJobs(db, jobs){
    var that = this;
    if(jobs){
      var tosave = JSON.parse(jobs, function(k,v){return v;});
      this.insertOneToCollection(db,tosave);
      var jobs = tosave.jobs.job;
      var index;
      this.jobs = jobs.length;
      for (index = 0 ; index < jobs.length; index++){
        var jobID = jobs[index]["id"];
        this.saveJobInfo(db, null, jobID);
        this.saveJobConfig(db, null, jobID);
        this.saveJobCounters(db, null, jobID);
        this.saveTasks(db, null, jobID);
      }
      SavingProgress.increaseProgress(30);
      this.finishSaving();
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

  saveJobConfig(db, jobConfig, jobID){
    var that = this;
    if(jobConfig){
      var tosave = JSON.parse(jobConfig, function(k,v){return v;});
      tosave.jobid = jobID;
      this.insertOneToCollection(db,tosave);

    }else{
      this.getJobConfig(jobID,function(respons){
        that.saveJobConfig(db, respons, jobID);
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

      this.jobs--;
      this.finishSaving();

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
      var taskAttemptsArray = tosave.taskAttempts.taskAttempt;
      this.taskAttempts +=  taskAttemptsArray.length;
      for(var index = 0; index < taskAttemptsArray.length ; index++){
        if(taskAttemptsArray[index].state.localeCompare("SUCCEEDED") === 0) {
          this.saveTaskAttemptStatCounters(db, null, taskAttemptsArray[index].id, taskID, jobID);
        }
        this.saveTaskAttemptCounters(db, null, taskAttemptsArray[index].id, taskID, jobID);
      }
    }else{
      this.getTaskAttempts(jobID, taskID, function(respons){
        that.saveTaskAttempts(db, respons, taskID, jobID);
      })
    }
  }

  saveTaskAttemptCounters(db, counters ,taskAttemptID ,taskID, jobID ){
    var that = this;
    if(counters){
      var tosave = JSON.parse(counters, function(k,v){return v;});
      tosave.jobid = jobID;
      tosave.taskid = taskID;
      tosave.taskAttemptid = taskAttemptID;
      this.insertOneToCollection(db,tosave);

      this.taskAttempts--;
      this.finishSaving();

    }else{
      this.getTaskAttemptCounters(jobID,taskID,taskAttemptID, function(respons){
        that.saveTaskAttemptCounters(db, respons, taskAttemptID, taskID, jobID);
      })
    }
  }

  saveTaskAttemptStatCounters(db, counters ,taskAttemptID ,taskID, jobID ){
    var that = this;
    if(counters){
      var tosave = JSON.parse(counters, function(k,v){return v;});
      tosave.jobid = jobID;
      tosave.taskid = taskID;
      this.insertOneToCollection(db,tosave);
    }else{
      this.getTaskAttemptStatCounters(jobID,taskID,taskAttemptID, function(respons){
        that.saveTaskAttemptStatCounters(db, respons, taskAttemptID, taskID, jobID);
      })
    }
  }

  insertOneToCollection(db,tosave){
    var collection = db.collection(this.saveCollection);
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
      
      var cursor = db.collection(this.collection).find({historyInfo:{$exists: true}});
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
      
      var cursor = db.collection(this.collection).find({jobs:{$exists: true}});
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
      
      var cursor = db.collection(this.collection).find({job:{$exists: true}, 'job.id' : jobID });
      cursor.each(function(err, doc) {
        that.cursorFunction(err,doc,func);
        });
    }else{
      this.getDatabaseConnection(function(dbconn){
        that.getJobInfoFromDatabase(dbconn, func, jobID);
      })
    }
  }

  getJobConfigFromDatabase(db, func, jobID){
    var that = this;
    if(db){
      var cursor = db.collection(this.collection).find({conf:{$exists: true}, 'jobid' : jobID });
      cursor.each(function(err, doc) {
        that.cursorFunction(err,doc,func);
      });
    }else{
      this.getDatabaseConnection(function(dbconn){
        that.getJobConfigFromDatabase(dbconn, func, jobID);
      })
    }
  }


  getJobCountersFromDatabase(db, func, jobID){
    var that = this;
    if(db){
      
      var cursor = db.collection(this.collection).find({jobCounters:{$exists: true}, 'jobCounters.id' : jobID });
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
      
      var cursor = db.collection(this.collection).find({tasks:{$exists: true}, 'jobid': jobID});
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
      
      var cursor = db.collection(this.collection).find({jobTaskCounters:{$exists: true}, 'jobTaskCounters.id': taskID, 'jobid': jobID});
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
      
      var cursor = db.collection(this.collection).find({taskAttempts:{$exists: true}, 'taskid': taskID, 'jobid': jobID});
      cursor.each(function(err, doc) {
        that.cursorFunction(err,doc,func);
      });
    }else{
      this.getDatabaseConnection(function(dbconn){
        that.getTaskAttemptsFromDatabase(dbconn, func, taskID, jobID);
      })
    }
  }

  getTaskAttemptCountersFromDatabase(db, func, taskID, jobID, attemptID){
    var that = this;
    if(db){
      
      var cursor = db.collection(this.collection).find({jobTaskAttemptCounters:{$exists: true}, 'taskid': taskID, 'jobid': jobID, 'taskAttemptid': attemptID });
      cursor.each(function(err, doc) {
        that.cursorFunction(err,doc,func);
      });
    }else{
      this.getDatabaseConnection(function(dbconn){
        that.getTaskAttemptCountersFromDatabase(dbconn, func, taskID, jobID, attemptID);
      })
    }
  }

  getTaskAttemptStatCountersFromDatabase(db, func, taskID, jobID, attemptID){
    var that = this;
    if(db){
      var cursor = db.collection(this.collection).find({stats:{$exists: true},'taskAttemptId': attemptID });
      cursor.each(function(err, doc) {
        that.cursorFunction(err,doc,func);
      });
    }else{
      this.getDatabaseConnection(function(dbconn){
        that.getTaskAttemptStatCountersFromDatabase(dbconn, func, taskID, jobID, attemptID);
      })
    }
  }

cursorFunction(err,doc,func){
  if(err){console.log("error in call from database for function " + func + " error: " + err);}
  else{
    if (doc != null){

       if(func){
         func(JSON.stringify(doc));
       }
    } else {
       //console.log("end of cursor database call for " + func);
    }
  }
}





}
