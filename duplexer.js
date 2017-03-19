'use strict';


var EventEmitter = require('events').EventEmitter;
var Util = require('util');
var Task = require('./task.js');
var _ = require('underscore');

var SRC_EP = 8;
var DST_EP = 8;
var SCAN_PERIOD = 2000;
var SHORTADDR_LIFE_TIME = 60;


function Duplexer(options){
    var that = this;
    
    EventEmitter.call(this);

    // task queue
    this._queue = [];    

    // map chipId - shortAddr
    this._addrQueue = [];
}

Util.inherits(Duplexer, EventEmitter);

Duplexer.prototype.addTask  = function( obj, callback){
    this._queue.push( new Task(obj, callback) );
    
};

// task exists anyway
Duplexer.prototype.process = function(task){
    // false, not processed
    // true, processed , waiting for response
    if( task.bProcessed === false ){

	this.send(task);
	
	task.bProcessed = true;
    }
    else if( task.bDone === true  ){
    // bDone , be true when received response
	//
	console.log('Task already be done:' + task.cmd.msg_id);
    }
    else{
	var curTime = new Date().getTime();
	var deltaTime = curTime - task.timeStamp;

	if( deltaTime > task._timeout){
	    // timeout
	    task.timeout();
	    task.bDone = true;
	}
	else{
	    console.log('No timeout');
	}
    }

};

Duplexer.prototype.clean = function(){
    // remove task with bDone = true
    if( this._queue.length === 0){
	return;
    }
    
    console.log('queue len is before:' + this._queue.length);    
    //console.log( this._queue);
    
    this._queue = _.filter(this._queue, function(obj){
	return(obj.bDone === false);
    });

    console.log('after filtering queue len is:' + this._queue.length);
    //console.log(this._queue);
};
Duplexer.prototype.addAddr = function(chipId, shortAddr,deviceType){
    var addr = _.find(this._addrQueue, function(obj){
	return(obj.chipId === chipId);
    });

    if(addr){
	addr.life = SHORTADDR_LIFE_TIME;
    }else{
	this._addrQueue.push(
	    {
		life: SHORTADDR_LIFE_TIME,
		SN: chipId,
		shortAddr: shortAddr,
		deviceType: deviceType
	    }
	);
    }
};
Duplexer.prototype.syncAddrQueue = function(){
    if( this._addrQueue.length === 0){
	return;
    }
    _.each( this._addrQueue, function(obj){
	obj.life--;
    });
    
    this._addrQueue = _.filter(this._addrQueue, function(obj){
	return(obj.life > 0);
    });
    console.log('==>addrQueue');
    console.log(this._addrQueue);
};

Duplexer.prototype.send = function(task){
    console.log('Send out taskId:' + task.cmd.msg_id);

};

Duplexer.prototype.open = function(){
    var that = this;
    
    this.on('addtask',function(option, callback){
	console.log('-------------');
	console.log('add task:' , option);
	that.addTask( option, callback );
	
    });

    this.on('process', function(){

	console.log('Process queue');

	// Handle tasks in queue one by one
	// var task = that._queue[0];
	// if(task === undefined){
	//     return;
	// }
	
	// that.process( task );
	_.each(that._queue, function(obj){
	    console.log('==>Process task:' + obj.cmd.msg_id);
	    that.process(obj);
	});
	
	that.clean();

	that.syncAddrQueue();
    });

    // get message from the uart port, aimed at subsystem 14
    this.on('message',function(msg){
	// loop the message queue, find the 1st which will match the msg
	// by cmdId, clusterId, attId
	console.log('Duplexer got a message');
	
    });
    
    
    setInterval(function(){
	console.log('-------------');
	console.log('Emit process signal');
	that.emit('process');


    },SCAN_PERIOD);
};

module.exports = Duplexer;
