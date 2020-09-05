const kurento = require('kurento-client');

module.exports = function User(data) {
	const user = this;
	const id = data.user_id;
	const username = data.username;
	let websocket = null;
	let roomName = null;
	let outgoingWebRtcEndpoint = null;
	let incomingWebRtcEndpoint = null;
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
	user.setIncoming = (endpoint) => {
		incomingWebRtcEndpoint = endpoint;
	}
	user.getUsername = () => {
		return username;
	}
	user.sendVideo = async (data,room) => {
		const endpoint = await user.generateMedia(user, 'outgoing', room);
		const sdpAnswer = await endpoint.processOffer(data.sdpOffer);
		websocket.emit('my video', {
			"sdpAnswer": sdpAnswer,
		});
		await endpoint.gatherCandidates();
		return endpoint;
	}
	user.connect = function (peer) {
		return new Promise(function (resolve, reject) {
			user.getEndpoint().connect(peer.getEndpoint(), function (err) {
				if(err){
					console.log(err);
					reject(err);
				}else{
					console.log('Connected');
					resolve();
				}
			})
		})
	}
	user.getPeerVideo = async (peer, room, sdpOffer) => {
		await user.connect(peer);
		await peer.connect(user);
	}
	user.generateMedia = (target_user, type, room) => {
		return new Promise( (resolve,reject) => {
			room.pipeline.create('WebRtcEndpoint', (error, webRtcEndpoint) => {
				if (error) {
					console.error('Error creating endpoint', error);
					reject(error);
				}else{
					if(type == 'outgoing'){
						user.setOutgoing(webRtcEndpoint);
					}else{
						user.setIncoming(webRtcEndpoint);
					}
					webRtcEndpoint.on('OnIceCandidate', function(event) {
						const candidate = kurento.getComplexType('IceCandidate')(event.candidate);
						const response = {
							"user_id": target_user.getId(),
							"candidate": candidate,
						}
						target_user.getWebsocket().emit('iceCandidate',response);
					});
					resolve(webRtcEndpoint);
				}
			})
		})
	}
	user.onIceCandidate = ( _candidate) => {
		var candidate = kurento.register.complexTypes.IceCandidate(_candidate);
		outgoingWebRtcEndpoint.addIceCandidate(candidate);
	}
}