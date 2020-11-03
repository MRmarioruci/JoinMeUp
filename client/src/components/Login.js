import React, { useState } from 'react'
import loginImage from '../images/undraw_unlock_24mb.svg';

function Login(props) {
	const [username, setUsername] = useState(props.username)
	const [password, setPassword] = useState('')

	const login = async () => {
		let o = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: username, password: password })
		};
		const response = await fetch('/login', o);
		const {status,data} = await response.json();
		console.log(status, data);
		/* props.setRegistration */
	/* 	if(status == 'ok'){
			if(data){
				//props.updateAppState(data.username,data.user_id);
			}
		}else{
			if(data == 'logged'){
				props.checkIfLoggedIn();
			}else if(data === 'exists'){
				alert('username exists');
			}
		} */
	}
	return (
		<div>
			<center>
				<img src={loginImage} class="login__logo" />
			</center>
			<input type="text" value={username} onChange={e => { setUsername(e.target.value) }} className="form-control login__input bg-light border-0 small" placeholder="Enter your username" />
			<input type="text" value={password} onChange={e => { setPassword(e.target.value) }} className="form-control login__input bg-light border-0 small" placeholder="Enter your password" />
			<button style={{'width':'320px'}} onClick={login} className="btn btn-primary">Login</button>
		</div>
	)
}

export default Login
