import kurentoUtils from "kurento-utils";

function StartCommunication(sender_id, peer_user_id, socket) {
	socket.emit('get peer video', {
		sender_id : sender_id,
		peer_user_id : peer_user_id,
		sdpOffer : ''
	});
	return true;
}

export default StartCommunication
