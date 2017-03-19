'use strict';
// I'm gateway client

var TOPIC_GATEWAY_MESSAGE = 'smartgarden/message';
var TOPIC_GATEWAY_STATUS  = 'smartgarden/status'; 
var HOST = 'localhost';
var PORT = 1883;
var CLIENT_ID = 'client-1';

var SETTINGS = {
    keepalive: 1000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clientId: CLIENT_ID
};

var Mqtt = require('mqtt');
var Duplexer = require('./duplexer.js');


var client = Mqtt.connect('mqtt://'+HOST+':'+PORT, SETTINGS);
//var client = Mqtt.createClient(PORT, HOST, settings);

client.on('connect', function(){
    console.log("Connected");
    client.subscribe(TOPIC_GATEWAY_MESSAGE);
    //client.publish('presence',"Client", {retain: false, qa: 1});

    client.on('message',function(topic, msg){

	switch(topic){
	case TOPIC_GATEWAY_MESSAGE:
	    console.log('Topic:'+ topic + ' ' + msg.toString());
	    processCmdFromCustomer(msg);
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

    }, 5000);
});

function processCmdFromCustomer( msg ){
    // send out command to duplexer, according to the command type


}
