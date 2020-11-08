import React, {useEffect, useState} from 'react'
import '../css/call.css'
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

function CallControls(props) {
	const [hasAudio, setAudio] = useState(true);
	const [hasVideo, setVideo] = useState(true);
	const editAudio = () => {
		let value = !hasAudio;
		const video = document.getElementById('videoInput');
		if(video){
			var mediaStream = video.srcObject;
			if(mediaStream){
				if(mediaStream.getAudioTracks().length > 0){
					if(mediaStream.getAudioTracks()[0]){
						mediaStream.getAudioTracks()[0].enabled = value;
						setAudio(value);
					}
				}
			}
		}
		props.socket.emit('edit media', {
			'type': 'audio',
			'value': value,
			'user_id': props.user_id
		}, function(d){});
	}
	const editVideo = () => {
		let value = !hasVideo;
		const video = document.getElementById('videoInput');
		if(video){
			var mediaStream = video.srcObject;
			if(mediaStream){
				if(mediaStream.getVideoTracks().length > 0){
					if(mediaStream.getVideoTracks()[0]){
						mediaStream.getVideoTracks()[0].enabled = value;
						setVideo(value);
					}
				}
			}
		}
		props.socket.emit('edit media', {
			'type': 'video',
			'value': value,
			'user_id': props.user_id
		}, function(d){});
	}
	useEffect(() => {
		tippy('[data-tippy-content]');
	}, [])
	return (
		<div className="call__controls">
			<button id="microphone" onClick={() => editAudio() } className="btn btn-light btn-round zoom__on-hover" data-tippy-content="Toggle microphone">
				{hasAudio ? <i className="fas fa-microphone-alt"></i> : <i className="fas fa-microphone-alt-slash"></i>}
			</button>
			&nbsp;
			<button onClick={() => { props.hangup(false) }} className="btn btn-danger btn-round zoom__on-hover" data-tippy-content="Hang up">
				<i className="fas fa-phone-slash"></i>
			</button>
			&nbsp;
			<button className="btn btn-light btn-round zoom__on-hover"  onClick={() => editVideo() } data-tippy-content="Toggle video">
				{hasVideo ? <i className="fas fa-video"></i> : <i className="fas fa-video-slash"></i>}
			</button>
		</div>
	)
}

export default CallControls
