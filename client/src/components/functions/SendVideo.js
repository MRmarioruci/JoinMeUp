import kurentoUtils from "kurento-utils";

function SendVideo(socket,user_id, mediaStream) {
	const onIceCandidate = (candidate) => {
		socket.emit('onIceCandidate', {
			candidate: candidate,
			user_id: user_id,
		});
	}
	let fail = null;
	var videoInput = document.getElementById('videoInput');
	var videoOutput = document.getElementById('videoOutput');
	var constraints = {
		audio: true,
		video: {
			width: 320,
			framerate: 15
		}
	};
	var options = {
		videoStream: mediaStream,
		localVideo: videoInput,
		remoteVideo: videoOutput,
		onicecandidate : onIceCandidate,
		mediaConstraints: constraints
	};
	var rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function (error) {
		if(error) {
			fail = error
			return error;
		}
		this.generateOffer( (error, sdpOffer) => {
			if (error){
				fail = error;
				return console.error ("sdp offer error")
			}
			socket.emit('send video', {
				user_id : user_id,
				sdpOffer : sdpOffer
			});
		});
	});
	return {err: fail, rtcPeer: rtcPeer};
}

export default SendVideo
