var forever = require('forever-monitor');

var child = new(forever.Monitor)('server.js', {
    //max: 3,
    silent: false,
    options: []
});

child.on('exit', function() {
    console.log('server has exited.');
});

child.start();