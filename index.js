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
const kurento = require('kurento-client');
const mysql = require('mysql');

/**Local classes and utilities */
const Router = require('./classes/Router');
const RegistryClass = require('./classes/Registry');
const Registry = new RegistryClass();
const network = require('./utils/network.js');
const SocketHandler = require('./classes/Socket.js');

/* Vars */
const redisPort = 6379;
const port = 5000;
const KURENTO_CLIENT_URI = 'ws://'+ network.getLocalIPv4() + ':8888/kurento';
const dbConfig = {
	connectionLimit : 10,
	host     : process.env.SQL_HOST,
	user     : process.env.SQL_USER,
	password : process.env.SQL_PASSWORD,
	database : process.env.SQL_DATABASE,
	charset  : 'utf8mb4'
};
const CONNECTION = mysql.createPool(dbConfig);

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
const RouteHandler = new Router(app, Registry, CONNECTION);
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
	getKurento()
	.then(async (kurentoClient) => {
		new SocketHandler(io, socket, Registry, kurentoClient, CONNECTION);
	})
})
process.on('SIGTERM', function () {
	io.sockets.emit('server shut down', {'timeout':5000});
	Registry.clearData();
	process.exit(0);
});