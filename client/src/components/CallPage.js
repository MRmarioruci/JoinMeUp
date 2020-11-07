import React, { Component } from 'react';
import socketClient from "socket.io-client";
import '../css/call.css';
import CallControls from './CallControls';
import Rate from './Rate';
import SendVideo from './functions/SendVideo';
import StartCommunication from './functions/StartCommunication';

class CallPage extends Component {
	constructor(props) {
		super(props)

		this.state = {
			onCall: true,
			joinedRoom: false,
			rtcPeer:'',
			peer_user_id: '',
			socket: '',
			hasAudio: true,
			hasMicrophone: true,
			hasVideo: true,
			hasCamera: true,
			mediaStream: '',
			availableAudioDevices : [],
			availableVideoDevices : [],
			selectedAudioSource: '',
			selectedVideoSource: '',
		}
		this.socket = '';
		this.triedDefaultMedia = false;
		this.setCallState = this.setCallState.bind(this)
		this.onCallPage = this.onCallPage.bind(this)
		this.joinRoom = this.joinRoom.bind(this)
		this.startSending = this.startSending.bind(this)
		this._changeAudioSource = this._changeAudioSource.bind(this)
		this._changeVideoSource = this._changeVideoSource.bind(this)
		this._handleMediaError = this._handleMediaError.bind(this)
		this._getUserMedia = this._getUserMedia.bind(this)
		this.listDevices = this.listDevices.bind(this)
	}
	setCallState = (newState) => {
		this.setState({
			onCall:newState
		})
	}
	componentDidMount(){
		this.socket = socketClient('http://localhost:5000');
		this.joinRoom();
		this.socket.on('iceCandidate', (msg) => {
			if(!this.state.rtcPeer) return false;
			this.state.rtcPeer.addIceCandidate(msg.candidate, function (error) {
				if (error) {
					console.error("Error adding candidate: " + error);
					return;
				}
			});
		});
		this.socket.on('process answer', (msg) => {
			if(!this.state.rtcPeer) return false;
			this.state.rtcPeer.processAnswer (msg.sdpAnswer, function (error) {
				if (error) return console.error (error);
			});
		});
		this.socket.on('offering media', (msg) => {
			this.getPeerVideoIfNeeded(msg.user_id);
		});
		this.socket.on('started communication', (msg) => {
			console.log(msg);
		});
		this.socket.on('disconnect', (msg) => {
			console.log(msg);
		})
	}
	getPeerVideoIfNeeded(user_id){
		if(user_id != this.props.user_id){
			this.setState({
				peer_user_id: user_id
			}, () => {
				console.log('Peer joined, starting communication')
				StartCommunication(this.props.user_id, user_id, this.socket)
			})
		}
	}
	joinRoom = () => {
		let msg = {
			'user_id': this.props.user_id,
			'room': this.props.match.params.id
		}
		this.socket.emit('join room', msg, (err, data) => {
			if(data){
				this._getUserMedia();
				data.logged.map( user => {
					if(user !== this.state.user_id){
						this.getPeerVideoIfNeeded(user);
					}
				})
			}
		})
	}
	_changeAudioSource = (source) => {
		this.setState({
			selectedAudioDevice: source
		})
		this.startSending();
	}
	_changeVideoSource = (source) => {
		this.setState({
			selectedVideoDevice: source
		})
		this.startSending();
	}
	_handleMediaError = (error) => {
		if(error){
			if(!this.state.userMediaStream){
				if(!this.triedDefaultMedia){
					this._changeAudioSource( this.state.availableAudioDevices[0] );
					this._changeVideoSource( this.state.availableVideoDevices[0] );
					this.triedDefaultMedia = true;
				}
			}
		}
		console.warn('GET USER MEDIA ERROR',error);
	}
	listDevices = function(cb){
		let self = this;
		if(!navigator.mediaDevices){
			//Notifications.notify('We can only get your media in an https enviroment',7000,'error','toast-bottom-left');
			cb(false);
			return false;
		}
		navigator.mediaDevices.enumerateDevices().then(function(devices){
			if(devices != undefined){
				self.setState({
					availableAudioDevices: [],
					availableVideoDevices: []
				})
				for (let i = 0; i !== devices.length; ++i) {
					const deviceInfo = devices[i];
					if (deviceInfo.kind === 'audioinput') {
						self.setState({
							availableVideoDevices: [...self.state.availableAudioDevices, deviceInfo],
							hasMicrophone: true
						})
					} else if (deviceInfo.kind === 'videoinput') {
						self.setState({
							availableVideoDevices: [...self.state.availableVideoDevices, deviceInfo],
							hasCamera: true
						})
					} else if (deviceInfo.kind === 'audiooutput') {

					} else {
						console.log('Some other kind of source/device: ', deviceInfo);
					}
				}
			}
			if(cb){
				cb(true);
			}
		}).catch(self._handleMediaError);
	}
	_getUserMedia = function(){
		let self = this;
		self.setState({
			mediaStream: '',
			hasCamera: false,
			hasMicrophone: false
		})
		self.listDevices(function(){
			const audioSource = self.state.selectedAudioDevice ? self.state.selectedAudioDevice.deviceId : null;
			const videoSource = self.state.selectedVideoDevice ? self.state.selectedVideoDevice.deviceId : null;
			let constraints = {
				audio: self.state.hasMicrophone,
				video: self.state.hasCamera
			};
			if(audioSource){
				constraints.audio = {deviceId: audioSource ? {exact: audioSource} : undefined};
			}
			if(videoSource){
				constraints.video = {deviceId: videoSource ? {exact: videoSource} : undefined};
			}
			if(navigator.mediaDevices){
				navigator.mediaDevices
				.getUserMedia(constraints)
				.then(function(stream){
					self.setState({
						mediaStream: stream
					})
				})
				.then(function(){
					self.listDevices();
					console.log(`Got media stream: ${self.state.mediaStream}`);
					self.startSending();
				})
				.catch(function(error){
					self.startSending();
					self._handleMediaError(error);
				});
			}
		})
	}
	startSending = () => {
		this.setState({
			joinedRoom: true,
			onCall:true
		}, () => {
			let {err,rtcPeer} = SendVideo(this.socket,this.props.user_id, this.state.mediaStream);
			if(!err){
				this.setState({
					rtcPeer: rtcPeer
				})
			}
		})
	}
	onCallPage = () => {
		const videoOutput = {
			width: '100%',
			height:'100vh',
			background:'#000'
		}
		const videoInput = {
			width: '200px',
			height:'300px',
			position: 'absolute',
			right: '0',
			top: '0',
		}
		return (
			<div>
				<div className="video__element">
					<video id="videoInput" style={videoInput}  autoPlay></video>
					<video id="videoOutput" style={videoOutput} autoPlay></video>
				</div>
				<CallControls hangup={this.setCallState} />
			</div>
		)
	}
	render() {
		return (
			<div> { this.state.onCall ? this.onCallPage() : <Rate startSending={this.startSending} />	} </div>
		)
	}
}
export default CallPage
		