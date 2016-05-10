"use strict";

class NodeOverview{

    constructor(element, nodeController){
        this.element = element;
        this.jobid = null;
        this.nodeController = nodeController;
        this.nodesArray = [];
    }

    setNodes(nodes){
        this.nodes = nodes;
    }

    updateView(){
        this.createNodeArray();
        this.clearAndLoadTable();
    }


    clearAndLoadTable(){
        var that = this;

        $(function () {
            $('#nodestable').bootstrapTable({
                data: that.nodesArray
            });
        });


        var $table = $('#nodestable');
        $('#nodestable').height('200')
        $(function () {
            $table.on('click-row.bs.table', function (e, row, $element) {
                $('.success').removeClass('success');
                $($element).addClass('success');
                that.selectedNode(row);
            });

        });
        $('#nodestable').bootstrapTable( 'resetView' , {height: 250} );
        setTimeout(function () {
            $('#nodestable').bootstrapTable( 'resetView' , {height: 250} );
        }, 1000);

    }


    selectedNode(node){
        this.nodeController.selectNode(node);
    }
    




    createNodeArray(){
        this.nodesArray = [];
        for(var node in this.nodes){

            this.nodesArray.push(this.nodes[node]);
        }
    }

}