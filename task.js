'use strict';

var funcSeqId = (function(){
    var seqId = 0;
    return function(){
	if(seqId > 0xffff){
	    seqId = -1;
	}
	return seqId++;
    };
})();


function Task(options,callback){
    this._id = funcSeqId();
    this._timeout = options.timeout || 200;// 200ms timeout
    if(options.type === undefined){

	throw new Error('Task need options.type');
    }
    this.type = options.type;
    
    this.param = options.param;
}

module.exports = Task;
