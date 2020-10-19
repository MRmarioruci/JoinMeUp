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
			onCall: false,
			joinedRoom: false,
			rtcPeer:'',
			peer_user_id: '',
			socket: ''
		}
		this.socket = ''
		this.setCallState = this.setCallState.bind(this)
		this.onCallPage = this.onCallPage.bind(this)
		this.joinRoom = this.joinRoom.bind(this)
		this.startSending = this.startSending.bind(this)
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
		this.socket.on('my video', (msg) => {
			if(!this.state.rtcPeer) return false;
			 this.state.rtcPeer.processAnswer (msg.sdpAnswer, function (error) {
				if (error) return console.error (error);
			});
		});
		this.socket.on('offering media', (msg) => {
			if(msg.user_id != this.props.user_id){
				this.setState({
					peer_user_id: msg.user_id
				}, () => {
					console.log('Peer joined, starting communication')
					StartCommunication(this.props.user_id, msg.user_id, this.socket)
				})
			}
		});
		this.socket.on('started communication', (msg) => {

		});
		this.socket.on('disconnect', (msg) => {
			console.log(msg);
		})
	}
	joinRoom = () => {
		let msg = {
			'user_id': this.props.user_id,
			'room': this.props.match.params.id
		}
		this.socket.emit('join room', msg, (err, success) => {
			if(success){
				this.startSending();
			}
		})
	}
	startSending = () => {
		this.setState({
			joinedRoom: true,
			onCall:true
		}, () => {
			let {err,rtcPeer} = SendVideo(this.socket,this.props.user_id);
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
			background:''
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
			<div>
			{
				this.state.onCall ? this.onCallPage() : <Rate startSending={this.startSending} />
			}
			</div>
		)
	}
}
		
export default CallPage
		