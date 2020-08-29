import React, {useEffect} from 'react'
import '../css/call.css'
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

function CallControls(props) {
	useEffect(() => {
		tippy('[data-tippy-content]');
	}, [])
	return (
		<div className="call__controls">
			<button id="microphone" className="btn btn-light btn-round zoom__on-hover" data-tippy-content="Toggle microphone">
				<i className="fas fa-microphone-alt-slash"></i>
			</button>
			&nbsp;
			<button className="btn btn-light btn-round zoom__on-hover" data-tippy-content="Toggle video">
				<i className="fas fa-video"></i>
			</button>
			&nbsp;
			<button onClick={() => { props.hangup() }} className="btn btn-danger btn-round zoom__on-hover" data-tippy-content="Hang up">
				<i className="fas fa-phone-slash"></i>
			</button>
			&nbsp;
			<button className="btn btn-light btn-round zoom__on-hover" data-tippy-content="Screen share">
				<i className="fas fa-clone"></i>
			</button>
			&nbsp;
			<button className="btn btn-light btn-round zoom__on-hover" data-tippy-content="Options">
				<i className="fas fa-cog"></i>
			</button>
		</div>
	)
}

export default CallControls
