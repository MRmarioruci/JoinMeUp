/* Libraries */
const express = require("express");
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const redisClient  = redis.createClient();
const http = require("http").Server(app);
const io = require('socket.io')(http);
const { v4: uuidv4 } = require('uuid');
const kurento = require('kurento-client');

/**Local classes and utilities */
const RegistryClass = require('./classes/Registry');
const Registry = new RegistryClass();
const network = require('./utils/network.js');

/* Vars */
const redisPort = 6379;
const port = 5000;
const KURENTO_CLIENT_URI = 'ws://'+ network.getLocalIPv4() + ':8888/kurento';

app.get('/', (req,res)=>{
	res.json('Hello');
})
app.use(session({
    secret: 'secret',
    store: new redisStore({ host: 'localhost', port: redisPort, client: redisClient}),
    saveUninitialized: false,
    resave: false
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/isLoggedIn',(req,res) => {
	let o = {'status':'ok','data':false};
	let {session} = req;
    if(session.username && session.user_id){
		o.data = {'username':req.session.username,'user_id':req.session.user_id};
	}
	res.json(o);
});
app.post('/login',(req,res) => {
	let {session} = req;
	if(session.username && session.user_id) return res.json({'status':'err','data':'logged'});
	session.username = req.body.username;
	session.user_id = uuidv4();
	Registry.addUser({'username': session.username, 'user_id': session.user_id});
	let o = {'status':'ok','data':{
		'username':session.username,'user_id':session.user_id
	}};
	res.json(o);
});
app.post('/logout',(req,res) => {
	if(!req.session.username && !res.session.user_id) return res.json({'status':'err','data':'not logged'});
	let {session} = req;
	Registry.deleteUser(req.body.user_id);
	session.username = '';
	session.user_id = '';
	let o = {'status':'ok','data':{
		'username':session.username,'user_id':session.user_id
	}};
	res.json(o);
});
http.listen(port,() => {
	console.log(`Server started on port ${port}`);
})

const getKurento = () => {
	return new Promise(function (resolve, reject) {
		kurento(KURENTO_CLIENT_URI, function(error, kurentoClient) {
			if (error) {
				console.warn('Could not retrieve kurento media server ');
				reject(error);
			}else{
				resolve( kurentoClient );
			}
		});
	})
}
io.on('connection', (socket) => {
	socket.on('join room', (msg,cb) => {
		const user = Registry.getUser(msg.user_id);
		if(!user){
			cb(false);
		}else{
			user.setWebsocket(socket);
			socket.join(msg.room, () => {
				user.setRoomName(msg.room);
				getKurento()
				.then(async (kurentoClient) => {
					let new_room = await Registry.addRoom(kurentoClient, msg.room);
				})
				cb(true);
			});
		}
	})
	socket.on('send video', (msg,cb) => {
		const user = Registry.getUser(msg.user_id);
		if(!user){
			console.log('user does not exist');
			if(cb) cb(false);
		}else{
			let user_room = Registry.getRoom( user.getRoomName() );
			if(user_room){
				getKurento()
				.then(async (kurentoClient) => {
					user.sendVideo(msg,user_room);
					io.to(user_room.name).emit('offering media', {user_id: msg.user_id});
				})
			}
		}
	})
	socket.on('get peer video', (msg,cb) => {
		const user = Registry.getUser(msg.sender_id);
		if(!user){
			console.log('user does not exist asd');
			if(cb) cb(false);
		}else{
			const peer = Registry.getUser(msg.peer_user_id);
			if(peer){
				console.log('Connecting', peer.getUsername(), ' with ', user.getUsername())
				const sdpOffer = msg.sdpOffer;
				let peer_room = Registry.getRoom( peer.getRoomName() );
				getKurento()
				.then(async (kurentoClient) => {
					user.getPeerVideo(peer, peer_room, sdpOffer)
					.catch(function (error) {
						//
					})
				})
				//peer.getWebsocket().emit('offering media', {user_id: user.getId()});
			}
		}
	})
	socket.on('onIceCandidate', (msg,cb) => {
		const user = Registry.getUser(msg.user_id);
		if(user){
			getKurento()
			.then(async (kurentoClient) => {
				user.onIceCandidate(msg.candidate);
			})
		}
	})
})
process.on('SIGTERM', function () {
	io.socprocesskets.emit('server shut down', {'timeout':5000});
	process.exit(0);
});


//Benei
/* New Call
	check if room exists
		yes -> connect to room
		no -> create room and join
		-> When room is created create a media pipeline

Client
	receives connected message
	receives list of participants
		if(participants) subscribe to participants
			-> getVideo
			connect to media pipeline

		start sending video
		connect to media pipeline

*/