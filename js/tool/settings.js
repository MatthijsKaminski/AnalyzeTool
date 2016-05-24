"use strict";

class Settings{
    constructor(controller){
        this.controller = controller;
        this.init();
    }

    init(){
        var options = {
            onText: "History",
            offColor: 'primary',
            offText: "Mongodb"
        };
        $("[name='use-server-db-switch-settings']").bootstrapSwitch(options);
        $("[name='use-server-db-switch-settings']").on('switchChange.bootstrapSwitch', function(event, state) {
            var mongoSettings = document.getElementById("settingsdbFieldSet");
            var histSettings = document.getElementById("settingsServerFieldSet");
            if(state == false){
                mongoSettings.disabled = false;
                histSettings.disabled = true;

            }else{
                mongoSettings.disabled = true;
                histSettings.disabled = false;
            }
        });
        this.initUpdateButton();
        this.initSaveButton();
    }

    initUpdateButton(){
        var that = this;
        this.updateButton = this.getElement("updateSettings");
        this.updateButton.addEventListener("click",function (e) {
            e.preventDefault();
            that.update();
        })
    }

    initSaveButton(){
        var that = this;
        this.saveButton = this.getElement("saveSettings");
        this.saveButton.addEventListener("click",function (e) {
            console.log("save clicked");
            e.preventDefault();

            SavingProgress.showProgress();
            that.save();
        })
    }

    update(){

    }

    save(){
        this.controller.saveActiveServer(this.getElement("mongodbInput-save").value,
        this.getElement("mongodbNameInput-save").value ,
        this.getElement("mongodbCollectionInput-save").value)
    }

    getElement(id){
        return document.getElementById(id);
    }

    setServer(name, hist, mongo, mongodbName, collection, useHistory){
        this.getElement("nameInput-settings").value = name;
        this.getElement("historyInput-settings").value = hist;
        this.getElement("mongodbInput-settings").value = mongo;
        this.getElement("mongodbNameInput-settings").value = mongodbName;
        this.getElement("mongodbCollectionInput-settings").value = collection;
        $("[name='use-server-db-switch-settings']").bootstrapSwitch('state', useHistory)
        var mongoSettings = document.getElementById("settingsdbFieldSet");
        var histSettings = document.getElementById("settingsServerFieldSet");
        if(useHistory == false){
            mongoSettings.disabled = false;
            histSettings.disabled = true;

        }else{
            mongoSettings.disabled = true;
            histSettings.disabled = false;
        }

    }
}