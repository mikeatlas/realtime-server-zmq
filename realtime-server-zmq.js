var environment = require('./environment.js');

var redis = environment.loadRedis();
var zmq = environment.loadZmq();
var io = environment.loadSocketIo(redis);

environment.authorize(io, redis);