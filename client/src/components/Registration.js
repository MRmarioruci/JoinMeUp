import React, { useState } from 'react';
import registrationImage from '../images/login.svg';
import { useHistory } from "react-router-dom";

function Registration(props) {
	const [username, setUsername] = useState(props.username);
	const [password, setPassword] = useState('');
	let history = useHistory();
	console.log(props);
	const register = async () => {
		let o = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: username , password: password})
		};
		const response = await fetch('/register', o);
		const {status,data} = await response.json();
		if(status == 'ok'){
			if(data){
				history.goBack();
				props.updateAppState(data.username,data.user_id);
			}
		}else{
			if(data == 'logged'){
				history.goBack();
				props.checkIfLoggedIn();
			}else if(data === 'exists'){
				alert('username exists');
			}
		}
	}
	return (
		<div>
			<center>
				<img src={registrationImage} className="login__logo" />
			</center>
			<input type="text" value={username} onChange={e => { setUsername(e.target.value) }} className="form-control login__input bg-light border-0 small" placeholder="Enter a username" />
			<input type="text" value={password} onChange={e => { setPassword(e.target.value) }} className="form-control login__input bg-light border-0 small" placeholder="Enter a password" />
			<button style={{'width':'320px'}} onClick={register} className="btn btn-primary">Register</button>
		</div>
	)
}

export default Registration
