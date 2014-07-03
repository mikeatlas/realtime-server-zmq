var environment = require('./environment.js');

var zmq = environment.loadZmq();
var io = environment.loadSocketIo();

environment.authorize(io);