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

const redisPort = 6379;
const port = 5000;

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
	let o = {'status':'ok','data':{
		'username':session.username,'user_id':session.user_id
	}};
	res.json(o);
});
app.post('/logout',(req,res) => {
	if(!req.session.username && !res.session.user_id) return res.json({'status':'err','data':'not logged'});
	let {session} = req;
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
const kurentoClient = () => {
	return new Promise(function (resolve, reject) {
		kurento(KURENTO_CLIENT_URI, function(error, kurentoClient) {
			if (error) {
				console.warn('Could not retrieve kurento media server ');
				reject(error);
			}else{
				//resolve( new CallHandler(kurentoClient,connection) );
			}
		});
	})
}
io.on('connection', (socket) => {
	kurentoClient()
	//.then(callHandler)
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