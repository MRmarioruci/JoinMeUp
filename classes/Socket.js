module.exports = function SocketHandler(io, socket, Registry, kurentoClient){
	let sk = this;
	socket.on('join room',(msg,cb) => {
		const user = Registry.getUser(msg.user_id);
		if(!user){
			cb('user does not exist', false);
		}else{
			user.setWebsocket(socket);
			let room = Registry.getRoom(msg.room);
			if(room){
				if(user.getRoomName() !== room.name){
					console.log(room.userCount);
					if(room.userCount < 3){
						console.log('Adding user ',user.getUsername(),' to room', msg.room);
						socket.join(msg.room, () => {
							room.userCount++;
							user.setRoomName(msg.room);
							console.log(room.name, 'has ', room.userCount, ' participants');
							cb(null, true);
						});
					}else{
						console.log('Room', msg.room, ' is full');
						cb('room full', false);
					}
				}else{
					socket.join(msg.room, () => {});
					console.log('User ',user.getUsername(),' already connected to room', msg.room);
					cb('already connected', false);
				}
			}else{
				console.log('room does not exist');
				console.log('Adding user ',user.getUsername(),' to room', msg.room);
				socket.join(msg.room,async () => {
					console.log('Registering room', msg.room);
					let room = await Registry.addRoom(kurentoClient, msg.room);
					if(user.getRoomName() != room.name) room.userCount++;
					console.log(room.name, 'has ', room.userCount, ' participants');
					cb(null, true);
				});
			}
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
		if(user){
			user.onIceCandidate(msg.candidate);
		}
	})
}