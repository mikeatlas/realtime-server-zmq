module.exports = {

	loadZmq: function loadZmq(){
		var pullPort = 5556;
		var pushPort = 5557;

		zmq = require('zmq');

		zmqPuller = zmq.socket('pull');
		zmqPub = zmq.socket('pub');

		zmqPuller.on('message', function(message) {
		    console.log('zmq message received: ' + message);

		    //publish the message out to subscribers (socketIo)
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

		return {
			zmq: zmq,
			zmqPuller: zmqPuller,
			zmqPub: zmqPub	
		};
	},
    
    loadSocketIo: function loadSocketIo() {

        var port = process.env.PORT || 5001;
        if (process.env.NODE_ENV != 'production') {
            port = 5001; // run on a different port when in non-production mode.
        }

		var zmq = require('zmq');

		var zmqSubscriberSessionStore = zmq.socket('sub');
		zmqSubscriberSessionStore.subscribe('rtSession');
		zmqSubscriberSessionStore.on('message', function(message) {
			actualMessage = message.toString().split('rtSession:')[1]
			msg = JSON.parse(actualMessage);
			var cache = require('memory-cache');			
			userId = msg.user_id;
			sessionId = msg.session_id;
			sessionData = msg.session_data;
			sessionExpiration = msg.expiration;
			sessionKey = "rtSession-" + userId + "-" + sessionId;			
			cache.put(sessionKey, sessionData);
			session = cache.get(sessionKey);
		});
		zmqSubscriberSessionStore.connect("tcp://localhost:5557");

        var io = require('socket.io').listen(Number(port));

        io.on('connection', function(socket) {

            socket.on('realtime_user_id_connected', function(message) {
                console.log('Realtime User ID connected: ' + message.userId);
            });

			var zmqSubscriberRealtimeMessage = zmq.socket('sub');
			zmqSubscriberRealtimeMessage.subscribe('realtime_msg');
			zmqSubscriberRealtimeMessage.on('message', function(message) {
			    console.log('Subscriber (node.js) message received: ' + message);
			   	actualMessage = message.toString().split('realtime_msg:')[1]
			 
			    msg = JSON.parse(actualMessage);
			   	
                // can't deliver a message to a socket with no handshake(session) established
                if (socket.request === undefined) {
                    return;
                }

			    var currentSocketIoUserId = socket.request.session['user_id'];

			    // if the recipient user id list is not part of the message
                // then define it anyways.
                if (msg.recipient_user_ids === undefined || msg.recipient_user_ids == null) {
                    msg.recipient_user_ids = [];
                }

                if (msg.recipient_user_ids.indexOf(currentSocketIoUserId) != -1) {
                    delete msg.recipient_user_ids; //don't include this with the message
                    socket.emit('realtime_msg', msg);
                }
			});

			zmqSubscriberRealtimeMessage.connect("tcp://localhost:5557");

        });

        return io;
    },

    authorize: function authorize(io) {
        io.use(function(socket, next) {
           
            var sessionId = null;
            var userId = null;

            var url = require('url');
            requestUrl = url.parse(socket.request.url);
            requestQuery = requestUrl.query;
            requestParams = requestQuery.split('&');
            params = {};
            for (i=0; i<=requestParams.length; i++){
                param = requestParams[i];
                if (param){
                    var p=param.split('=');
                    if (p.length != 2) { continue };
                    params[p[0]] = p[1];
                }
            }

            sessionId = params["_rtToken"];
            userId = params["_rtUserId"];

            var cache = require('memory-cache');
            sessionKey = "rtSession-" + userId + "-" + sessionId;
            session = cache.get(sessionKey);

            if (session != null){
            	 socket.request.session = JSON.parse(session);
                 next()
            }
            else {
            	next(new Error('Unauthorized Realtime user (session)'));
            }    
        });
    },
}