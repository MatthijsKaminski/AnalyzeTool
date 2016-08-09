"use strict";
class DiagnosisController {

    constructor() {
        this.tasksContainer = this.getElement("tasksDiagnosisContainer");
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
    addTaskDiagnostic(report){
        console.log(report);
        console.log(this.tasksContainer);
        this.tasksContainer.appendChild(report);
    }


    getPanelType(type){
        if(type.localeCompare("danger")== 0){
            return "panel-danger"
        }
        if(type.localeCompare("warning") == 0){
            return "panel-warning"
        }
        if(type.localeCompare("success") ==0){
            return "panel-success";
        }
        return "panel-default";
    }



    getElement(id){
        return document.getElementById(id);
    }




}