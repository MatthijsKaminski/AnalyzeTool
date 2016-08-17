"use strict";
class MapReduceConfig{

    constructor(configJSON){

        this.config = JSON.parse(configJSON, function(k,v){return v;}).conf;
        
    }

    getSetting(settingname){
        for(let index = 0; index < this.config.property.length; index++){
            let obj = this.config.property[index];
            if(obj.name.localeCompare(settingname) == 0){
                return obj.value;
            }
        }
        return undefined;
    }
}
