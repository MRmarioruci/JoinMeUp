import React, { Component } from 'react';
import socketClient from "socket.io-client";
import '../css/call.css';
import CallControls from './CallControls';
import Rate from './Rate';
import SendVideo from './functions/SendVideo';
import StartCommunication from './functions/StartCommunication';
import aloneImg from '../images/undraw_Tree_swing_646s.png';
import {CopyToClipboard} from 'react-copy-to-clipboard';

class CallPage extends Component {
	constructor(props) {
		super(props)

		this.state = {
			onCall: true,
			joinedRoom: false,
			rtcPeer:'',
			peer_user_id: '',
			hasAudio: true,
			hasMicrophone: true,
			hasVideo: true,
			hasCamera: true,
			mediaStream: '',
			availableAudioDevices : [],
			availableVideoDevices : [],
			selectedAudioSource: '',
			selectedVideoSource: '',
			peerInfo: false,
			linkCopied: false,
		}
		this.socket = '';
		this.peerMediaStream = null;
		this.triedDefaultMedia = false;
		this.onCallPage = this.onCallPage.bind(this)
		this.joinRoom = this.joinRoom.bind(this)
		this.startSending = this.startSending.bind(this)
		this._changeAudioSource = this._changeAudioSource.bind(this)
		this._changeVideoSource = this._changeVideoSource.bind(this)
		this._handleMediaError = this._handleMediaError.bind(this)
		this._getUserMedia = this._getUserMedia.bind(this)
		this.listDevices = this.listDevices.bind(this)
		this.getPeerVideoIfNeeded = this.getPeerVideoIfNeeded.bind(this)
		this.dispose = this.dispose.bind(this)
		this.setPeerInfo = this.setPeerInfo.bind(this)
		this.link = window.location.host + '/call/' + this.props.match.params.id;
	}
	dispose = () => {
		if(this.state.rtcPeer) this.state.rtcPeer.dispose();
		this.setState({
			rtcPeer: '',
			onCall: false
		})
		let msg = {
			'user_id': this.props.user_id,
			'peer_user_id': this.state.peer_user_id
		}
		this.socket.emit('dispose', msg, () =>{})
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
			this.setPeerInfo(msg);
		});
		this.socket.on('disconnect', (msg) => {
			console.log(msg);
		})
		this.socket.on('peer left', (msg) => {
			var video = document.getElementById('videoOutput');
			this.peerMediaStream = video.srcObject.clone();
			video.srcObject = null;
			video.srcObject = this.peerMediaStream;
			this.setPeerInfo(null);
		})
		this.socket.on('peer edited media', (msg) => {
			this.setPeerInfo(msg);
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
	setPeerInfo = (info) => {
		this.setState({
			peerInfo: info
		})
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
					if(user.id !== this.props.user_id){
						this.setPeerInfo(user);
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
		this._getUserMedia();
	}
	_changeVideoSource = (source) => {
		this.setState({
			selectedVideoDevice: source
		})
		this._getUserMedia();
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
							availableAudioDevices: [...self.state.availableAudioDevices, deviceInfo],
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
				if(!self.state.selectedAudioDevice){
					self.setState({
						selectedAudioDevice: self.state.availableAudioDevices[0],
					})
				}
				if(!self.state.selectedVideoDevice){
					self.setState({
						selectedVideoDevice: self.state.availableVideoDevices[0],
					})
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
		return (
			<div>
				<div className="video__element">
					<video id="videoInput" className="video__input"  autoPlay></video>
					{
						!this.state.peerInfo &&
						<div className="video__text">
							<img src={aloneImg} className="img-responsive" />
							<h3>Waiting for participants to join...</h3>
							<div className="copy__clip">
								{this.link} &nbsp;
								<CopyToClipboard text={this.link} onCopy={ () => { this.setState({linkCopied:true} )}}>
									<button className="btn btn-success" title="Copy to clipboard">
										<i className="far fa-clipboard"></i>&nbsp;
										{this.state.linkCopied ? <span> Copied!</span> : <span> Copy</span>}
									</button>
								</CopyToClipboard>
							</div>
						</div>
					}
					<video id="videoOutput" className="video__output" autoPlay></video>
					{
						this.state.peerInfo &&
						<div className="peer__info">
							<span>{this.state.peerInfo.username}</span>
							&nbsp;
							<div className="vertical__bar"></div>
							&nbsp;
							<span>
								{this.state.peerInfo.hasAudio ? <i className="fas fa-microphone-alt"></i> : <i className="fas fa-microphone-alt-slash"></i>}
							</span>
							&nbsp;
							<span>
								{this.state.peerInfo.hasVideo ? <i className="fas fa-video"></i> : <i className="fas fa-video-slash"></i>}
							</span>
						</div>
					}
				</div>
				<CallControls hangup={this.dispose}
					socket={this.socket}
					user_id={this.props.user_id}
					availableAudioDevices={this.state.availableAudioDevices}
					availableVideoDevices={this.state.availableVideoDevices}
					selectedAudioDevice={this.state.selectedAudioDevice}
					selectedVideoDevice={this.state.selectedVideoDevice}
					changeAudioSource={this._changeAudioSource}
					changeVideoSource={this._changeVideoSource}
				/>
			</div>
		)
	}
	render() {
		return (
			<div> { this.state.onCall ? this.onCallPage() : <Rate room_id={this.props.match.params.id} startSending={this._getUserMedia} />	} </div>
		)
	}
}
export default CallPage
