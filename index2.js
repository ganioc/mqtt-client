'use strict';

var HalfDuplex = require('./halfduplex.js');


(function main(){
    console.log('Hello');
    
    
    var port = new HalfDuplex();
    port.open();

    port.emit('query',
	      { 
		  'name': 1,
		  callback:function(){
		      console.log('query finished');
		  }
	      });

    

})();


