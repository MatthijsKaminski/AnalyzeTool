"use strict";
class DiagnosisController {

    constructor() {
        this.tasksContainer = this.getElement("taskDiagnosisContainer");
        this.jobContainer = this.getElement("jobDiagnosisContainer");

    }

    setJob(){
        this.getElement("diagnoses-reveal").style.display = "block";
        this.getElement("diagnoses-no-job").style.display = "none";
    }

    clearJobs(){
        this.jobContainer.innerHTML = "";
    }

    addJobDiagnostic(report){
        
        this.jobContainer.appendChild(report);
    }

    clearTasks(){
        this.tasksContainer.innerHTML = "";
    }
    addTaskDiagnostic(element){
        this.tasksContainer.appendChild(element);
    }




    getElement(id){
        return document.getElementById(id);
    }




}