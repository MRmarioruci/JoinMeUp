const kurento = require('kurento-client');

module.exports = function User(data) {
	const user = this;
	const id = data.user_id;
	const username = data.username;
	let websocket = null;
	let roomName = null;
	let outgoingWebRtcEndpoint = null;
	let peer = null;
	user.getId = () => {
		return id;
	}
	user.setWebsocket = (new_websocket) => {
		websocket = new_websocket;
	}
	user.getWebsocket = () => {
		return websocket;
	}
	user.setRoomName = (new_room) => {
		roomName = new_room;
	}
	user.getRoomName = () => {
		return roomName;
	}
	user.getEndpoint = () => {
		return outgoingWebRtcEndpoint;
	}
	user.setOutgoing = (endpoint) => {
		outgoingWebRtcEndpoint = endpoint;
	}
	user.setPeer = (p) => {
		peer = p;
	}
	user.getPeer = () => {
		return peer;
	}
	user.getUsername = () => {
		return username;
	}
	user.sendVideo = async (data,room) => {
		console.log(`Generating endpoint for user ${user.getId()}`);
		const endpoint = await user.generateEndpoint(room);
		console.log(`Processing offer for user ${user.getId()}`);
		const sdpAnswer = await endpoint.processOffer(data.sdpOffer);
		console.log(`Gathering candidated for user ${user.getId()}`);
		await endpoint.gatherCandidates();
		websocket.emit('process answer', {
			"sdpAnswer": sdpAnswer,
		});
		return endpoint;
	}
	user.connect = function (peer) {
		return new Promise(function (resolve, reject) {
			user.getEndpoint().connect(peer.getEndpoint(), function (err) {
				if(err){
					console.log(err);
					reject(err);
				}else{
					console.log('Connected', user.getUsername(), 'with ', peer.getUsername());
					resolve();
				}
			})
		})
	}
	user.getPeerVideo = async (peer, room, sdpOffer) => {
		await user.connect(peer);
		await peer.connect(user);
		user.setPeer(peer);
		peer.setPeer(user);
	}
	user.generateEndpoint = (room) => {
		return new Promise( (resolve,reject) => {
			room.pipeline.create('WebRtcEndpoint', (error, webRtcEndpoint) => {
				if (error) {
					console.error('Error creating endpoint', error);
					reject(error);
				}else{
					user.setOutgoing(webRtcEndpoint);
					webRtcEndpoint.on('OnIceCandidate', function(event) {
						const candidate = kurento.getComplexType('IceCandidate')(event.candidate);
						const response = {
							"user_id": user.getId(),
							"candidate": candidate,
						}
						user.getWebsocket().emit('iceCandidate',response);
					});
					resolve(webRtcEndpoint);
				}
			})
		})
	}
	user.onIceCandidate = ( _candidate) => {
		var candidate = kurento.register.complexTypes.IceCandidate(_candidate);
		if(outgoingWebRtcEndpoint) outgoingWebRtcEndpoint.addIceCandidate(candidate);
	}
	user.disconnect = () => {
		return new Promise(function (resolve, reject) {
			if(user.getEndpoint()){
				user.getEndpoint().disconnect(user.getPeer().getEndpoint(), function (err) {
					if(err){
						console.log(err);
						reject(err);
					}else{
						if(user.getPeer()){
							user.getPeer().getWebsocket().emit('peer left', {'peer_id': user.getId()});
						}
						user.setPeer(null);
						user.setOutgoing(null);
						console.log('Disconected', user.getUsername());
						resolve();
					}
				})
				user.getEndpoint().release();
			}
		})
	}
}