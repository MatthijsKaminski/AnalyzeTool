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
    var that = this;
    this.getDatabaseConnection(function(db){
      var collection = db.collection(that.hist);
      collection.remove({});
      that.saveJobs(db,null);
    });
  }

  saveJobs(db,jobs){
    var that = this;
    if(jobs){
      var tosave = JSON.parse(jobs, function(k,v){return v;});
      this.insertOneToCollection(db,tosave);
      var jobs = tosave.jobs.job;
      var index;
      console.log("jobs: " + jobs.length);
      for (index = 0 ; index < jobs.length; index++){
        var jobID = jobs[index]["id"];
        this.saveJobInfo(db, null, jobID);
        //this.saveJobCounters(db, null, jobID);
        //this.saveTasks(db, null, jobID);
      }
      this.getJobsFromDatabase();
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
      console.log(tosave);
      this.insertOneToCollection(db,tosave);
      this.getJobInfoFromDatabase(null, null, jobID )
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
      this.getJobCountersFromDatabase(null, null, jobID);
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
      this.getJobTasksFromDatabase(null,null,"job_1456240498516_0008");
      var tasks = tosave.tasks.task;
      var index;
      for(index=0; index < tasks.length ; index++ ){
        var taskid = tasks[index]["id"];
        this.saveTaskCounters(db,null, taskid ,jobID);
        this.getTaskCountersFromDatabase(null,null, taskid, jobID);
        this.saveTaskAttempts(db,null,taskid, jobID);
        this.getTaskAttemptsFromDatabase(null,null,taskid, jobID);
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
  
  getJobInfoFromDatabase(db, func, jobID){
    if(db){
      console.log("getJobInfoFromDatabase");
      var cursor = db.collection(this.hist).find({job:{$exists: true}, 'job.id' : jobID });
      cursor.each(function(err, doc) {
        if(err){;}
        else{
          if (doc != null) {
             console.dir(doc);
          } else {
             //callback();
             console.log("end of cursor or no JobInfo found");
          }
        }
      });
    }else{
      var that = this;
      this.getDatabaseConnection(function(dbconn){
        that.getJobInfoFromDatabase(dbconn, func, jobID);
      })
    }
  }
  
  
  getJobCountersFromDatabase(db, func, jobID){
    if(db){
      console.log("getJobCountersFromDatabase");
      var cursor = db.collection(this.hist).find({jobCounters:{$exists: true}, 'jobCounters.id' : jobID });
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
        that.getJobCountersFromDatabase(dbconn, jobID,func);
      })
    }
  }

  getJobTasksFromDatabase(db, func, jobID){
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
             console.log("end of cursor or no job tasks found");
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

  getTaskCountersFromDatabase(db,func, taskID, jobID){
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
  
  
  getTaskAttemptsFromDatabase(db,func, taskID, jobID){
    if(db){
      console.log("getTaskAttemptsFromDatabase");
      var cursor = db.collection(this.hist).find({taskAttempts:{$exists: true}, 'taskid': taskID, 'jobid': jobID});
      cursor.each(function(err, doc) {
        if(err){console.log("error in query task attempts" + err);}
        else{
          if (doc != null) {
             console.dir(doc);
          } else {
             //callback();
             console.log("end of cursor or no task attempts found");
          }
        }
      });
    }else{
      var that = this;
      this.getDatabaseConnection(function(dbconn){
        that.getTaskAttemptsFromDatabase(dbconn,func, taskID, jobID);
      })
    }
  }
  
  


}
