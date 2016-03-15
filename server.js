"use strict";

class Server{

  constructor(hist,db){
    //create historyAPI interface instance
    this.historyserver = new HistoryServer(hist);
    //create mongodb interace instance
  }

  getAllJobs(func){
    this.historyserver.fetchJobsOnServer(func);
  }

  getAllTasks(jobID,func){
    this.historyserver.fetchJobTasks(func);
  }



}
