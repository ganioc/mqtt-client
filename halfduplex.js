'use strict';


var EventEmitter = require('events').EventEmitter;
var Util = require('util');

var seqID = 0;

function Task(options){
    this._id = seqID++;
    this._timeout = options.timeout || 200;// 200ms timeout
    
}

function HalfDuplex(options){
    var that = this;
    
    
    EventEmitter.call(this);
    this._queue = [];
    this._addr = options.addr || 0x0a;

}

Util.inherits(HalfDuplex, EventEmitter);



HalfDuplex.prototype.addTask  = function( obj){
    this._queue.push( new Task(obj) );
    
};

HalfDuplex.prototype.send = function(task){
    

};
/**
*  Put port received code here
*
*/
HalfDuplex.prototype.read = function(task){
    

};


HalfDuplex.prototype.open = function(){
    var that = this;
    
    this.on('query',function(query){
	console.log('query:' , query);
	that.addTask( query );
	
    });

    this.on('process', function(){
	
	// Handle tasks in queue one by one
	var task = that._queue[0];
	if(task === undefined){
	    return;
	}
	
	that.send( task );
	that.emit('receive');
    });

    this.on('receive',function(){
	console.log('Receive the feedback of the task');
	var task = that._queue[0];
	that.read( task );
    });
};

module.exports = HalfDuplex;

