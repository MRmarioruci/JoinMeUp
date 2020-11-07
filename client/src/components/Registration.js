import React, { useState } from 'react';
import registrationImage from '../images/login.svg';
import { useHistory } from "react-router-dom";

function Registration(props) {
	const [username, setUsername] = useState(props.username);
	const [password, setPassword] = useState('');
	const [errorMessage, setError] = useState('');
	const history = useHistory();

	const register = async () => {
		setError('');
		let o = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: username , password: password})
		};
		const response = await fetch('/register', o);
		const {status,data} = await response.json();
		if(status == 'ok'){
			if(data){
				history.push('/');
				props.updateAppState(data.username,data.user_id);
			}
		}else{
			if(data === 'logged'){
				history.push('/');
				props.checkIfLoggedIn();
			}else if(data === 'exists'){
				setError('Username exists');
			}else{
				setError('An error occured');
			}
		}
	}
	return (
		<div>
			<center>
				<img src={registrationImage} className="login__logo" />
			</center>
			<h4>Register quickly and enjoy!</h4>
			<input type="text" value={username} onChange={e => { setUsername(e.target.value) }} className="form-control login__input bg-light border-0 small" placeholder="Enter a username" />
			<input type="password" value={password} onChange={e => { setPassword(e.target.value) }} className="form-control login__input bg-light border-0 small" placeholder="Enter a password" />
			<div className="text-danger">
				{ errorMessage }
			</div>
			<button style={{'width':'320px'}} onClick={register} className="btn btn-primary">Register</button>
			<div>
				OR
			</div>
			<div>
				Already have an account? <a className="label__link" href="/login">Login</a>
			</div>
		</div>
	)
}

export default Registration
