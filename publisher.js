zmq = require('zmq'),

zmqPub = zmq.socket('pub');

zmqPub.bind('tcp://*:5556', function(error) {
  if (error){
  	console.log('error binding: ' + error);
  }
  console.log('Listening for zmq subscribers...');
});

setInterval(function() {	
	realtimeMsg = {msg: "Hello World - " + new Date()};
	publishMsg = "realtime_msg:" + JSON.stringify(realtimeMsg);
	console.log('publishing message... ' + publishMsg);
	zmqPub.send(publishMsg);
}, 1000);
