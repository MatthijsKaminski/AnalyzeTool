"use strict";

class BinnedHistogram{
    
    constructor(element, bins, label){
        this.element = element;
        this.data = undefined;
        this.dataPoint = undefined;
        this.amountOfBins = bins;
        this.label = label;
        this.selectedBinIndex = undefined;
        this.createContainer();
    }

    createContainer(){
        var div = document.createElement("div");
        div.innerHTML = "<h2>"+ this.label.title +"</h2>"+
            "<div  class='row panel panel-default'>" +
                "<div  class='panel-body'>"+
                    "<div id='" + (this.label.dataName + "HistContainer")  + "'></div>"+
                "</div>"
            "</div>"
        this.element.appendChild(div);
    }

    selectNode(node){
        if(node !== undefined)
            this.selectedDataPoint = node[this.label.dataName];
    }

    selectTaskAttempt(attempt){
        if(attempt !== undefined && attempt[this.label.dataName] !== undefined ){
            this.selectedDataPoint = attempt[this.label.dataName] ;
        }
    }
    getDataName(){
        return this.label.dataName;
    }
    
    setData(data){
        this.selectedBinIndex = undefined;
        this.data = data.sort(function(a, b){return a-b});
        this.dataPoint = undefined;
        this.min = Math.floor(this.data[0]);
        this.max = Math.ceil(this.data[this.data.length - 1]);
        this.binsize = (this.max - this.min) / this.amountOfBins;
        if(this.binsize == 0){
            this.binsize = 1;
        }
        if(this.binsize > 1){
            this.binsize = Math.ceil(this.binsize);
        }
        this.createBinArray();
        this.fillBinArray();
        this.createLabels();
    }
    
    selectedDataPoint(dataPoint){
        this.dataPoint = dataPoint;
        var current = this.min + this.binsize;
        this.selectedBinIndex = 0;
        while(dataPoint > current){
            current += this.binsize;
            this.selectedBinIndex++;
        }
    }

    updateView() {
        this.drawChart();
    }

    createLabels(){
        this.labels = ["x1"];
        var current = this.min;
        for(var index = 0; index < this.amountOfBins ; index++) {
            var next = (current + this.binsize);
            this.labels.push("" + parseFloat((current)).toFixed(2) + "-" + parseFloat(next).toFixed(2));
            current += this.binsize;
        }
    }

    createBinArray(){
        this.binArray = ["Data"];
        for(var index = 0; index < this.amountOfBins ; index++){
            this.binArray.push(0);
        }
    }

    fillBinArray(){
        var dataIndex = 0;
        var binIndex = 1;
        var bin = this.min + this.binsize;
        while (dataIndex < this.data.length){
            while(this.data[dataIndex] < bin){
                this.binArray[binIndex]++;
                dataIndex++;
            }
            binIndex++;
            bin += this.binsize;
        }



    }

    colorFunction(color, d){
        if(color !== undefined && this.selectedBinIndex !== undefined){
            if(color.index == this.selectedBinIndex  ){
                return '#ffff00';
            }else{
                return '#FF7F0E';
            }
        }
        return '#FF7F0E';
    }

    drawChart(){
        var that = this;
        var chart = c3.generate({
            bindto: '#' + (this.label.dataName + "HistContainer") ,
            data: {
                xs: {
                    'Data': 'x1'

                },
                columns: [
                    this.labels,
                    this.binArray
                ],
                type: 'bar',
                groups: [

                ],
                colors: {
                    Data: function(color,d){ return that.colorFunction(color,d,that)}
                }

            },
            grid: {
                y: {
                    lines: [{value:0}]
                }
            },
            axis: {

                y:{
                    label:{
                        text: this.label.y,
                        position: 'outer-middle'
                    }
                },
                x:{
                    type: 'category',
                    categories: this.cats,
                    label:{
                        text: this.label.x,
                        position: 'outer-middle'
                    }
                }
            },

            colors:{
                tasks: '#FF7F0E'
            },
            padding: {
                top: 40,
                right: 50,
                bottom: 40,
                left: 50,
            },
            legend: {
                show: false
            }

        });

    }
    
    
}





