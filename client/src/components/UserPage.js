import React, { Component } from 'react'
import callImage from '../images/start_call.svg';
import '../css/main.css';
import {Modal, Button} from 'react-bootstrap';
import selfieImage from '../images/selfie.svg';
import joinImage from '../images/join.svg';
import {Link} from 'react-router-dom';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import History from './History';

class UserPage extends Component {
	constructor(props) {
		super(props)

		this.state = {
			showStartCallModal:false,
			showJoinCallModal:false,
			roomName: '',
			linkCopied:false,
			roomExists: false,
		}
		this.showModal = this.showModal.bind(this)
		this.closeModal = this.closeModal.bind(this)
		this.onRoomNameChange = this.onRoomNameChange.bind(this)
	}
	showModal(target){
		let newState = {[target]:true};
		this.setState(newState);
	}
	closeModal(target){
		let newState = {[target]:false};
		this.setState(newState);
	}
	onRoomNameChange(event){
		this.setState({
			roomName: event.target.value,
			linkCopied:false,
		}, async () => {
			let o = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ roomName: this.state.roomName })
			};
			const response = await fetch('/roomExists', o);
			const {status,data} = await response.json();
			if(status == 'ok'){
				this.setState({
					roomExists:false
				})
			}else{
				if(data === 'not logged'){
					alert('not logged in');
				}else{
					this.setState({
						roomExists: true
					})
				}
			}
		})
	}
	renderLinkShare(){
		let host = window.location.host;
		let link = host + '/call/' + this.state.roomName;
		return (
			<div>
				Share this group link for friends to join
				<div>
					<input className="form-control login__username bg-light border-0 small inline__block" disabled value={link}/>
					&nbsp;&nbsp;
					<CopyToClipboard text={link} onCopy={ () => { this.setState({linkCopied:true} )}}>
						<button className="btn btn-success" title="Copy to clipboard">
							<i className="far fa-clipboard"></i>&nbsp;
							{this.state.linkCopied ? <span> Copied!</span> : <span> Copy</span>}
						</button>
        			</CopyToClipboard>
				</div>
			</div>
		);
	}
	render() {
		const {roomName, roomExists} = this.state;
		const shareLink = roomName && !roomExists ? this.renderLinkShare() : '';
		return (
			<div>
				<h2>Welcome <span className="label__link">{this.props.username}</span>.</h2>
				<img src={callImage} className="call__image" alt="call image" />
				<h3>
					Start a call or join a room
				</h3>
				<div>
					<button className="btn btn-primary" onClick={ () => this.showModal('showStartCallModal')}>Start call</button>
					&nbsp;&nbsp;
					<button className="btn btn-light" onClick={ () => this.showModal('showJoinCallModal')}>Join room</button>
				</div>
				<History/>
				<Modal show={this.state.showStartCallModal} onHide={ () => this.closeModal('showStartCallModal')} size="lg">
					<Modal.Header closeButton>
						<Modal.Title></Modal.Title>
					</Modal.Header>
					<Modal.Body className="call__start-modal">
						<img className="call__start-img" src={selfieImage} alt="call start" />
						<div>
							Create a new room and share with friends
						</div>
						<input type="text" value={roomName} onChange={ this.onRoomNameChange } className="form-control login__username bg-light border-0 small" placeholder="Enter a room name" />
						<div>
						{
							roomExists && <div className="text-danger">Room name is taken. Please use another name or join the room</div>
						}
						</div>
						{ shareLink }
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={ () => this.closeModal('showStartCallModal')}>
							Close
						</Button>
						{
							(roomName && !roomExists) &&
							<Link to={`/call/${roomName}`} className="btn btn-primary" onClick={ () => this.closeModal('showStartCallModal')}>
								Start
							</Link>
						}
					</Modal.Footer>
				</Modal>
				<Modal show={this.state.showJoinCallModal} onHide={ () => this.closeModal('showJoinCallModal')} size="lg">
					<Modal.Header closeButton>
						<Modal.Title></Modal.Title>
					</Modal.Header>
					<Modal.Body className="call__start-modal">
						<img className="call__start-img" src={joinImage} alt="join call" />
						<div>
							Join your friends, they are waiting for you.
						</div>
						<input type="text" value={roomName} onChange={ this.onRoomNameChange } className="form-control login__username bg-light border-0 small" placeholder="Enter room name" />
						{ shareLink }
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={ () => this.closeModal('showJoinCallModal')}>
							Close
						</Button>
						<Link to={`/call/${roomName}`} className="btn btn-primary" disabled={roomName ? false : true} onClick={ () => this.closeModal('showStartCallModal')}>
							Join now
						</Link>
					</Modal.Footer>
				</Modal>
			</div>
		)
	}
}

export default UserPage
