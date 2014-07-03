
zmq = require('zmq');

zmqSub = zmq.socket('sub');

zmqSub.subscribe('realtime_msg');
zmqSub.on('message', function(message) {
    console.log('Subscriber (node.js) message received: ' + message);
});

zmqSub.connect("tcp://localhost:5557");
