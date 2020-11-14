import React, { useState } from 'react'
import coverImage from '../images/4110950.png';
import coverImageInverted from '../images/4110950-inv.png';
import Login from './Login';
import Registration from './Registration';
import '../css/web.css';
import {Route, BrowserRouter as Router, Switch} from 'react-router-dom';

function Forms(props) {
	const [password, setPassword] = useState('')
	const [showRegistration, setRegistration] = useState(false);
	let currentPage = !showRegistration ? <Login username={props.username} setRegistration={setRegistration}></Login> : <Registration></Registration>;
	return (
		<>
			<Router>
				<Switch>
					<Route path="/" exact>
						<div className="web">
							<div className="web__left">
								<img src={props.theme == 'white' ? coverImage : coverImageInverted} className="web__cover" alt="logo" />
							</div>
							<div className="web__right">
								<div className="web__right-inner">
									<h3>One to one video calls made easy.</h3>
									<h4>Connect with friends, family, work instantly without any registration.<br /> Just enter a username and enjoy.</h4>
								</div>
								<br/>
								<div className="text-center">
									<a className="btn btn-primary btn-200" href="login">
										Login
									</a>
									<div className="vertical__separator"></div>
									<a className="btn btn-secondary btn-200" href="registration">
										Register
									</a>
								</div>
							</div>
						</div>
					</Route>
					<Route path="/login" exact render={(routeProps) => (
						<Login {...routeProps} {...props} />
					)}/>
					<Route path="/registration" render={(routeProps) => (
						<Registration {...routeProps} {...props} />
					)}/>
				</Switch>
				{/* compCurrentScreen */}
			</Router>
		</>
	)
}

export default Forms