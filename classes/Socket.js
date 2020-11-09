const User_Model = require("../models/User_Model");

module.exports = function SocketHandler(io, socket, Registry, kurentoClient, CONNECTION){
	let sk = this;
	socket.on('join room',async (msg,cb) => {
		const user = Registry.getUser(msg.user_id);
		if(!user){
			cb('user does not exist', false);
		}else{
			user.setWebsocket(socket);
			let room = Registry.getRoom(msg.room);
			if(room){
				if(user.getRoomName() !== room.name){
					if(room.userCount < 3){
						console.log('Adding user ',user.getUsername(),' to room', msg.room);
						cb(null, {logged: join(room, user) });
					}else{
						console.log(`Room ${msg.room} is full`);
						cb('room full', false);
					}
				}else{
					cb(null, {logged: join(room, user) });
				}
			}else{
				console.log('room does not exist');
				console.log('Adding user ',user.getUsername(),' to room', msg.room);
				console.log('Registering room', msg.room);
				let room = await Registry.addRoom(kurentoClient, msg.room, user.getId(), CONNECTION).catch( () => {});
				if(room){
					cb(null, {logged: join(room, user) });
				}
			}
		}
	})
	socket.on('send video', (msg,cb) => {
		const user = Registry.getUser(msg.user_id);
		if(!user){
			console.log(`User ${msg.user_id} is not registered`);
			if(cb) cb(false);
		}else{
			let user_room = Registry.getRoom( user.getRoomName() );
			if(user_room){
				user.sendVideo(msg,user_room);
				io.to(user_room.name).emit('offering media', {user_id: msg.user_id});
			}
		}
	})
	socket.on('get peer video', (msg,cb) => {
		const user = Registry.getUser(msg.sender_id);
		if(!user){
			console.log('user does not exist');
			if(cb) cb(false);
		}else{
			const peer = Registry.getUser(msg.peer_user_id);
			if(peer){
				console.log('Connecting', peer.getUsername(), ' with ', user.getUsername())
				const sdpOffer = msg.sdpOffer;
				let peer_room = Registry.getRoom( peer.getRoomName() );
				user.getPeerVideo(peer, peer_room, sdpOffer)
				.catch(function (error) {

				})
			}
		}
	})
	socket.on('onIceCandidate', (msg,cb) => {
		const user = Registry.getUser(msg.user_id);
		if(user && user.getEndpoint()){
			user.onIceCandidate(msg.candidate);
		}
	})
	socket.on('dispose',async (msg, cb) => {
		const user = Registry.getUser(msg.user_id);
		if(!user){
			console.log(`User ${msg.user_id} is not registered`);
			if(cb) cb(false);
		}else{
			const room = Registry.getRoom( user.getRoomName() );
			if(room){
				room.decreaseCounter();
			}
			await user.disconnect();
			console.log(`User ${msg.user_id} left room ${room.name}`);
		}
	})
	socket.on('disconnect',async () => {
		const user = Registry.getByWebsocket(socket);
		if(user){
			const room = Registry.getRoom( user.getRoomName() );
			if(room){
				room.decreaseCounter();
			}
			await user.disconnect();
			Registry.deleteUser(user.getId());
		}
	})
	socket.on('edit media',(msg, cb) => {
		const user = Registry.getUser(msg.user_id);
		if(!user){
			console.log(`User ${msg.user_id} is not registered`);
			if(cb) cb(false);
		}else{
			user.editMedia(msg.type, msg.value);
			if(cb) cb(true);
		}
	})
	function join(room, user){
		let loggedUsers = Registry.getUsersByRoom(room.name);
		socket.join(room.name, async () => {
			if(user.getRoomName() != room.name){
				room.increaseCounter();
				user.setRoomName(room.name);
				await User_Model.addUserToRoom(room.db_id, user.getId(), CONNECTION).catch( (err) => {
					console.log(err);
				})
			}
		});
		return loggedUsers;
	}
}