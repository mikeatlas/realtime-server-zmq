var pullPort = 5556;
var pushPort = 5557;

zmq = require('zmq');

zmqPuller = zmq.socket('pull');
zmqPub = zmq.socket('pub');


zmqPuller.on('message', function(message) {
    console.log('zmq message received: ' + message);

    //publish the message out to subscribers
    zmqPub.send(message)
});


zmqPuller.bind("tcp://*:"+pullPort, function(error) {
  if (error){
  	console.log('error binding puller: ' + error);
  }
  console.log('Listening for zmq pushers...');
});


zmqPub.bind('tcp://*:'+pushPort, function(error) {
  if (error){
  	console.log('error binding publisher: ' + error);
  }
  console.log('Listening for zmq subscribers...');
});