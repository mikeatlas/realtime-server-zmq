var forever = require('forever-monitor');

var child = new(forever.Monitor)('realtime-server-zmq.js', {
    //max: 3,
    silent: false,
    options: []
});

child.on('exit', function() {
    console.log('realtime-server-zmq has exited.');
});

child.start();