'use strict';
// I'm gateway client

var _ = require('underscore'); // functional lib
var Mqtt = require('mqtt');
var Duplexer = require('./duplexer.js');



var TOPIC_GATEWAY_MESSAGE = 'smartgarden/message';
var TOPIC_GATEWAY_STATUS  = 'smartgarden/status'; 
//var HOST = 'localhost';
var HOST = 'boxshell.cn';
var PORT = 1883;
var CLIENT_ID = 'client-1';

// mapping, param_id to src_ep, cluster_id, attr_id
var PARAM_ID_HEARTBEAT_PERIOD  = 0;
var PARAM_ID_TEMP              = 1;
var PARAM_ID_HUMIDITY          = 2;
var PARAM_ID_PH_VALUE          = 3;
var PARAM_ID_LIGHT_INTENSITY   = 4;
var PARAM_ID_SOIL_TEMP         = 5;

var mapParam2HA = {
    //PARAM_ID_HEARTBEAT_PERIOD
    0:{
	content: 'PARAM_ID_HEARTBEAT_PERIOD',
	clusterId: 0,
	attrId:    0
    },
    //PARAM_ID_TEMP
    1:{
	content:  'PARAM_ID_TEMP',
	clusterId: 0,
	attrId:    0
    },
    //PARAM_ID_HUMIDITY
    2:{
	content:  'PARAM_ID_HUMIDITY',
	clusterId: 0,
	attrId:    0
    },
    //PARAM_ID_PH_VALUE
    3:{
	content:  'PARAM_ID_PH_VALUE',
	clusterId: 0,
	attrId:    0
    },
    //PARAM_ID_LIGHT_INTENSITY
    4:{
	content:  'PARAM_ID_LIGHT_INTENSITY',
	clusterId: 0,
	attrId:    0
    },
    //PARAM_ID_SOIL_TEMP
    5:{
	content:  'PARAM_ID_SOIL_TEMP',
	clusterId: 0,
	attrId:    0
    }
};

// mapping , cmd_id to src_ep, cluster_id, cmd_id
var CMD_ID_TURN_ON_IRRIGATE       = 10;
var CMD_ID_TURN_OFF_IRRIGATE      = 11;
var CMD_ID_TURN_ON_PERMIT_JOINING = 12;


var mapCmd2HA = {
    //CMD_ID_TURN_ON_IRRIGATE
    10:{
	content:   'CMD_ID_TURN_ON_IRRIGATE',
	clusterId:  0,
	cmdId:      0
    },
    //CMD_ID_TURN_OFF_IRRIGATE
    11:{
	content:   'CMD_ID_TURN_OFF_IRRIGATE',
	clusterId:  0,
	cmdId:      0
    },
    //CMD_ID_TURN_ON_PERMIT_JOINING
    12:{
	content:    'CMD_ID_TURN_ON_PERMIT_JOINING',
	clusterId:  0,
	cmdId:      0
    }
};

// local chipId, shorAddr mapping


// mqtt client setting
var SETTINGS = {
    keepalive: 1000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clientId: CLIENT_ID
};



var client = Mqtt.connect('mqtt://'+HOST+':'+PORT, SETTINGS);
//var client = Mqtt.createClient(PORT, HOST, settings);
var duplexer = new Duplexer(
    {


    }
);

duplexer.open();


client.on('connect', function(){
    console.log("Connected");
    client.subscribe(TOPIC_GATEWAY_MESSAGE);
    //client.publish('presence',"Client", {retain: false, qa: 1});

    client.on('message',function(topic, msg){

	switch(topic){
	case TOPIC_GATEWAY_MESSAGE:
	    console.log('Topic:'+ topic + ' ' ,msg);
	    //processCmdFromCustomer(msg.toString().replace(/\n/,'').replace(/\r/,''));
	    processCmdFromCustomer(msg.toString());
	    break;
	default:
	    console.log('Unrecognized topic:' + msg.toString());
	    break;
	}
	
    });

    setInterval(function(){
	var nTime = JSON.stringify(new Date());
	var oStatus={
	    name:'status',
	    time:nTime
	};

	
	
	client.publish(TOPIC_GATEWAY_STATUS, JSON.stringify(oStatus));

    }, 20000);
});

function rCallback(err, obj){
    

}

function wCallback(err, obj){


}
function cCallback(err, obj){


}
function processCmdFromCustomer( msg ){
    // send out command to duplexer, according to the command type
    //console.log((msg));
    var cmd = JSON.parse(msg);
    var option;
    //console.log(cmd);

    switch(cmd.msg_type){
    case 'r':
	if( _.has(  mapParam2HA, cmd.param_id.toString()) ){
	    console.log("Read:" + cmd.param_id + ' '
			+ mapParam2HA[cmd.param_id.toString()].content);
	    option = {
		cmd:cmd,
		param: mapParam2HA[cmd.param_id.toString()]
	    };
	    duplexer.emit('addtask',option, rCallback );
	}
	break;
    case 'w':
	if( _.has( mapParam2HA. cmd.param_id.toString()) ){
	    console.log("Write:" + cmd.param_id + ' '
		    + mapParam2HA[cmd.param_id.toString()].content
			+ ' value:' + cmd.value);
	    option = {
		cmd: cmd,
		param: mapParam2HA[cmd.param_id.toString()]
	
	    };
	    duplexer.emit('addtask', option ,wCallback);
	}
	break;

    case 'c':// run command
	if( _.has( mapCmd2HA , cmd.cmd_id.toString()) ){
	    console.log("Run command:" + cmd.cmd_id + ' '
			+ mapCmd2HA[cmd.cmd_id.toString()].content
		       );
	    option = {
		cmd:   cmd,
		param: mapCmd2HA[cmd.cmd_id.toString()]
	    };
	    duplexer.emit('addtask',option ,cCallback);
	}

	break;
    default:
	console.log("Unrecognized msg_type:" + cmd.msg_type);
    }
}


