'use strict';


var EventEmitter = require('events').EventEmitter;
var Util = require('util');
var Task = require('./task.js');


function Duplexer(options){
    var that = this;
    
    
    EventEmitter.call(this);
    this._queue = [];    

}


Util.inherits(Duplexer, EventEmitter);


Duplexer.prototype.addTask  = function( obj){
    this._queue.push( new Task(obj) );
    
};

Duplexer.prototype.send = function(task){
    console.log('Send ' + task.type);

};
/**
*  Put port received code here
*  We may receive report, response or anything else
*/
Duplexer.prototype.read = function(task){
    

};


Duplexer.prototype.open = function(){
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
	console.log('Receive');
	var task = that._queue[0];
	that.read( task );
    });
    
};

module.exports = Duplexer;
