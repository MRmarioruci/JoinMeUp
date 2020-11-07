import React, { useState } from 'react'
import loginImage from '../images/undraw_unlock_24mb.svg';
import { useHistory } from "react-router-dom";

function Login(props) {
	const [username, setUsername] = useState(props.username)
	const [password, setPassword] = useState('')
	const [errorMessage, setError] = useState('')
	const history = useHistory();
	const login = async () => {
		let o = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: username, password: password })
		};
		const response = await fetch('/login', o);
		const {status,data} = await response.json();
		if(status == 'ok'){
			history.push('/');
			props.updateAppState(data.username, data.user_id);
		}else{
			if(data == 'register'){
				setError('It seems that you have not registered. Please register in order to continue.');
			}else if(data === 'invalid pass'){
				setError('Your password is incorrect.')
			}
		}
	}
	return (
		<div>
			<center>
				<img src={loginImage} className="login__logo" />
			</center>
			<h4>Welcome back!</h4>
			<input type="text" value={username} onChange={e => { setUsername(e.target.value) }} className="form-control login__input bg-light border-0 small" placeholder="Enter your username" />
			<input type="password" value={password} onChange={e => { setPassword(e.target.value) }} className="form-control login__input bg-light border-0 small" placeholder="Enter your password" />
			<div className="text-danger">
				{ errorMessage }
			</div>
			<button style={{'width':'320px'}} onClick={login} className="btn btn-primary">Login</button>
			<div>
				OR
			</div>
			<div>
				Don't have an account? <a className="label__link" href="/registration">Register</a>
			</div>
		</div>
	)
}

export default Login
