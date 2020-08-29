import React, { Component } from 'react'
import '../css/call.css'
import CallControls from './CallControls'
import Rate from './Rate'
import socketClient from "socket.io-client";

class CallPage extends Component {
	constructor(props) {
		super(props)

		this.state = {
			onCall:false
		}
		this.setCallState = this.setCallState.bind(this)
		this.onCallPage = this.onCallPage.bind(this)
	}
	setCallState = (newState) => {
		this.setState({
			onCall:newState
		})
	}
	componentDidMount(){
		const socket = socketClient('http://localhost:5000');
		console.log(socket);
		this.setCallState(true)
		console.log(this.props.match.params.id);
	}
	onCallPage = () => {
		return (
			<div>
				<div className="video__element">
				</div>
				<CallControls hangup={this.setCallState} />
			</div>
		)
	}
	render() {
		return (
			<div>
				{
					this.state.onCall ? this.onCallPage() : <Rate setCallState={this.setCallState} />
				}
			</div>
		)
	}
}

export default CallPage
